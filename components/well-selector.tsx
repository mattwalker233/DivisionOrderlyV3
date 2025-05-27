"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WellData } from "@/lib/types"

interface WellSelectorProps {
  wells: WellData[]
  selectedWell: WellData | null
  onSelect: (well: WellData) => void
}

export function WellSelector({ wells, selectedWell, onSelect }: WellSelectorProps) {
  return (
    <div className="space-y-2">
      {wells.map((well) => (
        <button
          key={well.id}
          className={cn(
            "w-full text-left px-3 py-2 rounded-md transition-colors",
            "hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20",
            selectedWell?.id === well.id ? "bg-primary/10" : "bg-transparent",
          )}
          onClick={() => onSelect(well)}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{well.name}</div>
              <div className="text-sm text-muted-foreground">{well.county}</div>
            </div>
            {selectedWell?.id === well.id && (
              <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-primary" />
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
