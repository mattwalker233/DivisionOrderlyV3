import { notFound } from "next/navigation"
import { PDFPreprocessor } from "@/components/pdf-preprocessor"
import { getStateByCode, getCompanyById } from "@/lib/state-data"

interface PreprocessPageProps {
  params: {
    state: string
    companyId: string
  }
}

export default function PreprocessPage({ params }: PreprocessPageProps) {
  const stateCode = params.state.toUpperCase()
  const state = getStateByCode(stateCode)

  if (!state) {
    notFound()
  }

  const company = getCompanyById(state, params.companyId)

  if (!company) {
    notFound()
  }

  return (
    <div className="container py-6 max-w-5xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Preprocess Division Order</h1>
          <p className="text-muted-foreground mt-2">
            Extract key information from division orders for {company.name} in {state.name}
          </p>
        </div>

        <PDFPreprocessor
          stateCode={stateCode}
          stateName={state.name}
          companyId={params.companyId}
          companyName={company.name}
        />
      </div>
    </div>
  )
}
