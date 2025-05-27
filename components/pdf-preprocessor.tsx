"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { FileText, AlertCircle, Check, Download, RefreshCw, Edit2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { preprocessPDF, type ExtractedField, type PreprocessedDocument } from "@/lib/pdf-preprocessor"

interface PDFPreprocessorProps {
  stateCode: string
  stateName: string
  companyId: string
  companyName: string
}

export function PDFPreprocessor({ stateCode, stateName, companyName }: PDFPreprocessorProps) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [preprocessedData, setPreprocessedData] = useState<PreprocessedDocument | null>(null)
  const [processingStage, setProcessingStage] = useState<string | null>(null)
  const [editableFields, setEditableFields] = useState<ExtractedField[]>([])
  const [isEditing, setIsEditing] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile)
        setError(null)
        // Automatically start processing
        processFile(droppedFile)
      } else {
        setError("Please upload a PDF file")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile)
        setError(null)
        // Automatically start processing
        processFile(selectedFile)
      } else {
        setError("Please upload a PDF file")
      }
    }
  }

  const processFile = useCallback(
    async (fileToProcess: File) => {
      setIsProcessing(true)
      setProgress(0)
      setProcessingStage("Reading PDF file...")
      setPreprocessedData(null)
      setEditableFields([])

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev < 20) return prev + 5
            if (prev < 40) return prev + 3
            if (prev < 60) return prev + 2
            if (prev < 80) return prev + 1
            if (prev < 95) return prev + 0.5
            return prev
          })
        }, 200)

        // Update processing stages
        setTimeout(() => setProcessingStage("Extracting text..."), 1000)
        setTimeout(() => setProcessingStage("Analyzing document structure..."), 2000)
        setTimeout(() => setProcessingStage("Identifying fields..."), 3000)

        // Read the file as ArrayBuffer
        const fileBuffer = await fileToProcess.arrayBuffer()

        // Process the PDF
        const data = await preprocessPDF(fileBuffer)

        clearInterval(progressInterval)
        setProgress(100)
        setProcessingStage("Processing complete!")
        setPreprocessedData(data)
        setEditableFields(data.fields)

        // Show success toast
        toast({
          title: "Document Processed Successfully",
          description: "The division order has been processed and key information extracted.",
        })
      } catch (err) {
        setError("Error processing document. Please try again.")
        console.error("Error processing document:", err)
      } finally {
        setIsProcessing(false)
      }
    },
    [toast],
  )

  const handleFieldChange = (index: number, value: string) => {
    const updatedFields = [...editableFields]
    updatedFields[index] = { ...updatedFields[index], value }
    setEditableFields(updatedFields)
  }

  const handleSaveChanges = () => {
    if (preprocessedData) {
      setPreprocessedData({
        ...preprocessedData,
        fields: editableFields,
      })
      setIsEditing(false)

      toast({
        title: "Changes Saved",
        description: "Your edits to the extracted fields have been saved.",
      })
    }
  }

  const handleDownloadJSON = () => {
    if (!preprocessedData) return

    const dataToDownload = {
      ...preprocessedData,
      fields: editableFields,
    }

    const dataStr = JSON.stringify(dataToDownload, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `${companyName.replace(/\s+/g, "-")}-division-order-preprocessed.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Download Complete",
      description: "The preprocessed data has been downloaded as JSON.",
    })
  }

  const handleReset = () => {
    setFile(null)
    setPreprocessedData(null)
    setEditableFields([])
    setProgress(0)
    setProcessingStage(null)
    setError(null)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
        <AlertCircle className="h-4 w-4 text-blue-500 dark:text-blue-400" />
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          Upload your division order document to extract key information without requiring AI analysis.
        </AlertDescription>
      </Alert>

      {!preprocessedData && (
        <Card
          className={cn(
            "p-8 border-2 border-dashed transition-all",
            isDragging ? "border-primary bg-primary/5 shadow-lg" : "border-muted-foreground/25",
            file ? "bg-muted/20" : "",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Upload Division Order Document</h3>
              <p className="text-sm text-muted-foreground">Drag and drop your PDF file here or click to browse</p>
            </div>

            {error && (
              <div className="flex items-center text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
              Select File
            </Button>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </div>
        </Card>
      )}

      {isProcessing && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium">{processingStage || "Processing document..."}</h3>
              <Progress value={progress} className="h-2 mt-2" />
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-md">
            <p className="text-sm text-muted-foreground">
              We're analyzing your document to extract key information. This may take a moment...
            </p>
          </div>
        </div>
      )}

      {preprocessedData && !isProcessing && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Document Processed Successfully</h3>
              <p className="text-sm text-muted-foreground">
                The division order has been processed and key information extracted
              </p>
            </div>
          </div>

          <Tabs defaultValue="extracted-fields" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="extracted-fields">Extracted Fields</TabsTrigger>
              <TabsTrigger value="document-text">Document Text</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>

            <TabsContent value="extracted-fields" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Extracted Information</h3>
                <div className="space-x-2">
                  {isEditing ? (
                    <Button size="sm" onClick={handleSaveChanges}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Fields
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-muted/30 p-6 rounded-lg space-y-4">
                {editableFields.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {editableFields.map((field, index) => (
                      <div
                        key={`${field.name}-${index}`}
                        className="border border-gray-200 dark:border-gray-800 rounded-md p-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium capitalize">{field.name.replace(/([A-Z])/g, " $1")}</h4>
                          <Badge
                            variant="outline"
                            className={cn(
                              "bg-opacity-50 border-opacity-50",
                              field.confidence >= 0.9
                                ? "bg-green-50 text-green-700 border-green-200"
                                : field.confidence >= 0.7
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-red-50 text-red-700 border-red-200",
                            )}
                          >
                            {Math.round(field.confidence * 100)}% confidence
                          </Badge>
                        </div>

                        {isEditing ? (
                          <div className="mt-1">
                            <Input
                              value={field.value}
                              onChange={(e) => handleFieldChange(index, e.target.value)}
                              className="w-full"
                            />
                          </div>
                        ) : (
                          <p className="font-medium">{field.value}</p>
                        )}

                        <p className="text-xs text-muted-foreground mt-1">Found on page {field.pageNumber}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No fields were extracted from this document.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="document-text">
              <Card>
                <CardHeader>
                  <CardTitle>Document Text</CardTitle>
                  <CardDescription>
                    Extracted text from the PDF document ({preprocessedData.pageCount} pages)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    <pre className="whitespace-pre-wrap font-mono text-sm">{preprocessedData.text}</pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metadata">
              <Card>
                <CardHeader>
                  <CardTitle>Document Metadata</CardTitle>
                  <CardDescription>Metadata extracted from the PDF document</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(preprocessedData.metadata).length > 0 ? (
                      Object.entries(preprocessedData.metadata).map(([key, value]) => (
                        <div
                          key={key}
                          className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 dark:border-gray-800"
                        >
                          <div className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</div>
                          <div className="col-span-2">{String(value)}</div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No metadata found in this document.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <Button variant="outline" onClick={handleDownloadJSON}>
              <Download className="mr-2 h-4 w-4" />
              Download JSON
            </Button>

            <div className="space-x-3">
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Process Another
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
