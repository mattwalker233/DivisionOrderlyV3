"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload, File, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface FileUploaderProps {
  onFileSelect?: (file: File) => void
  onUploadComplete?: (result: any) => void
  allowedTypes?: string[]
  maxSizeMB?: number
  endpoint?: string
  redirectTo?: string
}

export function FileUploader({
  onFileSelect,
  onUploadComplete,
  allowedTypes = ["application/pdf"],
  maxSizeMB = 10,
  endpoint = "/api/process-pdf",
  redirectTo,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!allowedTypes.includes(file.type)) {
        return `Invalid file type. Please upload ${allowedTypes.join(", ")}.`
      }

      if (file.size > maxSizeBytes) {
        return `File is too large. Maximum size is ${maxSizeMB}MB.`
      }

      return null
    },
    [allowedTypes, maxSizeBytes, maxSizeMB],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      setError(null)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFile = e.dataTransfer.files[0]
        const validationError = validateFile(droppedFile)

        if (validationError) {
          setError(validationError)
          return
        }

        setFile(droppedFile)
        if (onFileSelect) {
          onFileSelect(droppedFile)
        }
      }
    },
    [onFileSelect, validateFile],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null)
      if (e.target.files && e.target.files.length > 0) {
        const selectedFile = e.target.files[0]
        const validationError = validateFile(selectedFile)

        if (validationError) {
          setError(validationError)
          return
        }

        setFile(selectedFile)
        if (onFileSelect) {
          onFileSelect(selectedFile)
        }
      }
    },
    [onFileSelect, validateFile],
  )

  const uploadFile = useCallback(async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          return newProgress > 90 ? 90 : newProgress
        })
      }, 300)

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload file")
      }

      setUploadProgress(100)
      setSuccess(true)

      const result = await response.json()

      if (onUploadComplete) {
        onUploadComplete(result)
      }

      toast({
        title: "Upload Complete",
        description: "Your file has been successfully processed.",
      })

      // Redirect if specified
      if (redirectTo) {
        setTimeout(() => {
          router.push(redirectTo)
        }, 1000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setUploadProgress(0)
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
      })
    } finally {
      setIsUploading(false)
    }
  }, [file, endpoint, onUploadComplete, toast, router, redirectTo])

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : file
              ? "border-green-500 bg-green-50"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          {file ? (
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
              <File className="w-6 h-6 text-green-600" />
            </div>
          ) : (
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Upload className="w-6 h-6 text-primary" />
            </div>
          )}

          {file ? (
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div>
              <p className="font-medium">Drag & drop your file here</p>
              <p className="text-sm text-muted-foreground">or click to browse (PDF, max {maxSizeMB}MB)</p>
            </div>
          )}

          {!file && (
            <div className="relative">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept={allowedTypes.join(",")}
              />
              <Button variant="outline" type="button">
                Select File
              </Button>
            </div>
          )}

          {file && !isUploading && !success && (
            <Button onClick={uploadFile} className="mt-2">
              Upload & Process
            </Button>
          )}

          {file && !isUploading && success && (
            <div className="flex items-center text-green-600 space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Processing complete!</span>
            </div>
          )}
        </div>
      </div>

      {isUploading && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
