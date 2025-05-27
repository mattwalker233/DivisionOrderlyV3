"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function AzureAIStatus() {
  const [status, setStatus] = useState<{
    connected: boolean
    message: string
    loading: boolean
  }>({
    connected: false,
    message: "Checking Azure AI connection...",
    loading: true,
  })

  const checkConnection = async () => {
    setStatus({
      connected: false,
      message: "Checking Azure AI connection...",
      loading: true,
    })

    try {
      const response = await fetch("/api/check-azure-connection")
      const data = await response.json()

      if (data.success) {
        setStatus({
          connected: true,
          message: "Azure AI is connected and working properly.",
          loading: false,
        })
      } else {
        setStatus({
          connected: false,
          message: data.error || "Azure AI connection failed. Using fallback mode.",
          loading: false,
        })
      }
    } catch (error) {
      setStatus({
        connected: false,
        message: "Error checking Azure AI connection. Using fallback mode.",
        loading: false,
      })
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Azure AI Status</span>
          <Button variant="outline" size="sm" onClick={checkConnection} disabled={status.loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${status.loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          {status.loading ? (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <div className="animate-pulse">Checking connection...</div>
            </Badge>
          ) : status.connected ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              Fallback Mode
            </Badge>
          )}
          <span className="ml-2 text-sm">{status.message}</span>
        </div>
      </CardContent>
    </Card>
  )
}
