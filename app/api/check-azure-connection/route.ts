import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get Azure Document Intelligence credentials from environment variables
    const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT
    const apiKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY

    if (!endpoint || !apiKey) {
      return NextResponse.json({
        success: false,
        error: "Azure AI credentials are missing. Check your environment variables.",
      })
    }

    // Ensure the endpoint doesn't have a trailing slash
    const baseEndpoint = endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint

    // Try to connect to Azure AI
    const apiUrl = `${baseEndpoint}/formrecognizer/documentModels?api-version=2023-07-31`

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey,
      },
    })

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: "Azure AI is connected and working properly.",
      })
    } else {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        error: `Azure AI connection failed: ${response.status} - ${errorText}`,
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Error checking Azure AI connection: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}
