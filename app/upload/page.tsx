"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      setError(null)
    } else if (selectedFile) {
      setError("Please select a PDF file")
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setProgress(10)
    setError(null)

    try {
      // Simulate processing with progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000))
      clearInterval(progressInterval)
      setProgress(100)

      // Save mock data to localStorage
      const mockData = {
        id: `order-${Date.now()}`,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        wellName: "Example Well #123",
        operator: "ABC Oil & Gas",
        county: "Midland County",
        royaltyInterest: 0.125,
        tractAcres: 640.5,
        ownerName: "John Smith",
        effectiveDate: "2023-01-15",
        confidence: 85.7,
      }

      const savedOrders = JSON.parse(localStorage.getItem("divisionOrders") || "[]")
      localStorage.setItem("divisionOrders", JSON.stringify([...savedOrders, mockData]))

      // Redirect to dashboard after successful upload
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (err) {
      setError("An error occurred while processing the document")
      setIsUploading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Upload Division Order</h1>

      <Card>
        <CardHeader>
          <CardTitle>Document Upload</CardTitle>
          <CardDescription>
            Upload a division order PDF to extract information using Azure Document Intelligence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <h3 className="text-lg font-medium mb-2">{file ? file.name : "Select a PDF file"}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Maximum file size: 10MB"}
            </p>
            <input type="file" id="file-upload" className="hidden" accept=".pdf" onChange={handleFileChange} />
            <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Choose File
            </Button>
          </div>

          {file && (
            <div className="mt-6">
              <Button onClick={handleUpload} className="w-full" size="lg" disabled={isUploading}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {isUploading ? "Processing..." : "Process Document"}
              </Button>
            </div>
          )}

          {isUploading && (
            <div className="mt-4">
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-sm text-gray-500 mt-2">Processing document... {progress}%</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert className="mt-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <AlertDescription>
              Make sure your Azure Document Intelligence credentials are configured in the environment variables.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
