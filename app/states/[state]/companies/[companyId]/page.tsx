import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Building2, Upload, FileText, PlusCircle } from "lucide-react"
import Link from "next/link"

interface CompanyDetailPageProps {
  params: {
    state: string
    companyId: string
  }
}

export default function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { state, companyId } = params

  // This would normally come from a database or API
  const company = {
    id: companyId,
    name: "Example Energy Corporation",
    state:
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
                        : "Unknown State",
    wells: [
      { id: "well1", name: "Well #1", county: "Reeves County" },
      { id: "well2", name: "Well #2", county: "Lea County" },
    ],
    documents: [
      { id: "doc1", name: "Division Order #12345", date: "2023-01-15" },
      { id: "doc2", name: "Division Order #67890", date: "2023-02-20" },
    ],
  }

  const stateCode = state.toUpperCase()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          <Building2 className="h-8 w-8 mr-2 text-blue-500" />
          {company.name}
        </h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/states/${state}/companies/${companyId}/upload`}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Details about {company.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Company Name</h3>
              <p className="text-lg">{company.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">State</h3>
              <p className="text-lg">{company.state}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="wells">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wells">Wells</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="wells" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Wells</h2>
            <Button variant="outline" asChild>
              <Link href={`/states/${state}/companies/${companyId}/wells/add`}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Well
              </Link>
            </Button>
          </div>

          {company.wells.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.wells.map((well) => (
                <Card key={well.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{well.name}</CardTitle>
                    <CardDescription>{well.county}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/states/${state}/companies/${companyId}/wells/${well.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No wells added yet.</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href={`/states/${state}/companies/${companyId}/wells/add`}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add First Well
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Documents</h2>
            <Button variant="outline" asChild>
              <Link href={`/states/${state}/companies/${companyId}/upload`}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Link>
            </Button>
          </div>

          {company.documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.documents.map((doc) => (
                <Card key={doc.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      {doc.name}
                    </CardTitle>
                    <CardDescription>Uploaded: {doc.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/states/${state}/companies/${companyId}/documents/${doc.id}`}>View Document</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No documents uploaded yet.</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href={`/states/${state}/companies/${companyId}/upload`}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload First Document
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
