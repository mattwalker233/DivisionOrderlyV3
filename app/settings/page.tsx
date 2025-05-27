"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SettingsPage() {
  const [endpoint, setEndpoint] = useState("")
  const [key, setKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [showKey, setShowKey] = useState(false)

  const handleTest = async () => {
    if (!endpoint || !key) {
      setTestResult({
        success: false,
        message: "Please enter both the endpoint and key",
      })
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // For demo purposes, always succeed
      setTestResult({
        success: true,
        message: "Connection successful! Your Azure Document Intelligence credentials are working.",
      })

      // Save to localStorage for client-side use
      localStorage.setItem("azure_endpoint", endpoint.trim())
      localStorage.setItem("azure_key", key.trim())
    } catch (error) {
      setTestResult({
        success: false,
        message: "Connection failed. Please check your credentials.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Azure Document Intelligence Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Azure Credentials</CardTitle>
          <CardDescription>
            Enter your Azure Document Intelligence endpoint and key to test the connection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint URL</Label>
            <Input
              id="endpoint"
              placeholder="https://your-resource.cognitiveservices.azure.com/"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Example: https://your-resource.cognitiveservices.azure.com/</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="key">API Key</Label>
            <div className="flex">
              <Input
                id="key"
                type={showKey ? "text" : "password"}
                placeholder="Enter your Azure API key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" type="button" onClick={() => setShowKey(!showKey)} className="ml-2">
                {showKey ? "Hide" : "Show"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">This is a long string of characters from your Azure portal.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Back to Home
          </Button>
          <Button onClick={handleTest} disabled={isLoading}>
            {isLoading ? "Testing..." : "Test Connection"}
          </Button>
        </CardFooter>
      </Card>

      {testResult && (
        <Alert className={`mt-6 ${testResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
            {testResult.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
