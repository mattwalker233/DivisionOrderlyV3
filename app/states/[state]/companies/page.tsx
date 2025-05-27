import { Button } from "@/components/ui/button"
import { PlusCircle, Building2 } from "lucide-react"
import Link from "next/link"
import { CompanyDisplay } from "@/components/company-display"

interface CompaniesPageProps {
  params: {
    state: string
  }
}

export default function CompaniesPage({ params }: CompaniesPageProps) {
  const { state } = params

  const stateName =
    state === "tx"
      ? "Texas"
      : state === "nm"
        ? "New Mexico"
        : state === "ok"
          ? "Oklahoma"
          : state === "nd"
            ? "North Dakota"
            : state === "co"
              ? "Colorado"
              : state === "oh"
                ? "Ohio"
                : state === "wv"
                  ? "West Virginia"
                  : state === "pa"
                    ? "Pennsylvania"
                    : state === "wy"
                      ? "Wyoming"
                      : "Unknown State"

  // This would normally come from a database or API
  const companies = [
    {
      id: "company1",
      name: state === "co" ? "PDC Energy" : state === "wy" ? "Devon Energy" : "Example Energy Corporation",
      state: stateName,
      documentCount: 5,
      wellCount: 3,
    },
    {
      id: "company2",
      name: state === "co" ? "Noble Energy" : state === "wy" ? "ConocoPhillips" : "Petroleum Resources LLC",
      state: stateName,
      documentCount: 2,
      wellCount: 1,
    },
    {
      id: "company3",
      name: state === "co" ? "Occidental Petroleum" : state === "wy" ? "EOG Resources" : "Drilling Innovations Inc",
      state: stateName,
      documentCount: 0,
      wellCount: 0,
    },
  ]

  const stateCode = state.toUpperCase()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          <Building2 className="h-8 w-8 mr-2 text-blue-500" />
          Companies in {stateName}
        </h1>
        <Button asChild>
          <Link href={`/states/${state}/companies/add`}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Company
          </Link>
        </Button>
      </div>

      {companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyDisplay key={company.id} company={company} stateCode={stateCode} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Companies Added Yet</h2>
          <p className="text-muted-foreground mb-6">Add your first company to get started.</p>
          <Button asChild>
            <Link href={`/states/${state}/companies/add`}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add First Company
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
