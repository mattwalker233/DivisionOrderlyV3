'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Building2, Upload } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { getStateNameByCode, getCompaniesByState } from "@/lib/state-data"

export default function CompaniesPage() {
  const params = useParams()
  const stateCode = (params.state as string).toUpperCase()
  const stateName = getStateNameByCode(stateCode)
  const companies = getCompaniesByState(stateCode)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          <Building2 className="h-8 w-8 mr-2 text-blue-500" />
          Companies in {stateName}
        </h1>
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href={`/states/${stateCode.toLowerCase()}/upload`}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/states/${stateCode.toLowerCase()}/companies/add`}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Company
            </Link>
          </Button>
        </div>
      </div>

      {companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mr-3">
                      <Building2 className="h-6 w-6" />
                    </div>
                    {company}
                  </CardTitle>
                </div>
                <CardDescription>View and manage division orders</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">0 Documents</span>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/states/${stateCode.toLowerCase()}/companies/${encodeURIComponent(company)}`}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Companies Added Yet</h2>
          <p className="text-muted-foreground mb-6">Add your first company to get started.</p>
          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href={`/states/${stateCode.toLowerCase()}/upload`}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/states/${stateCode.toLowerCase()}/companies/add`}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Company
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
