interface ExtractedData {
  wellName: string
  operator: string
  county: string
  royaltyInterest: number
  tractAcres: number
  ownerName: string
  effectiveDate: string
  confidence: number
  rawData?: any
}

export async function processWithAzureDocumentIntelligence(
  fileBuffer: Buffer,
  fileName: string,
): Promise<ExtractedData> {
  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT
  const apiKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY

  if (!endpoint || !apiKey) {
    throw new Error("Azure Document Intelligence credentials not configured")
  }

  // Clean up the endpoint URL
  const cleanEndpoint = endpoint.trim().replace(/\/$/, "")

  try {
    // Use the REST API directly for document analysis
    const analyzeUrl = `${cleanEndpoint}/formrecognizer/documentModels/prebuilt-document:analyze?api-version=2023-07-31`

    // Start the analysis
    const analyzeResponse = await fetch(analyzeUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey,
        "Content-Type": "application/pdf",
      },
      body: fileBuffer,
    })

    if (!analyzeResponse.ok) {
      const errorText = await analyzeResponse.text()
      console.error("Azure API error:", errorText)
      throw new Error(`Azure API error: ${analyzeResponse.status} ${analyzeResponse.statusText}`)
    }

    // Get the operation location from the response headers
    const operationLocation = analyzeResponse.headers.get("operation-location")
    if (!operationLocation) {
      throw new Error("No operation location returned from Azure")
    }

    // Poll for the result
    let result = null
    let attempts = 0
    const maxAttempts = 60 // 60 attempts with 1 second delay = 1 minute max

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second

      const resultResponse = await fetch(operationLocation, {
        headers: {
          "Ocp-Apim-Subscription-Key": apiKey,
        },
      })

      if (!resultResponse.ok) {
        throw new Error(`Failed to get analysis result: ${resultResponse.status}`)
      }

      const resultData = await resultResponse.json()

      if (resultData.status === "succeeded") {
        result = resultData.analyzeResult
        break
      } else if (resultData.status === "failed") {
        throw new Error("Document analysis failed")
      }

      attempts++
    }

    if (!result) {
      throw new Error("Document analysis timed out")
    }

    // Extract data from the result
    const extractedData: ExtractedData = {
      wellName: "",
      operator: "",
      county: "",
      royaltyInterest: 0,
      tractAcres: 0,
      ownerName: "",
      effectiveDate: "",
      confidence: 0,
      rawData: result,
    }

    // Process key-value pairs
    if (result.keyValuePairs) {
      for (const kvp of result.keyValuePairs) {
        const key = kvp.key?.content?.toLowerCase() || ""
        const value = kvp.value?.content || ""
        const confidence = kvp.confidence || 0

        // Map common division order fields
        if (key.includes("well") && key.includes("name")) {
          extractedData.wellName = value
        } else if (key.includes("operator") || key.includes("company")) {
          extractedData.operator = value
        } else if (key.includes("county")) {
          extractedData.county = value
        } else if (key.includes("interest") || key.includes("royalty")) {
          const numValue = Number.parseFloat(value.replace(/[^\d.-]/g, ""))
          extractedData.royaltyInterest = numValue > 1 ? numValue / 100 : numValue
        } else if (key.includes("acres") || key.includes("tract")) {
          extractedData.tractAcres = Number.parseFloat(value.replace(/[^\d.-]/g, "")) || 0
        } else if (key.includes("owner") || (key.includes("name") && !key.includes("well"))) {
          extractedData.ownerName = value
        } else if (key.includes("effective") || key.includes("date")) {
          extractedData.effectiveDate = value
        }

        extractedData.confidence = Math.max(extractedData.confidence, confidence * 100)
      }
    }

    // Extract from content if fields are missing
    if (result.content) {
      const content = result.content

      if (!extractedData.wellName) {
        const wellMatch = content.match(/(?:Well|Well Name)[:\s]+([A-Za-z0-9\s\-#]+)/i)
        if (wellMatch) extractedData.wellName = wellMatch[1].trim()
      }

      if (!extractedData.operator) {
        const operatorMatch = content.match(/(?:Operator|Company)[:\s]+([A-Za-z0-9\s\-&,.]+)/i)
        if (operatorMatch) extractedData.operator = operatorMatch[1].trim()
      }

      if (!extractedData.county) {
        const countyMatch = content.match(/([A-Za-z\s]+County)/i)
        if (countyMatch) extractedData.county = countyMatch[1].trim()
      }

      if (!extractedData.royaltyInterest) {
        const royaltyMatch = content.match(/(\d+\.?\d*)\s*%/i)
        if (royaltyMatch) {
          extractedData.royaltyInterest = Number.parseFloat(royaltyMatch[1]) / 100
        }
      }

      if (!extractedData.tractAcres) {
        const acresMatch = content.match(/(\d+\.?\d*)\s*acres/i)
        if (acresMatch) {
          extractedData.tractAcres = Number.parseFloat(acresMatch[1])
        }
      }
    }

    // Set default values
    extractedData.wellName = extractedData.wellName || "Unknown Well"
    extractedData.operator = extractedData.operator || "Unknown Operator"
    extractedData.county = extractedData.county || "Unknown County"
    extractedData.ownerName = extractedData.ownerName || "Unknown Owner"
    extractedData.effectiveDate = extractedData.effectiveDate || new Date().toISOString()
    extractedData.confidence = extractedData.confidence || 70

    return extractedData
  } catch (error) {
    console.error("Azure Document Intelligence error:", error)
    throw new Error(`Failed to process document: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
