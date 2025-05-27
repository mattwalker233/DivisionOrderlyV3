"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText, AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { AutoExtraction } from "@/components/auto-extraction"
import type { OperatorData, TemplateData } from "@/lib/types"

interface AddOperatorModalProps {
  stateCode: string
  open: boolean
  onClose: () => void
  onOperatorAdded: (operator: OperatorData) => void
}

export function AddOperatorModal({ stateCode, open, onClose, onOperatorAdded }: AddOperatorModalProps) {
  const [operatorName, setOperatorName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [processingMessage, setProcessingMessage] = useState<string | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const [showAutoExtraction, setShowAutoExtraction] = useState(false)

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
      if (droppedFile.type === "application/pdf" || droppedFile.type.startsWith("image/")) {
        setFile(droppedFile)
        setError(null)

        // Create preview URL for image files
        if (droppedFile.type.startsWith("image/")) {
          const url = URL.createObjectURL(droppedFile)
          setFilePreviewUrl(url)
        } else {
          setFilePreviewUrl(null)
        }
      } else {
        setError("Please upload a PDF or image file")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "application/pdf" || selectedFile.type.startsWith("image/")) {
        setFile(selectedFile)
        setError(null)

        // Create preview URL for image files
        if (selectedFile.type.startsWith("image/")) {
          const url = URL.createObjectURL(selectedFile)
          setFilePreviewUrl(url)
        } else {
          setFilePreviewUrl(null)
        }
      } else {
        setError("Please upload a PDF or image file")
      }
    }
  }

  const handleSubmit = async () => {
    // Validate inputs
    if (!operatorName.trim()) {
      setNameError("Operator name is required")
      return
    } else {
      setNameError(null)
    }

    if (!file) {
      setError("Please upload a sample division order")
      return
    }

    // Show automatic extraction
    setShowAutoExtraction(true)
  }

  const handleExtractionComplete = async (data: any, template: TemplateData) => {
    setIsProcessing(true)
    setProgress(0)
    setProcessingMessage("Creating operator template...")

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 10
          if (newProgress >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return newProgress
        })
      }, 300)

      // In a real implementation, we would use the data to create a template
      // For now, we'll just use a simulated template

      clearInterval(progressInterval)
      setProgress(100)
      setProcessingMessage("Template created successfully!")

      // Create a new operator with the template
      const newOperator: OperatorData = {
        id: `${stateCode.toLowerCase()}-${operatorName.toLowerCase().replace(/\s+/g, "-")}`,
        name: operatorName,
        wells: [], // This would be populated in a real implementation
        template: template, // Use the template created from extraction
      }

      // Add the new operator
      setTimeout(() => {
        onOperatorAdded(newOperator)
        resetForm()
      }, 500)
    } catch (err) {
      console.error("Error processing document:", err)
      setError("Error processing document. Please try again.")
      setIsProcessing(false)
      setShowAutoExtraction(false)
    }
  }

  const resetForm = () => {
    setOperatorName("")
    setFile(null)
    setIsProcessing(false)
    setProgress(0)
    setError(null)
    setNameError(null)
    setProcessingMessage(null)
    setFilePreviewUrl(null)
    setShowAutoExtraction(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleCancelExtraction = () => {
    setShowAutoExtraction(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn("sm:max-w-[525px]", showAutoExtraction && "sm:max-w-[900px]")}>
        <DialogHeader>
          <DialogTitle>{showAutoExtraction ? "Analyzing Document" : "Add New Operator"}</DialogTitle>
          <DialogDescription>
            {showAutoExtraction
              ? "Automatically extracting information from your document to create an operator template."
              : "Add a new operator with a sample division order to establish a baseline format for data extraction."}
          </DialogDescription>
        </DialogHeader>

        {!showAutoExtraction ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="operator-name">Operator Name</Label>
              <Input
                id="operator-name"
                placeholder="Enter operator name"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className={nameError ? "border-red-500" : ""}
              />
              {nameError && <p className="text-xs text-red-500">{nameError}</p>}
            </div>

            <div className="grid gap-2">
              <Label>Sample Division Order</Label>
              <Card
                className={cn(
                  "p-6 border-2 border-dashed transition-all",
                  isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                  file ? "bg-muted/20" : "",
                  error ? "border-red-500" : "",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                  {file ? (
                    <>
                      {filePreviewUrl ? (
                        <div className="w-full mb-2">
                          <img
                            src={filePreviewUrl || "/placeholder.svg"}
                            alt="Document preview"
                            className="max-w-full max-h-[150px] object-contain mx-auto border rounded"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">{file ? file.name : `Upload Sample Document`}</h4>
                    <p className="text-xs text-muted-foreground">
                      {file
                        ? `${(file.size / 1024 / 1024).toFixed(2)} MB · ${file.type}`
                        : "Drag and drop or click to browse"}
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-center text-xs text-destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {error}
                    </div>
                  )}

                  {isProcessing ? (
                    <div className="w-full space-y-2">
                      <Progress value={progress} className="h-1 w-full" />
                      <p className="text-xs text-muted-foreground">{processingMessage}</p>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => document.getElementById("template-upload")?.click()}
                    >
                      {file ? "Change File" : "Select File"}
                    </Button>
                  )}
                  <input
                    id="template-upload"
                    type="file"
                    className="hidden"
                    accept="application/pdf,image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </Card>
              <p className="text-xs text-muted-foreground">
                Upload a sample division order from this operator to establish the data extraction template.
              </p>
            </div>
          </div>
        ) : (
          file && (
            <AutoExtraction
              file={file}
              stateCode={stateCode}
              stateName="Sample State"
              operatorName={operatorName}
              onExtractionComplete={handleExtractionComplete}
              onCancel={handleCancelExtraction}
            />
          )
        )}

        {!showAutoExtraction && file && file.type === "application/pdf" && (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              PDF processing is supported with automatic text extraction. For best results, consider using image files
              (JPG, PNG) of your division orders.
            </AlertDescription>
          </Alert>
        )}

        {!showAutoExtraction && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <span className="mr-2">Processing...</span>
                  <div className="h-4 w-4 rounded-full border-2 border-background border-t-transparent animate-spin"></div>
                </>
              ) : (
                "Process Document"
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
