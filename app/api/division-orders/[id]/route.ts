import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.deleteDivisionOrder(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting division order:", error)
    return NextResponse.json({ error: "Failed to delete division order" }, { status: 500 })
  }
}
