import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    azureEndpoint: !!process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
    azureKey: !!process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY,
  })
}
