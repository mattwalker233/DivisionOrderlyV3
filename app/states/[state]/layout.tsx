import { notFound } from "next/navigation"
import { getStateByCode } from "@/lib/state-data"

interface StateLayoutProps {
  children: React.ReactNode
  params: {
    state: string
  }
}

export default function StateLayout({ children, params }: StateLayoutProps) {
  const { state } = params
  const stateCode = state.toUpperCase()
  const stateData = getStateByCode(stateCode)

  if (!stateData) {
    notFound()
  }

  return <>{children}</>
} 