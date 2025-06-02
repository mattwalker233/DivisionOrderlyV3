"use client"

import AdvancedDocumentProcessor from "./advanced-document-processor"
import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, AlertCircle, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface AIDocumentUploaderProps {
  stateCode: string
  stateName: string
  companyId: string
  companyName: string
}

export function AIDocumentUploader({ stateCode, stateName, companyId, companyName }: AIDocumentUploaderProps) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      } else {
        setError("Please upload a PDF or image file")
      }
    }
  }

  const handleProcessingComplete = (result: { success: boolean; message: string; data: any }) => {
    if (result.success) {
      router.push(`/states/${stateCode.toLowerCase()}/companies/${companyId}`)
    }
  }

  const handleProcessingError = (error: any) => {
    setError(error.message || "An error occurred while processing the document")
  }

  return (
    <div className="space-y-6">
      <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
        <AlertCircle className="h-4 w-4 text-blue-500 dark:text-blue-400" />
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          Upload your division order document to automatically process it. The system will extract key information using Claude AI.
        </AlertDescription>
      </Alert>

      {!file && (
        <Card
          className={cn(
            "p-8 border-2 border-dashed transition-all",
            isDragging ? "border-primary bg-primary/5 shadow-lg" : "border-muted-foreground/25",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Upload Division Order Document</h3>
              <p className="text-sm text-muted-foreground">Drag and drop your file here or click to browse</p>
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
              accept="application/pdf,image/*"
              onChange={handleFileChange}
            />
          </div>
        </Card>
      )}

      {file && (
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <h3 className="font-medium">{file.name}</h3>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
              </p>
            </div>
            <Button variant="outline" onClick={() => setFile(null)}>
              Remove
            </Button>
          </div>

          <div className="flex items-center">
            <Badge variant="secondary" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              <span className="ml-2">Claude AI</span>
            </Badge>
          </div>

          <AdvancedDocumentProcessor
            file={file}
            onComplete={handleProcessingComplete}
            onError={handleProcessingError}
          />
        </div>
      )}
    </div>
  )
}
