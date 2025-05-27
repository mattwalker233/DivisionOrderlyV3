"use client"

import type React from "react"
import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { stateData } from "@/lib/state-data"
import { useRouter } from "next/navigation"

export default function ExtractPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [uploadStep, setUploadStep] = useState<number>(1)
  const router = useRouter()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleStateSelect = (stateCode: string) => {
    setSelectedState(stateCode)
    setUploadStep(2)
  }

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompany(companyId)
    setUploadStep(3)
  }

  const handleUpload = () => {
    if (selectedFile && selectedState && selectedCompany) {
      // In a real app, we would upload the file and process it
      // For now, just redirect to the dashboard
      router.push("/dashboard")
    }
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Extract Division Order" description="Upload and process division order documents" />

      <Tabs defaultValue="upload" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Document</TabsTrigger>
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <div className="grid gap-6">
            {uploadStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select State</CardTitle>
                  <CardDescription>Choose the state for your division order</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {stateData.map((state) => (
                      <Button
                        key={state.code}
                        variant="outline"
                        className="h-auto flex flex-col items-start p-4 justify-start text-left"
                        onClick={() => handleStateSelect(state.code)}
                      >
                        <div className="font-medium">{state.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">{state.description}</div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {uploadStep === 2 && selectedState && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Company</CardTitle>
                  <CardDescription>Choose the company for your division order</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {stateData
                      .find((state) => state.code === selectedState)
                      ?.operators.map((company) => (
                        <Button
                          key={company.id}
                          variant="outline"
                          className="h-auto flex flex-col items-start p-4 justify-start text-left"
                          onClick={() => handleCompanySelect(company.id)}
                        >
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm text-muted-foreground mt-1">{company.wells.length} wells</div>
                        </Button>
                      ))}

                    <Button
                      variant="outline"
                      className="h-auto flex flex-col items-start p-4 justify-start text-left border-dashed"
                      onClick={() => handleCompanySelect("new-company")}
                    >
                      <div className="font-medium">+ Add New Company</div>
                      <div className="text-sm text-muted-foreground mt-1">Create a new company record</div>
                    </Button>
                  </div>

                  <Button variant="ghost" className="mt-4" onClick={() => setUploadStep(1)}>
                    Back to State Selection
                  </Button>
                </CardContent>
              </Card>
            )}

            {uploadStep === 3 && selectedState && selectedCompany && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Upload Division Order</CardTitle>
                  <CardDescription>Upload your division order document for AI-powered extraction</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Upload your document</h3>
                    <p className="text-muted-foreground mb-4">Drag and drop your PDF file here, or click to browse</p>
                    <input type="file" id="file-upload" className="hidden" accept=".pdf" onChange={handleFileSelect} />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("file-upload")?.click()}
                      className="mb-4"
                    >
                      Choose File
                    </Button>
                    {selectedFile && <Button onClick={handleUpload}>Process Document</Button>}
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Supported formats:</h4>
                    <ul className="text-sm text-muted-foreground">
                      <li>• PDF documents</li>
                      <li>• Maximum file size: 10MB</li>
                      <li>• Multi-page documents supported</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="batch" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Processing</CardTitle>
              <CardDescription>Upload and process multiple division orders at once</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Batch processing allows you to upload multiple division orders at once. This feature is coming soon.
              </p>
              <Button disabled>Coming Soon</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
