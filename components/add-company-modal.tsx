"use client"

import { useState } from "react"
import { Building2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { OperatorData } from "@/lib/types"

interface AddCompanyModalProps {
  stateCode: string
  stateName: string
  open: boolean
  onClose: () => void
  onCompanyAdded: (company: OperatorData) => void
}

export function AddCompanyModal({ stateCode, stateName, open, onClose, onCompanyAdded }: AddCompanyModalProps) {
  const [companyName, setCompanyName] = useState("")
  const [nameError, setNameError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    // Validate inputs
    if (!companyName.trim()) {
      setNameError("Company name is required")
      return
    } else {
      setNameError(null)
    }

    setIsSubmitting(true)

    try {
      // In a real implementation, we would send this to the server
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create a new company
      const newCompany: OperatorData = {
        id: `${stateCode.toLowerCase()}-${companyName.toLowerCase().replace(/\s+/g, "-")}`,
        name: companyName,
        wells: [], // This would be populated in a real implementation
      }

      // Add the new company
      onCompanyAdded(newCompany)
      resetForm()
    } catch (err) {
      console.error("Error adding company:", err)
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setCompanyName("")
    setNameError(null)
    setIsSubmitting(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
          <DialogDescription>Add a new company to {stateName} to start processing division orders.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              placeholder="Enter company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={nameError ? "border-red-500" : ""}
            />
            {nameError && (
              <div className="flex items-center text-xs text-destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                {nameError}
              </div>
            )}
          </div>

          <div className="flex items-center p-3 bg-muted rounded-md">
            <Building2 className="h-5 w-5 text-muted-foreground mr-3" />
            <div className="text-sm">
              <p>Companies are specific to each state. This company will be added to {stateName}.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="mr-2">Adding...</span>
                <div className="h-4 w-4 rounded-full border-2 border-background border-t-transparent animate-spin"></div>
              </>
            ) : (
              "Add Company"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
