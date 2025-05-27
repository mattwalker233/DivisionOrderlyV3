"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { stateData } from "@/lib/state-data"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { notFound } from "next/navigation"

interface AddCompanyPageProps {
  params: {
    state: string
  }
}

export default function AddCompanyPage({ params }: AddCompanyPageProps) {
  const { state } = params
  const router = useRouter()
  const { toast } = useToast()
  const [stateInfo] = useState(() => stateData.find((s) => s.code.toLowerCase() === state))
  const [companyName, setCompanyName] = useState("")
  const [companyId, setCompanyId] = useState("")
  const [county, setCounty] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!stateInfo) {
    notFound()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const newErrors: Record<string, string> = {}
    if (!companyName.trim()) {
      newErrors.companyName = "Company name is required"
    }
    if (!companyId.trim()) {
      newErrors.companyId = "Company ID is required"
    } else if (!/^[a-z0-9-]+$/.test(companyId)) {
      newErrors.companyId = "Company ID can only contain lowercase letters, numbers, and hyphens"
    }
    if (!county.trim()) {
      newErrors.county = "County is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call to add the company
      // For now, we'll just simulate a delay and success
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Company Added",
        description: `${companyName} has been added to ${stateInfo.name}`,
      })

      // Navigate back to companies list
      router.push(`/states/${state}/companies`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add company. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyName(e.target.value)
    if (!companyId) {
      // Auto-generate ID from name
      setCompanyId(`${state}-${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-")}`)
    }
  }

  return (
    <main>
      <div className="bg-gradient-to-b from-primary/10 via-background to-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6">
            <Button asChild variant="ghost" size="sm" className="mr-4">
              <Link href={`/states/${state}/companies`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Companies
              </Link>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
            <div className="flex-shrink-0 h-24 w-24 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="h-12 w-12 text-primary/40" />
            </div>
            <div>
              <PageHeader
                title={`Add Company in ${stateInfo.name}`}
                description={`Add a new company operating in ${stateInfo.name} to manage division orders.`}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="bg-primary/5">
                  {stateInfo.name}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Enter the details of the company you want to add</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={handleCompanyNameChange}
                  disabled={isSubmitting}
                />
                {errors.companyName && <p className="text-sm text-destructive">{errors.companyName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyId">Company ID</Label>
                <Input
                  id="companyId"
                  placeholder="Enter company ID"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Used in URLs. Only lowercase letters, numbers, and hyphens.
                </p>
                {errors.companyId && <p className="text-sm text-destructive">{errors.companyId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="county">Primary County</Label>
                <Input
                  id="county"
                  placeholder="Enter primary operating county"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.county && <p className="text-sm text-destructive">{errors.county}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/states/${state}/companies`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Company"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}
