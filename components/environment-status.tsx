"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"

export function EnvironmentStatus() {
  const [status, setStatus] = useState<{
    azureEndpoint: boolean
    azureKey: boolean
    checked: boolean
  }>({
    azureEndpoint: false,
    azureKey: false,
    checked: false,
  })

  const checkEnvironmentVariables = async () => {
    try {
      const response = await fetch("/api/check-environment")
      const data = await response.json()

      setStatus({
        azureEndpoint: data.azureEndpoint,
        azureKey: data.azureKey,
        checked: true,
      })
    } catch (error) {
      console.error("Error checking environment variables:", error)
      setStatus({
        azureEndpoint: false,
        azureKey: false,
        checked: true,
      })
    }
  }

  useEffect(() => {
    checkEnvironmentVariables()
  }, [])

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Info className="h-5 w-5 mr-2 text-blue-500" />
          Environment Status
        </CardTitle>
        <CardDescription>Check the status of required environment variables</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Azure Document Intelligence Endpoint</span>
            {status.checked ? (
              status.azureEndpoint ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Configured
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Missing
                </Badge>
              )
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                Checking...
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Azure Document Intelligence API Key</span>
            {status.checked ? (
              status.azureKey ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Configured
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Missing
                </Badge>
              )
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                Checking...
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground">
          {!status.azureEndpoint || !status.azureKey ? (
            <div className="text-amber-600 flex items-start">
              <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>Missing environment variables. The application will run in fallback mode with sample data.</span>
            </div>
          ) : (
            <div className="text-green-600 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>All required environment variables are configured.</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
