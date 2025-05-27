"use client"

import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"
import type { OperatorData } from "@/lib/types"

interface OperatorSelectorProps {
  operators: OperatorData[]
  selectedOperator: OperatorData | null
  onSelect: (operator: OperatorData | null) => void
  onAddNew: () => void
}

export function OperatorSelector({ operators, selectedOperator, onSelect, onAddNew }: OperatorSelectorProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {selectedOperator ? selectedOperator.name : "Select operator..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search operators..." />
          <CommandList>
            <CommandEmpty>No operator found.</CommandEmpty>
            <CommandGroup heading="Available Operators">
              {operators.map((operator) => (
                <CommandItem
                  key={operator.id}
                  value={operator.id}
                  onSelect={() => {
                    onSelect(operator.id === selectedOperator?.id ? null : operator)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", selectedOperator?.id === operator.id ? "opacity-100" : "opacity-0")}
                  />
                  {operator.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onAddNew()
                  setOpen(false)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Operator
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
