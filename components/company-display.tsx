import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, FileText } from "lucide-react"
import Link from "next/link"

interface CompanyDisplayProps {
  company: {
    id: string
    name: string
    state: string
    documentCount?: number
    wellCount?: number
  }
  stateCode: string
}

export function CompanyDisplay({ company, stateCode }: CompanyDisplayProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-blue-500" />
          <Link href={`/states/${stateCode}/companies/${company.id}`} className="hover:underline">
            {company.name}
          </Link>
        </CardTitle>
        <CardDescription>
          <span className="flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-gray-500" />
            {company.state}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mt-2">
          {company.wellCount && company.wellCount > 0 ? (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {company.wellCount} {company.wellCount === 1 ? "Well" : "Wells"}
            </Badge>
          ) : null}

          {company.documentCount && company.documentCount > 0 ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <FileText className="h-3 w-3 mr-1" />
              {company.documentCount} {company.documentCount === 1 ? "Document" : "Documents"}
            </Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
