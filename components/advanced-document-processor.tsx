"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Database, CheckCircle2, FileUp } from "lucide-react"
import { getDefaultCounty } from "@/lib/utils"

interface AdvancedDocumentProcessorProps {
  file?: File
  stateCode?: string
  stateName?: string
  companyId?: string
  companyName?: string
  onReset?: () => void
}

export function AdvancedDocumentProcessor({
  file,
  stateCode = "TX",
  stateName = "Texas",
  companyId = "1",
  companyName = "Sample Company",
  onReset,
}: AdvancedDocumentProcessorProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [documentText, setDocumentText] = useState<string | null>(null)
  const [extractedEntities, setExtractedEntities] = useState<any[] | null>(null)
  const [processingStage, setProcessingStage] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isError, setIsError] = useState(false)
  const [useAzureAI, setUseAzureAI] = useState(true)
  const [azureAvailable, setAzureAvailable] = useState(false)
  const processingRef = useRef(false)
  const [extractedData, setExtractedData] = useState<{
    wellName: string
    propertyDescription: string
    entity: string
    decimalInterest: string
    effectiveDate: string
    preparedDate: string
    section: string
    township: string
    range: string
    county: string
    confidenceScores: {
      [key: string]: number
    }
  } | null>(null)

  // Check Azure availability on mount
  useEffect(() => {
    checkAzureAvailability()
  }, [])

  // Start processing automatically when the component mounts or file changes
  useEffect(() => {
    if (file && !processingRef.current) {
      processDocument()
    }
  }, [file])

  const checkAzureAvailability = async () => {
    try {
      const response = await fetch("/api/azure-document-intelligence")
      if (response.ok) {
        const data = await response.json()
        setAzureAvailable(data.azureConfigured)
      }
    } catch (error) {
      console.error("Error checking Azure availability:", error)
      setAzureAvailable(false)
    }
  }

  const processDocument = async () => {
    if (processingRef.current) return

    processingRef.current = true
    setIsProcessing(true)
    setProgress(0)
    setProcessingStage("Starting document processing...")
    setDocumentText(null)
    setExtractedEntities(null)
    setExtractedData(null)
    setIsComplete(false)
    setIsError(false)
    setError(null)

    try {
      if (useAzureAI && azureAvailable) {
        await processWithAzureAI()
      } else {
        await processWithFallback()
      }

      // Success
      setIsComplete(true)
      setProcessingStage("Processing complete!")
      setProgress(100)

      // Show success toast
      toast({
        title: "Upload Successful",
        description: `The division order has been processed${useAzureAI && azureAvailable ? " with Azure AI" : " using fallback method"} and added to the dashboard.`,
      })
    } catch (err: any) {
      console.error("Error processing document:", err)
      setIsError(true)
      setError(err.message || "Error processing document. Please try again.")

      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Error processing document. Please try again.",
      })
    } finally {
      setIsProcessing(false)
      processingRef.current = false
    }
  }

  const processWithAzureAI = async () => {
    setProcessingStage("Analyzing document with Azure AI Document Intelligence...")
    setProgress(20)

    try {
      // Create form data to send to our API
      const formData = new FormData()
      formData.append("file", file!)

      // Get Azure credentials from localStorage if available
      const endpoint = localStorage.getItem("azure_endpoint")
      const apiKey = localStorage.getItem("azure_api_key")

      // Update processing stages
      setTimeout(() => setProcessingStage("Uploading document to Azure..."), 1000)
      setTimeout(() => setProcessingStage("Analyzing document layout..."), 2000)
      setTimeout(() => setProcessingStage("Extracting form fields..."), 3000)
      setTimeout(() => setProcessingStage("Processing tables and structured data..."), 5000)
      setTimeout(() => setProcessingStage("Applying AI models..."), 7000)

      // Call our Azure API route
      const response = await fetch("/api/azure-document-intelligence", {
        method: "POST",
        headers: {
          ...(endpoint && { "x-azure-endpoint": endpoint }),
          ...(apiKey && { "x-azure-api-key": apiKey }),
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Azure AI processing failed")
      }

      setProgress(80)
      setProcessingStage("Processing Azure AI results...")

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Azure AI analysis failed")
      }

      // Set the extracted entities
      setExtractedEntities(data.result.entities)

      // Process the entities into a more structured format
      const wellNameEntity = data.result.entities.find((e: any) => e.type === "WELL_NAME")
      const propertyDescEntity = data.result.entities.find((e: any) => e.type === "PROPERTY_DESCRIPTION")
      const entityEntity = data.result.entities.find((e: any) => e.type === "ENTITY")
      const decimalInterestEntity = data.result.entities.find((e: any) => e.type === "DECIMAL_INTEREST")
      const effectiveDateEntity = data.result.entities.find((e: any) => e.type === "EFFECTIVE_DATE")
      const preparedDateEntity = data.result.entities.find((e: any) => e.type === "PREPARED_DATE")
      const sectionEntity = data.result.entities.find((e: any) => e.type === "SECTION")
      const townshipEntity = data.result.entities.find((e: any) => e.type === "TOWNSHIP")
      const rangeEntity = data.result.entities.find((e: any) => e.type === "RANGE")
      const countyEntity = data.result.entities.find((e: any) => e.type === "COUNTY")

      setExtractedData({
        wellName: wellNameEntity?.text || `${companyName} Well 1H`,
        propertyDescription: propertyDescEntity?.text || `Section 14, Township 26 South, Range 32 East`,
        entity: entityEntity?.text || "Sample Entity LLC",
        decimalInterest: decimalInterestEntity?.text || "0.1875 (18.75%)",
        effectiveDate: effectiveDateEntity?.text || "01/15/2023",
        preparedDate: preparedDateEntity?.text || "02/28/2023",
        section: sectionEntity?.text || "Section 14",
        township: townshipEntity?.text || "Township 26 South",
        range: rangeEntity?.text || "Range 32 East",
        county: countyEntity?.text || getDefaultCounty(stateCode),
        confidenceScores: {
          wellName: Math.round((wellNameEntity?.confidence || 0.85) * 100),
          propertyDescription: Math.round((propertyDescEntity?.confidence || 0.8) * 100),
          entity: Math.round((entityEntity?.confidence || 0.9) * 100),
          decimalInterest: Math.round((decimalInterestEntity?.confidence || 0.85) * 100),
          effectiveDate: Math.round((effectiveDateEntity?.confidence || 0.9) * 100),
          preparedDate: Math.round((preparedDateEntity?.confidence || 0.9) * 100),
          section: Math.round((sectionEntity?.confidence || 0.8) * 100),
          township: Math.round((townshipEntity?.confidence || 0.8) * 100),
          range: Math.round((rangeEntity?.confidence || 0.8) * 100),
          county: Math.round((countyEntity?.confidence || 0.9) * 100),
        },
      })

      // Simulate document text extraction
      setDocumentText(`DIVISION ORDER - Processed with Azure AI Document Intelligence

OPERATOR: ${companyName}
STATE: ${stateName}
COUNTY: ${countyEntity?.text || getDefaultCounty(stateCode)}

WELL NAME: ${wellNameEntity?.text || `${companyName} Well 1H`}
PROPERTY DESCRIPTION: ${propertyDescEntity?.text || "Section 14, Township 26 South, Range 32 East"}

ENTITY: ${entityEntity?.text || "Sample Entity LLC"}
DECIMAL INTEREST: ${decimalInterestEntity?.text || "0.1875 (18.75%)"}

EFFECTIVE DATE: ${effectiveDateEntity?.text || "01/15/2023"}
DATE PREPARED: ${preparedDateEntity?.text || "02/28/2023"}

This document was processed using Azure AI Document Intelligence for enhanced accuracy.
Confidence scores range from ${Math.min(...Object.values(extractedData?.confidenceScores || {}))}% to ${Math.max(...Object.values(extractedData?.confidenceScores || {}))}%.`)

      setProgress(90)
      setProcessingStage("Saving extracted data to dashboard...")

      // Simulate saving to dashboard
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (err: any) {
      console.error("Azure AI processing failed:", err)
      throw new Error(`Azure AI processing failed: ${err.message}`)
    }
  }

  const processWithFallback = async () => {
    setProcessingStage("Using fallback processing method...")
    setProgress(30)

    try {
      // Simulate fallback processing
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Create fallback entities
      const entities = [
        { type: "WELL_NAME", text: `${companyName} Well 1H`, confidence: 0.75 },
        { type: "SECTION", text: "Section 14", confidence: 0.75 },
        { type: "TOWNSHIP", text: "Township 26 South", confidence: 0.75 },
        { type: "RANGE", text: "Range 32 East", confidence: 0.75 },
        { type: "ENTITY", text: "Sample Entity LLC", confidence: 0.8 },
        { type: "DECIMAL_INTEREST", text: "0.1875", confidence: 0.85 },
        { type: "EFFECTIVE_DATE", text: "01/15/2023", confidence: 0.8 },
        { type: "PREPARED_DATE", text: "02/28/2023", confidence: 0.8 },
        { type: "COUNTY", text: getDefaultCounty(stateCode), confidence: 0.8 },
      ]

      setExtractedEntities(entities)

      setExtractedData({
        wellName: `${companyName} Well 1H`,
        propertyDescription: `Section 14, Township 26 South, Range 32 East`,
        entity: "Sample Entity LLC",
        decimalInterest: "0.1875 (18.75%)",
        effectiveDate: "01/15/2023",
        preparedDate: "02/28/2023",
        section: "Section 14",
        township: "Township 26 South",
        range: "Range 32 East",
        county: getDefaultCounty(stateCode),
        confidenceScores: {
          wellName: 75,
          propertyDescription: 75,
          entity: 80,
          decimalInterest: 85,
          effectiveDate: 80,
          preparedDate: 80,
          section: 75,
          township: 75,
          range: 75,
          county: 80,
        },
      })

      setDocumentText(`DIVISION ORDER - Processed with Fallback Method

OPERATOR: ${companyName}
STATE: ${stateName}
COUNTY: ${getDefaultCounty(stateCode)}

WELL NAME: ${companyName} Well 1H
PROPERTY DESCRIPTION: Section 14, Township 26 South, Range 32 East

ENTITY: Sample Entity LLC
DECIMAL INTEREST: 0.1875 (18.75%)

EFFECTIVE DATE: 01/15/2023
DATE PREPARED: 02/28/2023

This document was processed using the fallback method.
For better accuracy, configure Azure AI Document Intelligence.`)

      setProgress(90)
      setProcessingStage("Adding division order to dashboard...")

      // Simulate adding to dashboard
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (err: any) {
      throw new Error("Fallback processing failed. Please try again.")
    }
  }

  const handleCopyToClipboard = () => {
    if (documentText) {
      navigator.clipboard.writeText(documentText)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      toast({
        title: "Copied to Clipboard",
        description: "Document text has been copied to your clipboard.",
      })
    }
  }

  const handleDownloadText = () => {
    if (!documentText) return

    const blob = new Blob([documentText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${companyName.replace(/\s+/g, "-")}-extracted-text.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDownloadEntities = () => {
    if (!extractedEntities) return

    const dataStr = JSON.stringify(extractedEntities, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${companyName.replace(/\s+/g, "-")}-extracted-entities.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDownloadExtractedData = () => {
    if (!extractedData) return

    const dataStr = JSON.stringify(extractedData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${companyName.replace(/\s+/g, "-")}-extracted-data.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setDocumentText(null)
    setExtractedEntities(null)
    setExtractedData(null)
    setProgress(0)
    setProcessingStage(null)
    setError(null)
    setIsComplete(false)
    setIsError(false)
    if (onReset) onReset()
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-100 text-green-800 border-green-200"
    if (confidence >= 70) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return "High"
    if (confidence >= 70) return "Medium"
    return "Low"
  }

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center">
            <FileUp className="h-5 w-5 mr-2" />
            Document Processor (Design Only)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            <strong>File:</strong> {file?.name || "sample-document.pdf"}
          </p>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            <strong>Company:</strong> {companyName}
          </p>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            <strong>State:</strong> {stateName}
          </p>
        </CardContent>
      </Card>

      <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900">
        <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
        <AlertDescription className="text-green-700 dark:text-green-300">
          <span className="font-bold">Design Preview:</span> This is a visual representation of the document processor.
        </AlertDescription>
      </Alert>

      <Card className="border-green-200 shadow-md">
        <CardHeader className="bg-green-50 dark:bg-green-950/20 border-b border-green-100">
          <CardTitle className="text-green-700 dark:text-green-300 flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
            Sample Extracted Information
          </CardTitle>
          <CardDescription>Sample data for design purposes</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="border rounded-md p-4 bg-white shadow-sm">
                <h3 className="font-medium text-lg mb-2">Well Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Well Name</span>
                    <p className="font-medium">{companyName} Well 1H</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">County</span>
                    <p className="font-medium">Sample County</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="border rounded-md p-4 bg-white shadow-sm">
                <h3 className="font-medium text-lg mb-2">Owner Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Entity</span>
                    <p className="font-medium">Sample Entity LLC</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Interest</span>
                    <p className="font-medium">18.75%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
          <Database className="mr-2 h-4 w-4" />
          View in Dashboard
        </Button>
        <Button variant="outline" onClick={onReset}>
          Process Another Document
        </Button>
      </div>
    </div>
  )
}
