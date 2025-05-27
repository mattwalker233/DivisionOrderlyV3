"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Info, Eye, EyeOff } from "lucide-react"

export function AzureCredentialsForm() {
  const [endpoint, setEndpoint] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [savedCredentials, setSavedCredentials] = useState(false)

  // Load credentials from localStorage on component mount
  useEffect(() => {
    const savedEndpoint = localStorage.getItem("azure_endpoint")
    const savedApiKey = localStorage.getItem("azure_api_key")

    if (savedEndpoint && savedApiKey) {
      setEndpoint(savedEndpoint)
      setApiKey(savedApiKey)
      setSavedCredentials(true)
      setMessage("Credentials loaded from browser storage.")
    }
  }, [])

  const testCredentials = async () => {
    if (!endpoint || !apiKey) {
      setStatus("error")
      setMessage("Please enter both endpoint and API key.")
      return
    }

    setStatus("testing")
    setMessage("Testing connection to Azure...")

    try {
      const response = await fetch("/api/test-azure-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoint, apiKey }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage("Connection successful! Your Azure credentials are working.")

        // Save credentials to localStorage
        localStorage.setItem("azure_endpoint", endpoint)
        localStorage.setItem("azure_api_key", apiKey)
        setSavedCredentials(true)
      } else {
        setStatus("error")
        setMessage(`Connection failed: ${data.error}`)
      }
    } catch (error) {
      setStatus("error")
      setMessage(`Error testing connection: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const clearCredentials = () => {
    localStorage.removeItem("azure_endpoint")
    localStorage.removeItem("azure_api_key")
    setEndpoint("")
    setApiKey("")
    setSavedCredentials(false)
    setStatus("idle")
    setMessage("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Azure Document Intelligence Credentials</CardTitle>
        <CardDescription>
          Enter your Azure Document Intelligence endpoint and API key to enable AI-powered document extraction.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {savedCredentials && (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              Azure credentials are saved and will be used for document extraction.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="endpoint">Azure Document Intelligence Endpoint</Label>
          <Input
            id="endpoint"
            placeholder="https://your-resource.cognitiveservices.azure.com/"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Example: https://your-resource-name.cognitiveservices.azure.com/
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your API key can be found in the Azure portal under your Document Intelligence resource.
          </p>
        </div>

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">{message}</AlertDescription>
          </Alert>
        )}

        {status === "idle" && message && (
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={clearCredentials} disabled={status === "testing" || !savedCredentials}>
          Clear Credentials
        </Button>
        <Button onClick={testCredentials} disabled={status === "testing"}>
          {status === "testing" ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Testing...
            </>
          ) : savedCredentials ? (
            "Test Connection"
          ) : (
            "Save & Test"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
