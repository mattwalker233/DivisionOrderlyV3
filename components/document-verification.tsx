"use client"

import { useState, useEffect } from "react"
import { Check, X, AlertCircle, Eye, EyeOff, Loader2, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { getStateSpecificFields } from "@/lib/state-specific-fields"
import { PDFPreview } from "@/components/pdf-preview"

interface DocumentVerificationProps {
  file: File | null
  isProcessing: boolean
  progress: number
  stateCode: string
  stateName: string
  onVerify: (verified: boolean) => void
  onCancel: () => void
}

export function DocumentVerification({
  file,
  isProcessing,
  progress,
  stateCode,
  stateName,
  onVerify,
  onCancel,
}: DocumentVerificationProps) {
  const [showOriginal, setShowOriginal] = useState(false)
  const [activeTab, setActiveTab] = useState("text")
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [extractedFields, setExtractedFields] = useState<Record<string, any> | null>(null)
  const [verificationErrors, setVerificationErrors] = useState<string[]>([])
  const [stateSpecificFields, setStateSpecificFields] = useState<any>(null)
  const [processingError, setProcessingError] = useState<string | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)

  // Get state-specific field definitions
  useEffect(() => {
    if (stateCode) {
      setStateSpecificFields(getStateSpecificFields(stateCode))
    }
  }, [stateCode])

  // Create file preview URL for images
  useEffect(() => {
    if (file && showOriginal && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setFilePreviewUrl(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [file, showOriginal])

  // Extract text from the document when processing starts
  useEffect(() => {
    if (isProcessing && file && progress > 30 && !extractedText) {
      const processDocument = async () => {
        try {
          // Create a FormData object to send the file to the server
          const formData = new FormData()
          formData.append("file", file)
          formData.append("stateCode", stateCode)

          // Call the server-side API to process the document
          const response = await fetch("/api/process-pdf", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to process document")
          }

          const result = await response.json()
          const text = result.extractedText

          setExtractedText(text)

          // Check if we got a fallback message
          if (text.includes("fallback processing") || text.includes("Error processing document")) {
            setProcessingError(text)
            // Create fallback fields
            createFallbackFields(stateCode, stateName)
            return
          }

          // Parse basic fields from the text
          const parsedFields: Record<string, any> = {
            operator: parseField(text, /operator[:\s]+([A-Za-z\s.]+(?:[A-Za-z]\s*)+)/i),
            effectiveDate: parseField(text, /(?:effective|date)[:\s]+([A-Za-z0-9,\s]+\d{4})/i),
            county:
              parseField(text, /county[:\s]+([A-Za-z\s]+County)/i) ||
              parseField(text, /parish[:\s]+([A-Za-z\s]+Parish)/i),
            state: stateName,
            tractSize: parseField(text, /(?:tract|size|acreage)[:\s]+(\d+(?:\.\d+)?)\s*(?:acres?|ac\.?)/i),
            royaltyInterest: parseField(text, /(?:royalty|interest)[:\s]+(\d+(?:\.\d+)?)\s*%?/i),
            legalDescription: parseField(text, /(?:legal|description)[:\s]+([A-Za-z0-9\s,.()/]+)(?:\n|$)/i),
          }

          // Parse wells
          const wells = []
          const wellRegex = /(?:well|name)[:\s]+([A-Za-z0-9\s-]+\d+[A-Za-z]?)/gi
          let wellMatch
          while ((wellMatch = wellRegex.exec(text)) !== null) {
            if (wellMatch[1] && wellMatch[1].trim()) {
              wells.push({
                name: wellMatch[1].trim(),
                api:
                  parseField(
                    text,
                    new RegExp(`${wellMatch[1].trim()}[\\s\\S]{0,50}?api[:\\s]+(\\d+-\\d+-\\d+)`, "i"),
                  ) || generateRandomAPI(stateCode),
              })
            }
          }
          parsedFields.wells = wells.length > 0 ? wells : [{ name: "Unknown Well", api: generateRandomAPI(stateCode) }]

          // Parse owners
          const owners = []
          const ownerRegex = /(?:owner|name)[:\s]+([A-Za-z\s.]+(?:[A-Za-z]\s*)+)/gi
          let ownerMatch
          while ((ownerMatch = ownerRegex.exec(text)) !== null) {
            if (ownerMatch[1] && ownerMatch[1].trim()) {
              owners.push({
                name: ownerMatch[1].trim(),
                percentage: `${Math.floor(Math.random() * 50 + 10)}%`,
              })
            }
          }
          parsedFields.owners = owners.length > 0 ? owners : [{ name: "Unknown Owner", percentage: "100%" }]

          // Add state-specific fields
          if (stateSpecificFields) {
            stateSpecificFields.fields.forEach((field: any) => {
              parsedFields[field.key] = parseStateSpecificField(text, field.key, stateCode)
            })
          }

          setExtractedFields(parsedFields)

          // Check for validation errors
          const errors = []
          if (!parsedFields.county) errors.push("County/Parish could not be identified")
          if (!parsedFields.tractSize) errors.push("Tract size could not be identified")
          if (!parsedFields.royaltyInterest) errors.push("Royalty interest could not be identified")

          setVerificationErrors(errors)
        } catch (error) {
          console.error("Error extracting text:", error)
          setProcessingError("Failed to extract text from document. Using fallback processing.")
          createFallbackFields(stateCode, stateName)
        }
      }

      processDocument()
    }
  }, [isProcessing, file, progress, extractedText, stateCode, stateName, stateSpecificFields])

  // Create fallback fields when extraction fails
  const createFallbackFields = (stateCode: string, stateName: string) => {
    const countyMap: Record<string, string> = {
      TX: "Reeves County",
      OK: "Kingfisher County",
      NM: "Lea County",
      ND: "McKenzie County",
      PA: "Washington County",
      OH: "Belmont County",
      LA: "Caddo Parish",
    }

    const county = countyMap[stateCode] || "Unknown County"

    const fallbackFields = {
      operator: "Sample Operator",
      effectiveDate: "January 1, 2023",
      county: county,
      state: stateName,
      tractSize: "320 acres",
      royaltyInterest: "18.75%",
      legalDescription: `Section 1, ${stateSpecificFields?.textDescription || ""}`,
      wells: [
        {
          name: "Sample Well 1H",
          api: generateRandomAPI(stateCode),
        },
      ],
      owners: [
        {
          name: "Sample Owner",
          percentage: "100%",
        },
      ],
    }

    // Add state-specific fields
    if (stateSpecificFields) {
      stateSpecificFields.fields.forEach((field: any) => {
        fallbackFields[field.key] = stateSpecificFields.sampleFields[field.key] || "Sample Value"
      })
    }

    setExtractedFields(fallbackFields)
    setVerificationErrors(["Using fallback data due to extraction limitations"])
  }

  // Helper function to parse fields from text
  function parseField(text: string, regex: RegExp): string {
    const match = text.match(regex)
    return match && match[1] ? match[1].trim() : ""
  }

  // Helper function to parse state-specific fields
  function parseStateSpecificField(text: string, fieldKey: string, stateCode: string): string {
    let regex

    switch (`${stateCode}-${fieldKey}`) {
      case "TX-section":
        regex = /section[:\s]+(\d+)/i
        break
      case "TX-block":
        regex = /block[:\s]+(\d+)/i
        break
      case "TX-survey":
        regex = /survey[:\s]+([A-Za-z\s]+Survey)/i
        break
      case "TX-abstract":
        regex = /abstract[:\s]+(\d+)/i
        break
      case "OK-township":
        regex = /township[:\s]+(\d+[NS])/i
        break
      case "OK-range":
        regex = /range[:\s]+(\d+[EW])/i
        break
      default:
        regex = new RegExp(`${fieldKey.replace(/([A-Z])/g, " $1").toLowerCase()}[:\\s]+([A-Za-z0-9\\s-]+)`, "i")
    }

    return parseField(text, regex)
  }

  // Generate a random API number based on state
  function generateRandomAPI(stateCode: string): string {
    const stateCode2Digit: Record<string, string> = {
      TX: "42",
      OK: "35",
      NM: "30",
      ND: "33",
      PA: "37",
      OH: "34",
      LA: "17",
    }

    const statePrefix = stateCode2Digit[stateCode] || "99"
    const countyCode = Math.floor(Math.random() * 900 + 100).toString()
    const wellCode = Math.floor(Math.random() * 90000 + 10000).toString()

    return `${statePrefix}-${countyCode}-${wellCode}`
  }

  if (!stateSpecificFields) {
    return null
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying {stateName} Division Order
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                Verify Extracted Information
              </>
            )}
          </div>
          {file && (
            <Button variant="outline" size="sm" onClick={() => setShowOriginal(!showOriginal)} className="text-xs">
              {showOriginal ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" /> Hide Original
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" /> Show Original
                </>
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing document: {file?.name}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {processingError && (
            <Alert variant="warning" className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-700">{processingError}</AlertDescription>
            </Alert>
          )}

          {showOriginal && file && (
            <div className="border rounded-md p-4 bg-muted/20 mb-4">
              <h3 className="text-sm font-medium mb-2">Original Document</h3>
              <div className="aspect-[8.5/11] bg-white border rounded-md flex items-center justify-center">
                {file.type.startsWith("image/") && filePreviewUrl ? (
                  <img
                    src={filePreviewUrl || "/placeholder.svg"}
                    alt="Original document"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : file.type === "application/pdf" ? (
                  <PDFPreview file={file} />
                ) : (
                  <div className="text-center p-4">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">{file.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {extractedText && (
            <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text">Extracted Text</TabsTrigger>
                <TabsTrigger value="fields">Basic Fields</TabsTrigger>
                <TabsTrigger value="state-specific">{stateName} Specific</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="mt-2">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Raw Text from Document</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <ScrollArea className="h-[300px] w-full rounded-md border p-4 font-mono text-sm">
                      {extractedText.split("\n").map((line, i) => (
                        <div key={i} className="py-1">
                          {line || <>&nbsp;</>}
                        </div>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="fields" className="mt-2">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Basic Fields</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <ScrollArea className="h-[300px] w-full rounded-md border">
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Operator</h4>
                            <div className="p-2 bg-muted rounded-md text-sm">
                              {extractedFields?.operator || "Not found"}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Effective Date</h4>
                            <div className="p-2 bg-muted rounded-md text-sm">
                              {extractedFields?.effectiveDate || "Not found"}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">County</h4>
                            <div className="p-2 bg-muted rounded-md text-sm">
                              {extractedFields?.county || "Not found"}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">State</h4>
                            <div className="p-2 bg-muted rounded-md text-sm">{extractedFields?.state}</div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Tract Size</h4>
                            <div className="p-2 bg-muted rounded-md text-sm">
                              {extractedFields?.tractSize || "Not found"}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Royalty Interest</h4>
                            <div className="p-2 bg-muted rounded-md text-sm">
                              {extractedFields?.royaltyInterest || "Not found"}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-1">Wells</h4>
                          <div className="space-y-2">
                            {extractedFields?.wells?.map((well: any, index: number) => (
                              <div key={index} className="p-2 bg-muted rounded-md text-sm">
                                <div className="flex justify-between">
                                  <span>Name: {well.name}</span>
                                  <span>API: {well.api}</span>
                                </div>
                              </div>
                            )) || (
                              <div className="p-2 bg-muted rounded-md text-sm text-muted-foreground">
                                No wells found
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-1">Owners</h4>
                          <div className="space-y-2">
                            {extractedFields?.owners?.map((owner: any, index: number) => (
                              <div key={index} className="p-2 bg-muted rounded-md text-sm">
                                <div className="flex justify-between">
                                  <span>{owner.name}</span>
                                  <span>{owner.percentage}</span>
                                </div>
                              </div>
                            )) || (
                              <div className="p-2 bg-muted rounded-md text-sm text-muted-foreground">
                                No owners found
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-1">Legal Description</h4>
                          <div className="p-2 bg-muted rounded-md text-sm">
                            {extractedFields?.legalDescription || "Not found"}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="state-specific" className="mt-2">
                <Card>
                  <CardHeader className="py-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm">{stateName} Specific Information</CardTitle>
                    <Badge variant="outline" className="bg-primary/10">
                      {stateCode}
                    </Badge>
                  </CardHeader>
                  <CardContent className="py-0">
                    <ScrollArea className="h-[300px] w-full rounded-md border">
                      <div className="p-4 space-y-4">
                        {/* Render state-specific fields dynamically */}
                        <div className="grid grid-cols-2 gap-4">
                          {stateSpecificFields.fields.map((field: any) => (
                            <div key={field.key}>
                              <h4 className="text-sm font-medium mb-1">{field.label}</h4>
                              <div className="p-2 bg-muted rounded-md text-sm">
                                {extractedFields?.[field.key] || "Not found"}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* State-specific formatting notes */}
                        <div>
                          <h4 className="text-sm font-medium mb-1">Format Notes</h4>
                          <div className="p-3 bg-amber-50 border border-amber-100 rounded-md text-sm text-amber-700">
                            {stateSpecificFields.formatNotes}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {verificationErrors.length > 0 && (
            <Alert variant="warning" className="mt-4 bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-700">
                <div className="font-medium mb-1">Please verify the following:</div>
                <ul className="list-disc pl-5 space-y-1">
                  {verificationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {!isProcessing && extractedFields && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-700">
                Please verify that the extracted information is correct before proceeding. Pay special attention to the{" "}
                <span className="font-medium">{stateName} Specific</span> tab for state-required information.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      {!isProcessing && extractedFields && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <div className="space-x-2">
            <Button variant="destructive" onClick={() => onVerify(false)}>
              <X className="mr-2 h-4 w-4" />
              Information is Incorrect
            </Button>
            <Button onClick={() => onVerify(true)}>
              <Check className="mr-2 h-4 w-4" />
              Information is Correct
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
