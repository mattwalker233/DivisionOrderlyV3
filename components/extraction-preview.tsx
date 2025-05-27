"use client"

import { useState, useEffect } from "react"
import { Check, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface ExtractionField {
  name: string
  status: "pending" | "extracting" | "complete" | "failed"
  confidence?: number
  value?: string | string[] | number
}

interface WellData {
  name: string
  sectionNumber: string
  township: string
  county: string
  netAcres: number
  royaltyInterest: number
  status: "pending" | "extracting" | "complete"
}

interface ExtractionPreviewProps {
  isProcessing: boolean
  progress: number
  operatorName: string
  template?: any
}

export function ExtractionPreview({ isProcessing, progress, operatorName, template }: ExtractionPreviewProps) {
  const [fields, setFields] = useState<ExtractionField[]>([
    { name: "Owner Names", status: "pending" },
    { name: "Document Date", status: "pending" },
    { name: "County", status: "pending" },
    { name: "Legal Description", status: "pending" },
    { name: "Tract Size", status: "pending" },
    { name: "Royalty Interest", status: "pending" },
  ])

  const [wells, setWells] = useState<WellData[]>([])
  const [wellsOpen, setWellsOpen] = useState(true)
  const [wellsIdentified, setWellsIdentified] = useState(false)

  useEffect(() => {
    if (!isProcessing) {
      // Reset fields when not processing
      setFields(fields.map((field) => ({ ...field, status: "pending", confidence: undefined, value: undefined })))
      setWells([])
      setWellsIdentified(false)
      return
    }

    // Start extraction simulation
    const extractionSequence = async () => {
      // Update fields in sequence to simulate extraction process
      const fieldOrder = [0, 1, 2, 3, 4, 5]

      for (const index of fieldOrder) {
        // Skip if already at 100% progress
        if (progress >= 100) break

        // Mark field as extracting
        setFields((current) => current.map((field, i) => (i === index ? { ...field, status: "extracting" } : field)))

        // Wait a random time between 500-1500ms
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

        // Always set confidence to 100%
        const confidence = 100

        // Generate sample values based on field type
        let value: string | string[] | number
        switch (index) {
          case 0: // Owner Names
            value = ["John Smith", "Jane Johnson", "Western Land Trust"]
            break
          case 1: // Document Date
            value = "January 15, 2023"
            break
          case 2: // County
            value = "Reeves County"
            break
          case 3: // Legal Description
            value = "The Northwest Quarter (NW/4) of Section 36, Block 12, PSL Survey"
            break
          case 4: // Tract Size
            value = "640 acres"
            break
          case 5: // Royalty Interest
            value = "0.1875"
            break
          default:
            value = ""
        }

        // Always mark as complete with 100% confidence
        setFields((current) =>
          current.map((field, i) =>
            i === index
              ? {
                  ...field,
                  status: "complete",
                  confidence: confidence,
                  value: value,
                }
              : field,
          ),
        )

        // After processing a few fields, identify wells
        if (index === 2 && !wellsIdentified) {
          await identifyWells()
        }
      }
    }

    const identifyWells = async () => {
      // Simulate well identification process
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add initial wells
      setWells([
        {
          name: "Federal 2H",
          sectionNumber: "Section 36, Block 12",
          township: "Block 12, PSL Survey",
          county: "Reeves County",
          netAcres: 320,
          royaltyInterest: 0.1875,
          status: "pending",
        },
        {
          name: "Federal 3H",
          sectionNumber: "Section 36, Block 12",
          township: "Block 12, PSL Survey",
          county: "Reeves County",
          netAcres: 320,
          royaltyInterest: 0.1875,
          status: "pending",
        },
      ])

      setWellsIdentified(true)

      // Process wells one by one
      await new Promise((resolve) => setTimeout(resolve, 800))
      setWells((current) => current.map((well, i) => (i === 0 ? { ...well, status: "extracting" } : well)))

      await new Promise((resolve) => setTimeout(resolve, 1500))
      setWells((current) => current.map((well, i) => (i === 0 ? { ...well, status: "complete" } : well)))

      await new Promise((resolve) => setTimeout(resolve, 800))
      setWells((current) => current.map((well, i) => (i === 1 ? { ...well, status: "extracting" } : well)))

      await new Promise((resolve) => setTimeout(resolve, 1500))
      setWells((current) => current.map((well, i) => (i === 1 ? { ...well, status: "complete" } : well)))

      // Add a third well that was discovered later in the document
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setWells((current) => [
        ...current,
        {
          name: "State 1H",
          sectionNumber: "Section 37, Block 12",
          township: "Block 12, PSL Survey",
          county: "Reeves County",
          netAcres: 160,
          royaltyInterest: 0.1875,
          status: "extracting",
        },
      ])

      await new Promise((resolve) => setTimeout(resolve, 1500))
      setWells((current) => current.map((well, i) => (i === 2 ? { ...well, status: "complete" } : well)))
    }

    if (progress > 0 && progress < 90) {
      extractionSequence()
    }
  }, [isProcessing, progress, template, wellsIdentified])

  if (!isProcessing && progress === 0) {
    return null
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          {progress < 100 ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Extracting Information
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Extraction Complete
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {progress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing document for {operatorName}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Document Information:</h3>
            <div className="grid gap-3">
              {fields.map((field, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center">
                    {field.status === "pending" && <div className="w-4 h-4 mr-3"></div>}
                    {field.status === "extracting" && <Loader2 className="w-4 h-4 mr-3 animate-spin text-primary" />}
                    {field.status === "complete" && <Check className="w-4 h-4 mr-3 text-green-500" />}
                    {field.status === "failed" && <AlertCircle className="w-4 h-4 mr-3 text-red-500" />}
                    <span
                      className={cn(
                        "text-sm",
                        field.status === "extracting" && "text-primary font-medium",
                        field.status === "failed" && "text-red-500",
                      )}
                    >
                      {field.name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {field.status === "complete" && field.confidence && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                        100% confidence
                      </Badge>
                    )}
                    {field.status === "failed" && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                        Failed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {wells.length > 0 && (
            <Collapsible open={wellsOpen} onOpenChange={setWellsOpen} className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Wells Identified ({wells.length}):</h3>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                    {wellsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="mt-2 space-y-3">
                  {wells.map((well, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="bg-muted px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center">
                          {well.status === "pending" && <div className="w-4 h-4 mr-2"></div>}
                          {well.status === "extracting" && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
                          )}
                          {well.status === "complete" && <Check className="w-4 h-4 mr-2 text-green-500" />}
                          <span className="font-medium">{well.name}</span>
                        </div>
                        {well.status === "complete" && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            100% confidence
                          </Badge>
                        )}
                      </div>
                      {well.status !== "pending" && (
                        <div className="p-3 text-sm grid grid-cols-2 gap-x-4 gap-y-2">
                          <div>
                            <span className="text-muted-foreground">Section:</span>{" "}
                            <span className="font-medium">{well.sectionNumber}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Township:</span>{" "}
                            <span className="font-medium">{well.township}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">County:</span>{" "}
                            <span className="font-medium">{well.county}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Net Acres:</span>{" "}
                            <span className="font-medium">{well.netAcres}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Royalty Interest:</span>{" "}
                            <span className="font-medium">{(well.royaltyInterest * 100).toFixed(2)}%</span>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {progress >= 100 && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                Document processing complete with 100% confidence. All {wells.length} wells identified and processed
                successfully.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
