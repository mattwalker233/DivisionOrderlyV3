"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Edit, Save, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/page-header"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { calculateRoyalties, validateAllocations } from "@/lib/document-processor"
import type { ExtractedData } from "@/lib/types"

export default function ResultsPage() {
  const [data, setData] = useState<ExtractedData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<ExtractedData | null>(null)
  const [allocationsValid, setAllocationsValid] = useState(true)

  useEffect(() => {
    // Retrieve the extraction results from localStorage
    const storedResults = localStorage.getItem("extractionResults")
    if (storedResults) {
      const parsedData = JSON.parse(storedResults) as ExtractedData
      setData(parsedData)
      setEditedData(parsedData)
      setAllocationsValid(validateAllocations(parsedData.allocations || []))
    }
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    if (editedData) {
      // Recalculate royalties based on updated data
      const updatedAllocations = calculateRoyalties(
        editedData.tractSize || editedData.totalTractAcreage.toString(),
        editedData.royaltyInterest || editedData.averageRoyaltyRate.toString(),
        editedData.allocations || [],
      )

      const updatedData = {
        ...editedData,
        allocations: updatedAllocations,
      }

      setData(updatedData)
      setEditedData(updatedData)
      setAllocationsValid(validateAllocations(updatedData.allocations || []))
      setIsEditing(false)
      // Here you would typically save the data to your backend
    }
  }

  const handleInputChange = (field: keyof ExtractedData, value: string) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [field]: value,
      })
    }
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="No Results Found" description="Please upload a document to extract information." />
        <Button asChild className="mt-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Upload
          </Link>
        </Button>
      </div>
    )
  }

  // Extract key information from the data
  const tractSize = data.tractSize || `${data.totalTractAcreage} acres`
  const royaltyInterest = data.royaltyInterest || `${(data.averageRoyaltyRate * 100).toFixed(2)}%`
  const sectionNumber =
    data.sectionNumber ||
    (data.sectionBreakdowns && data.sectionBreakdowns.length > 0
      ? data.sectionBreakdowns[0].sectionNumber
      : "Not found")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Extracted Information"
          description="Review the key information extracted from your division order."
        />
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Upload Another
          </Link>
        </Button>
      </div>

      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Key Information</CardTitle>
          {isEditing ? (
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          ) : (
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Information
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="tractSize">Tract Size</Label>
              {isEditing ? (
                <Input
                  id="tractSize"
                  value={editedData?.tractSize || editedData?.totalTractAcreage.toString() || ""}
                  onChange={(e) => handleInputChange("tractSize", e.target.value)}
                />
              ) : (
                <div className="p-3 rounded-md bg-muted font-medium text-lg">{tractSize}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="royaltyInterest">Royalty Interest</Label>
              {isEditing ? (
                <Input
                  id="royaltyInterest"
                  value={
                    editedData?.royaltyInterest ||
                    (editedData?.averageRoyaltyRate ? (editedData.averageRoyaltyRate * 100).toFixed(2) + "%" : "")
                  }
                  onChange={(e) => handleInputChange("royaltyInterest", e.target.value)}
                />
              ) : (
                <div className="p-3 rounded-md bg-muted font-medium text-lg">{royaltyInterest}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sectionNumber">Section Number</Label>
              {isEditing ? (
                <Input
                  id="sectionNumber"
                  value={
                    editedData?.sectionNumber ||
                    (editedData?.sectionBreakdowns && editedData.sectionBreakdowns.length > 0
                      ? editedData.sectionBreakdowns[0].sectionNumber
                      : "")
                  }
                  onChange={(e) => handleInputChange("sectionNumber", e.target.value)}
                />
              ) : (
                <div className="p-3 rounded-md bg-muted font-medium text-lg">{sectionNumber}</div>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              {isEditing ? (
                <Input
                  id="county"
                  value={editedData?.county || ""}
                  onChange={(e) => handleInputChange("county", e.target.value)}
                />
              ) : (
                <div className="p-2 rounded-md bg-muted">{data.county}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="operator">Operator</Label>
              {isEditing ? (
                <Input
                  id="operator"
                  value={editedData?.operator || ""}
                  onChange={(e) => handleInputChange("operator", e.target.value)}
                />
              ) : (
                <div className="p-2 rounded-md bg-muted">{data.operator}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="mt-8 bg-green-50 border-green-200">
        <Check className="h-4 w-4 text-green-500" />
        <AlertTitle className="text-green-700">Extraction Complete</AlertTitle>
        <AlertDescription className="text-green-600">
          The key information has been successfully extracted from your division order document.
        </AlertDescription>
      </Alert>
    </div>
  )
}
