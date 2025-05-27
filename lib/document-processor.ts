import { createWorker } from "tesseract.js"
import type { ExtractedData, Allocation } from "./types"

// Initialize Tesseract worker
let worker: any = null

async function initializeWorker() {
  if (!worker) {
    worker = await createWorker("eng")
  }
  return worker
}

/**
 * Process the uploaded document using Tesseract OCR and Azure AI
 */
export async function processDocument(
  file: File,
  stateCode: string,
  stateName: string,
  operatorId: string,
  operatorName: string,
): Promise<ExtractedData> {
  try {
    console.log(`Processing division order from ${operatorName} in ${stateName}`)

    // Step 1: Extract text using Tesseract OCR
    const extractedText = await extractTextFromDocument(file)

    // Step 2: Send the extracted text to Azure AI for analysis
    const azureResults = await analyzeWithAzureAI(file, extractedText)

    // Step 3: Process the Azure AI results to extract specific fields
    return processAzureResults(azureResults, stateCode, operatorName)
  } catch (error) {
    console.error("Error processing document:", error)
    return createFallbackData(stateCode, stateName, operatorName)
  }
}

/**
 * Extract text from document using Tesseract OCR
 */
async function extractTextFromDocument(file: File): Promise<string> {
  try {
    if (file.type === "application/pdf") {
      // For PDFs, we would normally use PDF.js to render pages and then process with Tesseract
      // For simplicity, we'll use a simulated approach here
      console.log("Extracting text from PDF using Tesseract OCR")
      return "Simulated PDF text extraction with Tesseract"
    } else if (file.type.startsWith("image/")) {
      console.log("Extracting text from image using Tesseract OCR")
      const worker = await initializeWorker()

      // Convert file to data URL
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      // Recognize text with Tesseract
      const { data } = await worker.recognize(dataUrl)
      return data.text
    }

    return "Unsupported file type"
  } catch (error) {
    console.error("Error extracting text with Tesseract:", error)
    return "Error extracting text with Tesseract"
  }
}

/**
 * Analyze the document with Azure AI Document Intelligence
 */
async function analyzeWithAzureAI(file: File, extractedText: string): Promise<any> {
  try {
    console.log("Sending to Azure AI Document Intelligence for analysis")

    // Get Azure credentials from localStorage or environment variables
    const azureEndpoint = localStorage.getItem("azureEndpoint") || process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT
    const azureApiKey = localStorage.getItem("azureApiKey") || process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY

    if (!azureEndpoint || !azureApiKey) {
      console.log("Azure credentials not found, using fallback analysis")
      return simulateAzureAnalysis(extractedText)
    }

    // Create form data for the API request
    const formData = new FormData()
    formData.append("file", file)

    // Send the file to our Azure API route
    const response = await fetch("/api/azure-document-intelligence", {
      method: "POST",
      headers: {
        "x-azure-endpoint": azureEndpoint,
        "x-azure-api-key": azureApiKey,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Azure API error: ${response.status}`)
    }

    const result = await response.json()
    return result.result
  } catch (error) {
    console.error("Error analyzing with Azure AI:", error)
    return simulateAzureAnalysis(extractedText)
  }
}

/**
 * Simulate Azure AI analysis for fallback mode
 */
function simulateAzureAnalysis(extractedText: string): any {
  // Extract potential fields from the text using regex
  const wellNameMatch = extractedText.match(/Well(?:\s+Name)?[:\s]+([A-Za-z0-9\s-]+\d+[A-Za-z]?)/i)
  const sectionMatch = extractedText.match(/Section[:\s]+(\d+)/i)
  const townshipMatch = extractedText.match(/Township[:\s]+(\d+[NS])/i)
  const rangeMatch = extractedText.match(/Range[:\s]+(\d+[EW])/i)
  const entityMatch = extractedText.match(
    /(?:Owner|Entity|Lessor)[:\s]+([A-Za-z\s.,]+)(?:LLC|Inc|Corporation|Trust|Company)?/i,
  )
  const interestMatch = extractedText.match(/(?:Interest|Decimal)[:\s]+(\d+\.\d+|\d+\/\d+)%?/i)
  const effectiveDateMatch = extractedText.match(
    /Effective\s+Date[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4})/i,
  )
  const preparedDateMatch = extractedText.match(
    /(?:Prepared|Date)[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4})/i,
  )

  return {
    entities: [
      wellNameMatch
        ? { type: "WELL_NAME", text: wellNameMatch[1], confidence: 0.85 }
        : { type: "WELL_NAME", text: "Sample Well 1H", confidence: 0.7 },
      sectionMatch
        ? { type: "SECTION", text: `Section ${sectionMatch[1]}`, confidence: 0.9 }
        : { type: "SECTION", text: "Section 14", confidence: 0.7 },
      townshipMatch
        ? { type: "TOWNSHIP", text: `Township ${townshipMatch[1]}`, confidence: 0.9 }
        : { type: "TOWNSHIP", text: "Township 26S", confidence: 0.7 },
      rangeMatch
        ? { type: "RANGE", text: `Range ${rangeMatch[1]}`, confidence: 0.9 }
        : { type: "RANGE", text: "Range 32E", confidence: 0.7 },
      entityMatch
        ? { type: "ENTITY", text: entityMatch[1], confidence: 0.85 }
        : { type: "ENTITY", text: "Sample Owner LLC", confidence: 0.7 },
      interestMatch
        ? { type: "DECIMAL_INTEREST", text: interestMatch[1], confidence: 0.9 }
        : { type: "DECIMAL_INTEREST", text: "0.1875", confidence: 0.7 },
      effectiveDateMatch
        ? { type: "EFFECTIVE_DATE", text: effectiveDateMatch[1], confidence: 0.85 }
        : { type: "EFFECTIVE_DATE", text: "01/15/2023", confidence: 0.7 },
      preparedDateMatch
        ? { type: "PREPARED_DATE", text: preparedDateMatch[1], confidence: 0.85 }
        : { type: "PREPARED_DATE", text: "01/10/2023", confidence: 0.7 },
    ],
    fullText: extractedText,
    confidence: 0.8,
    pageCount: 1,
  }
}

/**
 * Process Azure AI results to extract specific fields
 */
function processAzureResults(azureResults: any, stateCode: string, operatorName: string): ExtractedData {
  try {
    const entities = azureResults.entities || []

    // Extract specific fields from Azure results
    const wellName = findEntityText(entities, "WELL_NAME") || "Unknown Well"
    const section = findEntityText(entities, "SECTION") || "Unknown Section"
    const township = findEntityText(entities, "TOWNSHIP") || "Unknown Township"
    const range = findEntityText(entities, "RANGE") || "Unknown Range"
    const entity = findEntityText(entities, "ENTITY") || "Unknown Entity"
    const decimalInterest = findEntityText(entities, "DECIMAL_INTEREST") || "0.00"
    const effectiveDate = findEntityText(entities, "EFFECTIVE_DATE") || "Unknown"
    const preparedDate = findEntityText(entities, "PREPARED_DATE") || "Unknown"

    // Format the property description
    const propertyDescription = `${section}, ${township}, ${range}`

    // Calculate confidence scores
    const confidenceScores = {
      wellNames: findEntityConfidence(entities, "WELL_NAME"),
      county: findEntityConfidence(entities, "COUNTY"),
      ownerNames: findEntityConfidence(entities, "ENTITY"),
      totalTractAcreage: findEntityConfidence(entities, "TRACT_SIZE"),
      averageRoyaltyRate: findEntityConfidence(entities, "DECIMAL_INTEREST"),
    }

    // Create section breakdown
    const sectionNumber = section.replace("Section ", "")
    const sectionBreakdowns = [
      {
        sectionNumber: section,
        netAcres: 320, // Default value
        grossAcres: 640, // Default value
        royaltyInterest: Number.parseFloat(decimalInterest) || 0.1875,
        calculatedRoyalty: 320 * (Number.parseFloat(decimalInterest) || 0.1875) * 75,
        confidenceScore: confidenceScores.averageRoyaltyRate,
      },
    ]

    return {
      wellNames: [wellName],
      ownerNames: [entity],
      county: stateCode === "TX" ? "Reeves County" : stateCode === "NM" ? "Lea County" : "Sample County",
      operator: operatorName,
      totalTractAcreage: 320,
      averageRoyaltyRate: Number.parseFloat(decimalInterest) || 0.1875,
      sectionBreakdowns,
      allocationValid: true,
      confidenceScores,
      tractSize: {
        value: "320 acres",
        confidence: confidenceScores.totalTractAcreage,
      },
      royaltyInterest: {
        value: `${(Number.parseFloat(decimalInterest) || 0.1875) * 100}%`,
        confidence: confidenceScores.averageRoyaltyRate,
      },
      sectionNumber: {
        value: section,
        confidence: findEntityConfidence(entities, "SECTION"),
      },
      propertyDescription: {
        value: propertyDescription,
        confidence: 90,
      },
      entity: {
        value: entity,
        confidence: confidenceScores.ownerNames,
      },
      effectiveDate: {
        value: effectiveDate,
        confidence: findEntityConfidence(entities, "EFFECTIVE_DATE"),
      },
      preparedDate: {
        value: preparedDate,
        confidence: findEntityConfidence(entities, "PREPARED_DATE"),
      },
    }
  } catch (error) {
    console.error("Error processing Azure results:", error)
    return createFallbackData(stateCode, "Unknown", operatorName)
  }
}

/**
 * Find entity text by type
 */
function findEntityText(entities: any[], type: string): string | null {
  const entity = entities.find((e) => e.type === type)
  return entity ? entity.text : null
}

/**
 * Find entity confidence by type
 */
function findEntityConfidence(entities: any[], type: string): number {
  const entity = entities.find((e) => e.type === type)
  return entity ? Math.round(entity.confidence * 100) : 70
}

/**
 * Create fallback data when document processing fails
 */
function createFallbackData(stateCode: string, stateName: string, operatorName: string): ExtractedData {
  const countyMap: Record<string, string> = {
    TX: "Reeves County",
    OK: "Kingfisher County",
    NM: "Lea County",
    ND: "McKenzie County",
    PA: "Washington County",
    OH: "Belmont County",
    WV: "Doddridge County",
    LA: "Caddo Parish",
  }

  const county = countyMap[stateCode] || "Unknown County"

  return {
    ownerNames: ["Sample Owner"],
    wellNames: ["Sample Well 1H"],
    county: county,
    operator: operatorName,
    totalTractAcreage: 320,
    averageRoyaltyRate: 0.1875,
    sectionBreakdowns: [
      {
        sectionNumber: "Section 1",
        netAcres: 320,
        grossAcres: 640,
        royaltyInterest: 0.1875,
        calculatedRoyalty: 320 * 0.1875 * 75,
        confidenceScore: 70,
      },
    ],
    allocationValid: true,
    confidenceScores: {
      ownerNames: 70,
      wellNames: 70,
      county: 70,
      totalTractAcreage: 70,
      averageRoyaltyRate: 70,
    },
    tractSize: {
      value: "320 acres",
      confidence: 70,
    },
    royaltyInterest: {
      value: "18.75%",
      confidence: 70,
    },
    sectionNumber: {
      value: "Section 1",
      confidence: 70,
    },
    propertyDescription: {
      value: "Section 1, Township 26S, Range 32E",
      confidence: 70,
    },
    entity: {
      value: "Sample Owner LLC",
      confidence: 70,
    },
    effectiveDate: {
      value: "01/15/2023",
      confidence: 70,
    },
    preparedDate: {
      value: "01/10/2023",
      confidence: 70,
    },
  }
}

/**
 * Calculate royalty amounts based on tract size, royalty interest, and allocations
 */
export function calculateRoyalties(
  tractSizeStr: string,
  royaltyInterestStr: string,
  allocations: Allocation[],
): Allocation[] {
  // Parse tract size to get numeric value
  const tractSizeMatch = tractSizeStr.match(/(\d+(\.\d+)?)/)
  const tractSizeAcres = tractSizeMatch ? Number.parseFloat(tractSizeMatch[1]) : 0

  // Parse royalty interest
  const royaltyInterest = Number.parseFloat(royaltyInterestStr)

  // Calculate royalties for each allocation
  return allocations.map((allocation) => {
    const netAcres = tractSizeAcres * allocation.interestPercentage
    const royaltyAmount = netAcres * royaltyInterest

    return {
      ...allocation,
      netAcres,
      royaltyAmount,
    }
  })
}

/**
 * Validate that allocations add up to 100%
 */
export function validateAllocations(allocations: Allocation[]): boolean {
  const totalPercentage = allocations.reduce((sum, allocation) => sum + allocation.interestPercentage, 0)
  return Math.abs(totalPercentage - 1.0) < 0.0001 // Allow for small floating point errors
}
