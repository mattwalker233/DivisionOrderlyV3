import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET() {
  try {
    const operators = dataStore.getOperators()
    return NextResponse.json({ success: true, data: operators })
  } catch (error) {
    console.error("Error fetching operators:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch operators" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, state } = body

    if (!name || !state) {
      return NextResponse.json({ success: false, error: "Name and state are required" }, { status: 400 })
    }

    const newOperator = {
      id: `op-${Date.now()}`,
      name,
      state,
      wells: [],
      divisionOrders: [],
    }

    dataStore.addOperator(newOperator)

    return NextResponse.json({ success: true, data: newOperator })
  } catch (error) {
    console.error("Error creating operator:", error)
    return NextResponse.json({ success: false, error: "Failed to create operator" }, { status: 500 })
  }
}
