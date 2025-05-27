"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Highlighter, Save, Trash2, AlertCircle } from "lucide-react"
import { PDFPreview } from "@/components/pdf-preview"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { FieldSelection, TemplateData } from "@/lib/types"

interface DocumentSelectionProps {
  file: File
  stateCode: string
  operatorName: string
  onSelectionsSaved: (selections: FieldSelection[], template: TemplateData) => void
  onCancel: () => void
}

export function DocumentSelection({
  file,
  stateCode,
  operatorName,
  onSelectionsSaved,
  onCancel,
}: DocumentSelectionProps) {
  const [activeTab, setActiveTab] = useState<string>("document")
  const [selectionMode, setSelectionMode] = useState<string | null>(null)
  const [selections, setSelections] = useState<FieldSelection[]>([])
  const [currentSelection, setCurrentSelection] = useState<string>("")
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState<boolean>(false)
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [processingError, setProcessingError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [extractedTextByPage, setExtractedTextByPage] = useState<Record<number, string>>({})

  // Field definitions for selection
  const fieldDefinitions = [
    { id: "tractSize", label: "Tract Size", description: "Total acreage of the tract", color: "bg-blue-500" },
    {
      id: "royaltyInterest",
      label: "Royalty Interest",
      description: "Percentage of royalty interest",
      color: "bg-green-500",
    },
    {
      id: "sectionNumber",
      label: "Section Number",
      description: "Section number of the property",
      color: "bg-purple-500",
    },
    { id: "ownerName", label: "Owner Name", description: "Name of the property owner", color: "bg-amber-500" },
    { id: "wellName", label: "Well Name", description: "Name of the well", color: "bg-pink-500" },
    { id: "county", label: "County", description: "County where the property is located", color: "bg-teal-500" },
    { id: "operator", label: "Operator", description: "Operating company", color: "bg-indigo-500" },
    {
      id: "effectiveDate",
      label: "Effective Date",
      description: "Effective date of the division order",
      color: "bg-orange-500",
    },
  ]

  // Create image preview URL for image files
  useEffect(() => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setImagePreviewUrl(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [file])

  // Process the document to extract text
  useEffect(() => {
    if (file) {
      setIsProcessing(true)
      setProcessingError(null)

      // For now, let's use a simulated text extraction to avoid API issues
      const simulateTextExtraction = async () => {
        try {
          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 1500))

          // Create simulated text for multiple pages
          const pageTexts: Record<number, string> = {}

          // Determine number of pages to simulate
          const pageCount = file.type === "application/pdf" ? Math.max(totalPages, 1) : 1

          for (let i = 1; i <= pageCount; i++) {
            pageTexts[i] = `
DIVISION ORDER - PAGE ${i}
OPERATOR: ${operatorName}
DATE: January 15, 2023
COUNTY: ${stateCode === "TX" ? "Reeves County" : stateCode === "NM" ? "Lea County" : "Sample County"}
STATE: ${stateCode}

${
  i === 1
    ? `LEGAL DESCRIPTION:
Section 14, Township 18S, Range 32E

TRACT SIZE: 320 acres
ROYALTY INTEREST: 18.75%`
    : ""
}

${
  i === 1
    ? `WELL NAME: Sample Well 1H
API: 30-025-45678`
    : ""
}

${i === 2 ? `OWNER INFORMATION:` : ""}
${
  i === 2
    ? `OWNER: John Smith
INTEREST: 50%

OWNER: Southwest Minerals LLC
INTEREST: 50%`
    : ""
}

${
  i === 3
    ? `PAYMENT INFORMATION:
Payment Frequency: Monthly
First Payment Due: March 1, 2023
Payment Method: Direct Deposit`
    : ""
}

This is page ${i} of a simulated ${pageCount}-page document.
In a production environment, we would extract text from the actual document.
            `
          }

          setExtractedTextByPage(pageTexts)
          setExtractedText(pageTexts[currentPage] || "No text extracted for this page")
        } catch (error) {
          console.error("Error in simulated text extraction:", error)
          setProcessingError("Error extracting text. Using fallback text.")
          setExtractedText("Fallback extracted text for demonstration purposes.")
        } finally {
          setIsProcessing(false)
        }
      }

      simulateTextExtraction()
    }
  }, [file, stateCode, operatorName, totalPages, currentPage])

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    // Update the displayed text for the current page
    setExtractedText(extractedTextByPage[pageNumber] || "No text extracted for this page")
  }

  // Handle image load to get dimensions
  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageLoaded(true)
      setImageSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      })
    }
  }

  // Start selection
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectionMode || !containerRef.current) return

    setIsDragging(true)

    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    setStartPoint({ x, y })
    setSelectionBox({ x, y, width: 0, height: 0 })
  }

  // Update selection while dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !startPoint || !containerRef.current || !selectionBox) return

    const rect = containerRef.current.getBoundingClientRect()
    const currentX = (e.clientX - rect.left) / rect.width
    const currentY = (e.clientY - rect.top) / rect.height

    // Calculate the selection box dimensions
    const x = Math.min(startPoint.x, currentX)
    const y = Math.min(startPoint.y, currentY)
    const width = Math.abs(currentX - startPoint.x)
    const height = Math.abs(currentY - startPoint.y)

    setSelectionBox({ x, y, width, height })
  }

  // End selection
  const handleMouseUp = () => {
    if (!isDragging || !selectionBox || !selectionMode) return

    setIsDragging(false)

    // Only add selection if it has some size
    if (selectionBox.width > 0.01 && selectionBox.height > 0.01) {
      // Find the field definition for the current selection mode
      const fieldDef = fieldDefinitions.find((field) => field.id === selectionMode)

      if (fieldDef) {
        const newSelection: FieldSelection = {
          id: `${selectionMode}-${Date.now()}`,
          fieldId: selectionMode,
          fieldLabel: fieldDef.label,
          x: selectionBox.x,
          y: selectionBox.y,
          width: selectionBox.width,
          height: selectionBox.height,
          page: currentPage, // Store the current page number
          color: fieldDef.color,
          text: "", // Will be filled after OCR
        }

        setSelections([...selections, newSelection])

        // Extract text from the selection area if we have extracted text
        if (extractedText) {
          // In a real implementation, we would extract text from the specific area
          // For now, we'll just set a placeholder
          setCurrentSelection(`Selected ${fieldDef.label} on page ${currentPage}`)
        }
      }
    }

    setSelectionBox(null)
  }

  // Remove a selection
  const handleRemoveSelection = (id: string) => {
    setSelections(selections.filter((selection) => selection.id !== id))
  }

  // Save all selections and generate template
  const handleSaveSelections = () => {
    // Create a template from the selections
    const template: TemplateData = {
      fieldLocations: {
        ownerNames: selections
          .filter((s) => s.fieldId === "ownerName")
          .map((s) => ({
            x: s.x,
            y: s.y,
            width: s.width,
            height: s.height,
            page: s.page,
          })),
        wellNames: selections
          .filter((s) => s.fieldId === "wellName")
          .map((s) => ({
            x: s.x,
            y: s.y,
            width: s.width,
            height: s.height,
            page: s.page,
          })),
        county: selections.find((s) => s.fieldId === "county")
          ? {
              x: selections.find((s) => s.fieldId === "county")!.x,
              y: selections.find((s) => s.fieldId === "county")!.y,
              width: selections.find((s) => s.fieldId === "county")!.width,
              height: selections.find((s) => s.fieldId === "county")!.height,
              page: selections.find((s) => s.fieldId === "county")!.page,
            }
          : { x: 0.1, y: 0.3, width: 0.2, height: 0.05, page: 1 },
        sectionNumbers: selections
          .filter((s) => s.fieldId === "sectionNumber")
          .map((s) => ({
            x: s.x,
            y: s.y,
            width: s.width,
            height: s.height,
            page: s.page,
          })),
        acreage: selections
          .filter((s) => s.fieldId === "tractSize")
          .map((s) => ({
            x: s.x,
            y: s.y,
            width: s.width,
            height: s.height,
            page: s.page,
          })),
        royaltyInterest: selections
          .filter((s) => s.fieldId === "royaltyInterest")
          .map((s) => ({
            x: s.x,
            y: s.y,
            width: s.width,
            height: s.height,
            page: s.page,
          })),
      },
      format: {
        headerPosition: "top",
        tablePosition: "middle",
        footerPosition: "bottom",
      },
      sampleData: {
        ownerNames: ["Sample Owner"],
        wellNames: ["Sample Well 1H"],
        county: "Sample County",
        sections: [
          {
            sectionNumber: "Section 1",
            netAcres: 320,
            grossAcres: 640,
            royaltyInterest: 0.1875,
          },
        ],
      },
    }

    onSelectionsSaved(selections, template)
  }

  // Get selections for the current page
  const getCurrentPageSelections = () => {
    return selections.filter((selection) => selection.page === currentPage)
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Highlighter className="h-5 w-5 mr-2 text-primary" />
            Document Field Selection
          </div>
          {totalPages > 1 && (
            <Badge variant="outline" className="ml-2">
              {totalPages} pages
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            Select the important fields in your document by choosing a field type and then dragging to highlight the
            area where that information appears.{" "}
            {totalPages > 1 ? "Use the page navigation controls to move between pages." : ""}
          </AlertDescription>
        </Alert>

        {processingError && (
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700">
              {processingError} You can still continue with field selection.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="document" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="document">Document View</TabsTrigger>
            <TabsTrigger value="selections">Field Selections</TabsTrigger>
          </TabsList>

          <TabsContent value="document" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <div
                  ref={containerRef}
                  className="relative border rounded-md overflow-hidden bg-white"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => setIsDragging(false)}
                >
                  {file.type.startsWith("image/") && imagePreviewUrl ? (
                    <img
                      ref={imageRef}
                      src={imagePreviewUrl || "/placeholder.svg"}
                      alt="Document"
                      className="max-w-full"
                      onLoad={handleImageLoad}
                    />
                  ) : file.type === "application/pdf" ? (
                    <PDFPreview
                      file={file}
                      onPageChange={handlePageChange}
                      currentPage={currentPage}
                      setTotalPages={setTotalPages}
                    />
                  ) : (
                    <div className="p-4 text-center">Unsupported file type</div>
                  )}

                  {/* Render existing selections for the current page */}
                  {getCurrentPageSelections().map((selection) => (
                    <div
                      key={selection.id}
                      className={`absolute border-2 ${selection.color} bg-opacity-20`}
                      style={{
                        left: `${selection.x * 100}%`,
                        top: `${selection.y * 100}%`,
                        width: `${selection.width * 100}%`,
                        height: `${selection.height * 100}%`,
                      }}
                    >
                      <div
                        className={`absolute -top-6 left-0 text-xs px-1 py-0.5 rounded ${selection.color} text-white`}
                      >
                        {selection.fieldLabel}
                      </div>
                    </div>
                  ))}

                  {/* Render current selection box */}
                  {selectionBox && (
                    <div
                      className={`absolute border-2 ${fieldDefinitions.find((f) => f.id === selectionMode)?.color || "bg-blue-500"} bg-opacity-20`}
                      style={{
                        left: `${selectionBox.x * 100}%`,
                        top: `${selectionBox.y * 100}%`,
                        width: `${selectionBox.width * 100}%`,
                        height: `${selectionBox.height * 100}%`,
                      }}
                    />
                  )}
                </div>

                {currentSelection && (
                  <div className="mt-2 p-2 bg-muted rounded-md">
                    <p className="text-sm font-medium">Current Selection:</p>
                    <p className="text-sm">{currentSelection}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Select Field Type</h3>
                <div className="space-y-2">
                  {fieldDefinitions.map((field) => (
                    <Button
                      key={field.id}
                      variant={selectionMode === field.id ? "default" : "outline"}
                      className={cn("w-full justify-start text-left", selectionMode === field.id && "border-primary")}
                      onClick={() => setSelectionMode(field.id)}
                    >
                      <div className={`w-3 h-3 rounded-full mr-2 ${field.color}`} />
                      {field.label}
                    </Button>
                  ))}
                </div>

                <div className="mt-4">
                  <Label className="text-sm">Extracted Text (Page {currentPage})</Label>
                  <ScrollArea className="h-[200px] w-full rounded-md border mt-1 p-2">
                    {isProcessing ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <pre className="text-xs font-mono whitespace-pre-wrap">{extractedText}</pre>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="selections" className="mt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Selected Fields</h3>

              {selections.length === 0 ? (
                <div className="text-center p-4 border rounded-md bg-muted">
                  <p className="text-muted-foreground">No fields selected yet. Go to Document View to select fields.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {fieldDefinitions.map((fieldDef) => {
                    const fieldSelections = selections.filter((s) => s.fieldId === fieldDef.id)
                    if (fieldSelections.length === 0) return null

                    return (
                      <div key={fieldDef.id} className="border rounded-md p-3">
                        <div className="flex items-center mb-2">
                          <div className={`w-3 h-3 rounded-full mr-2 ${fieldDef.color}`} />
                          <h4 className="font-medium">{fieldDef.label}</h4>
                          <Badge className="ml-2" variant="outline">
                            {fieldSelections.length} {fieldSelections.length === 1 ? "selection" : "selections"}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          {fieldSelections.map((selection, index) => (
                            <div
                              key={selection.id}
                              className="flex items-center justify-between bg-muted p-2 rounded-md"
                            >
                              <div>
                                <span className="text-sm">Selection {index + 1}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  Page {selection.page}, ({(selection.x * 100).toFixed(1)}%,{" "}
                                  {(selection.y * 100).toFixed(1)}%)
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveSelection(selection.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive/90"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSaveSelections} disabled={selections.length === 0}>
          <Save className="mr-2 h-4 w-4" />
          Save Field Selections
        </Button>
      </CardFooter>
    </Card>
  )
}
