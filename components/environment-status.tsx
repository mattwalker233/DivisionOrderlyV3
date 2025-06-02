"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"
import { CheckCircle2, XCircle as XCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EnvironmentStatus {
  endpoint: boolean
  apiKey: boolean
}

export default function EnvironmentStatus() {
  const [status, setStatus] = useState<EnvironmentStatus>({
    endpoint: false,
    apiKey: false,
  })

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/check-environment')
      const data = await response.json()
      setStatus({
        endpoint: data.endpoint,
        apiKey: data.apiKey,
      })
    } catch (error) {
      console.error('Error checking environment status:', error)
      setStatus({
        endpoint: false,
        apiKey: false,
      })
    }
  }

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
            <span className="text-sm font-medium">Anthropic API Endpoint</span>
            <div className="flex items-center">
              {status.endpoint ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-green-500">Connected</span>
                </>
              ) : (
                <>
                  <XCircle2 className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm text-red-500">Not configured</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Anthropic API Key</span>
            <div className="flex items-center">
              {status.apiKey ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-green-500">Configured</span>
                </>
              ) : (
                <>
                  <XCircle2 className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm text-red-500">Not configured</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground">
          {!status.endpoint || !status.apiKey ? (
            <Alert>
              <AlertDescription>
                Some required environment variables are not configured. Please check your .env.local file.
              </AlertDescription>
            </Alert>
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
