"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ExtractedData } from "@/lib/types"

interface ExtractedInfoDisplayProps {
  data: ExtractedData
  operatorName: string
  onDownload: () => void
}

export function ExtractedInfoDisplay({ data, operatorName, onDownload }: ExtractedInfoDisplayProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Extracted Information</CardTitle>
        <Button size="sm" onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center">
                Tract Size
                <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                  {data.confidenceScores.totalTractAcreage}% confidence
                </Badge>
              </div>
              <div className="p-3 bg-muted rounded-md text-lg font-semibold">{data.tractSize}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center">
                Royalty Interest
                <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                  {data.confidenceScores.averageRoyaltyRate}% confidence
                </Badge>
              </div>
              <div className="p-3 bg-muted rounded-md text-lg font-semibold">{data.royaltyInterest}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center">
                Section Number
                <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">95% confidence</Badge>
              </div>
              <div className="p-3 bg-muted rounded-md text-lg font-semibold">{data.sectionNumber}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">County</div>
              <div className="p-2 bg-muted rounded-md">{data.county}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Operator</div>
              <div className="p-2 bg-muted rounded-md">{operatorName}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
