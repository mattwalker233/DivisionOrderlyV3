"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { FileUploader } from "@/components/file-uploader"
import { AdvancedDocumentProcessor } from "@/components/advanced-document-processor"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getStateNameByCode } from "@/lib/state-data"

export default function CompanyUploadPage() {
  const params = useParams()
  const stateCode = params.state as string
  const companyId = params.companyId as string
  const stateName = getStateNameByCode(stateCode) || "Unknown State"
  const companyName = companyId
    .split("-")
    .slice(1)
    .join(" ")
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelected = (file: File) => {
    setSelectedFile(file)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Upload Division Order</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Upload a division order for processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">State</p>
              <p>{stateName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Company</p>
              <p>{companyName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedFile ? (
        <FileUploader onFileSelected={handleFileSelected} />
      ) : (
        <AdvancedDocumentProcessor
          file={selectedFile}
          stateCode={stateCode}
          stateName={stateName}
          companyId={companyId}
          companyName={companyName}
          onReset={() => setSelectedFile(null)}
        />
      )}
    </div>
  )
}
