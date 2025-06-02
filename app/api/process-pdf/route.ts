import { type NextRequest, NextResponse } from "next/server"
import { extractDocumentText } from "@/lib/ocr-processor"
import { extractFields } from "@/lib/ocr-processor"

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData()
    const file = formData.get("file") as File
    const stateCode = formData.get("stateCode") as string

    if (!file || !stateCode) {
      return NextResponse.json({ error: "Missing required fields: file and stateCode" }, { status: 400 })
    }

    try {
      // Process the document with OCR
      console.log(`Processing ${file.name} (${file.type}) for state ${stateCode}`)
      const extractedText = await extractDocumentText(file)
      const extractedData = extractFields(extractedText, stateCode)

      // Return the extracted data
      return NextResponse.json({
        success: true,
        extractedText,
        ...extractedData
      })
    } catch (processingError) {
      console.error("Error processing document:", processingError)

      return NextResponse.json(
        {
          success: false,
          error: "Failed to process document",
          details: processingError instanceof Error ? processingError.message : String(processingError),
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("Error in API route:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Helper function to get default county by state
function getDefaultCounty(stateCode: string): string {
  const countyMap: Record<string, string> = {
    TX: "Reeves County",
    OK: "Kingfisher County",
    NM: "Lea County",
    ND: "McKenzie County",
    PA: "Washington County",
    OH: "Belmont County",
    LA: "Caddo Parish",
    WV: "Doddridge County",
  }
  return countyMap[stateCode] || "Unknown County"
}
