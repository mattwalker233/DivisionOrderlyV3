import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // For demo purposes, return mock data
    // In production, you would process with Azure Document Intelligence
    return NextResponse.json({
      success: true,
      data: {
        wellName: "Example Well #123",
        operator: "ABC Oil & Gas",
        county: "Midland County",
        royaltyInterest: 0.125,
        tractAcres: 640.5,
        ownerName: "John Smith",
        effectiveDate: "2023-01-15",
        confidence: 85.7,
      },
    })
  } catch (error) {
    console.error("Error processing document:", error)
    return NextResponse.json(
      { error: `Failed to process document: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
