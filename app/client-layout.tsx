"use client"

import type React from "react"

import { useEffect } from "react"
import { Mona_Sans as FontSans } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Toaster } from "@/components/toaster"
import { dataStore } from "@/lib/data-store"
import { ErrorBoundary } from "@/components/error-boundary"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Initialize data store on client side
  useEffect(() => {
    try {
      dataStore.loadFromStorage()
    } catch (error) {
      console.error("Failed to load data from storage:", error)
      // Don't throw error, just log it
    }
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex-1">
              <ErrorBoundary>{children}</ErrorBoundary>
            </div>
            <SiteFooter />
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
