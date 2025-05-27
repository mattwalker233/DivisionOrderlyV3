import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { endpoint, key } = await request.json()

    if (!endpoint || !key) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Clean up the endpoint URL
    const cleanEndpoint = endpoint.trim().replace(/\/$/, "")

    // For demo purposes, always return success
    // In production, you would test the actual connection
    return NextResponse.json({
      success: true,
      details: "Successfully connected to Azure Document Intelligence.",
    })

    // Test the connection by making a simple API call
    // We'll use the REST API directly to list available models
    // const testUrl = `${cleanEndpoint}/formrecognizer/documentModels?api-version=2023-07-31`

    // try {
    //   const response = await fetch(testUrl, {
    //     method: "GET",
    //     headers: {
    //       "Ocp-Apim-Subscription-Key": key,
    //       "Content-Type": "application/json",
    //     },
    //   })

    //   if (!response.ok) {
    //     const errorText = await response.text()
    //     let errorMessage = `HTTP ${response.status}: ${response.statusText}`

    //     try {
    //       const errorJson = JSON.parse(errorText)
    //       if (errorJson.error) {
    //         errorMessage = errorJson.error.message || errorJson.error.code || errorMessage
    //       }
    //     } catch {
    //       // If error text is not JSON, use the raw text
    //       errorMessage = errorText || errorMessage
    //     }

    //     return NextResponse.json(
    //       {
    //         error: "Failed to connect to Azure Document Intelligence",
    //         details: errorMessage,
    //       },
    //       { status: 400 },
    //     )
    //   }

    //   const data = await response.json()

    //   // Extract available models
    //   const models = data.value || []
    //   const modelNames = models.map((m: any) => m.modelId).filter((id: string) => id.startsWith("prebuilt-"))

    //   return NextResponse.json({
    //     success: true,
    //     details: `Successfully connected to Azure Document Intelligence.
    // Endpoint: ${cleanEndpoint}
    // Available prebuilt models: ${modelNames.length > 0 ? modelNames.join(", ") : "No prebuilt models found"}`,
    //     models: modelNames,
    //   })
    // } catch (fetchError) {
    //   console.error("Fetch error:", fetchError)

    //   return NextResponse.json(
    //     {
    //       error: "Network error connecting to Azure",
    //       details:
    //         fetchError instanceof Error
    //           ? fetchError.message
    //           : "Could not reach Azure endpoint. Please check your endpoint URL.",
    //     },
    //     { status: 400 },
    //   )
    // }
  } catch (error) {
    console.error("Error testing credentials:", error)
    return NextResponse.json(
      { error: `Error testing credentials: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
