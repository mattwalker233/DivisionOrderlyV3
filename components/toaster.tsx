"use client"

import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"

export function Toaster() {
  const { toasts, dismiss } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 w-full max-w-sm p-4 sm:top-4 sm:right-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${
            toast.variant === "destructive" ? "bg-red-100 border-red-400" : "bg-green-100 border-green-400"
          } border rounded-md shadow-lg p-4 flex justify-between items-start`}
          role="alert"
        >
          <div>
            <h3 className="font-medium">{toast.title}</h3>
            {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
          </div>
          <button onClick={() => dismiss(toast.id)} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
