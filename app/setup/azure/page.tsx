"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, AlertTriangle, Copy, ArrowRight } from "lucide-react"

export default function AzureSetupPage() {
  const { toast } = useToast()
  const [endpoint, setEndpoint] = useState("")
  const [key, setKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    details?: string
  } | null>(null)
  const [showKey, setShowKey] = useState(false)

  const handleTest = async () => {
    if (!endpoint || !key) {
      toast({
        variant: "destructive",
        title: "Missing credentials",
        description: "Please enter both the endpoint and key",
      })
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/test-azure-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: endpoint.trim(),
          key: key.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setTestResult({
          success: true,
          message: "Connection successful! Your Azure Document Intelligence credentials are working.",
          details: data.details || "API version and endpoint verified successfully.",
        })

        toast({
          title: "Connection successful",
          description: "Your Azure Document Intelligence credentials are working correctly.",
        })
      } else {
        setTestResult({
          success: false,
          message: "Connection failed. Please check your credentials.",
          details: data.error || "Unknown error occurred.",
        })

        toast({
          variant: "destructive",
          title: "Connection failed",
          description: "Please check the error details below.",
        })
      }
    } catch (error) {
      console.error("Error testing credentials:", error)
      setTestResult({
        success: false,
        message: "Connection failed. Please check your credentials.",
        details: error instanceof Error ? error.message : "Unknown error occurred.",
      })

      toast({
        variant: "destructive",
        title: "Connection failed",
        description: "An error occurred while testing the connection.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: `${type} copied`,
      description: `The ${type.toLowerCase()} has been copied to your clipboard.`,
    })
  }

  const getInstructions = () => {
    return `
# Azure Document Intelligence Setup Instructions

1. Sign in to the [Azure Portal](https://portal.azure.com)
2. Search for "Document Intelligence" in the search bar
3. Click "Create" to create a new Document Intelligence resource
4. Fill in the required details:
   - Subscription: Your Azure subscription
   - Resource group: Create new or select existing
   - Region: Choose a region close to you
   - Name: Give your resource a unique name
   - Pricing tier: Free tier is sufficient for testing
5. Click "Review + create" and then "Create"
6. Once deployment is complete, click "Go to resource"
7. In the left menu, click on "Keys and Endpoint"
8. Copy "Key 1" and the "Endpoint" to the fields on this page

Note: The free tier has limitations on the number of pages you can process per month.
    `
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Azure Document Intelligence Setup</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <p className="text-xs text-muted-foreground">
                Example: https://your-resource.cognitiveservices.azure.com/
              </p>
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
              <p className="text-xs text-muted-foreground">
                This is a long string of characters from your Azure portal.
              </p>
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

        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
            <CardDescription>How to get your Azure Document Intelligence credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea readOnly className="font-mono text-xs h-[300px] overflow-auto" value={getInstructions()} />
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => copyToClipboard(getInstructions(), "Instructions")}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Instructions
            </Button>
          </CardFooter>
        </Card>
      </div>

      {testResult && (
        <Card className={`mt-6 ${testResult.success ? "border-green-500" : "border-red-500"}`}>
          <CardHeader className={testResult.success ? "text-green-700" : "text-red-700"}>
            <CardTitle className="flex items-center">
              {testResult.success ? (
                <CheckCircle2 className="h-5 w-5 mr-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 mr-2" />
              )}
              {testResult.message}
            </CardTitle>
          </CardHeader>
          {testResult.details && (
            <CardContent>
              <Alert className={testResult.success ? "bg-green-50" : "bg-red-50"}>
                <AlertTitle>Details</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap font-mono text-xs">
                  {testResult.details}
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
          {testResult.success && (
            <CardFooter>
              <Button className="w-full" onClick={() => (window.location.href = "/extract")}>
                Continue to Document Extraction
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  )
}
