"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { renderPage } from "@/utils/pdf-renderer"

interface PDFPreviewProps {
  file: File
  onPageChange?: (pageNumber: number) => void
  currentPage?: number
  setTotalPages?: (totalPages: number) => void
}

export function PDFPreview({ file, onPageChange, currentPage = 1, setTotalPages }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [activePage, setActivePage] = useState<number>(currentPage)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pdfDocument, setPdfDocument] = useState<any>(null)

  useEffect(() => {
    let isMounted = true

    const loadPDF = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load PDF.js from CDN if not already loaded
        if (!window.pdfjsLib) {
          const pdfjsScript = document.createElement("script")
          pdfjsScript.src = "//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
          pdfjsScript.async = true
          document.body.appendChild(pdfjsScript)

          await new Promise<void>((resolve) => {
            pdfjsScript.onload = () => resolve()
          })
        }

        // Wait for PDF.js to be fully loaded
        while (!window.pdfjsLib) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        // Set worker source
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"

        // Load the PDF file
        const arrayBuffer = await file.arrayBuffer()
        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer })
        const pdf = await loadingTask.promise

        if (isMounted) {
          setPdfDocument(pdf)
          const pageCount = pdf.numPages
          setNumPages(pageCount)
          if (setTotalPages) {
            setTotalPages(pageCount)
          }
          renderPage(pdf, activePage, canvasRef.current)
        }
      } catch (err) {
        console.error("Error loading PDF:", err)
        if (isMounted) {
          setError("Failed to load PDF. The file may be corrupted or password protected.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (file && file.type === "application/pdf") {
      loadPDF()
    } else {
      setError("Not a PDF file")
      setIsLoading(false)
    }

    return () => {
      isMounted = false
    }
  }, [file, setTotalPages])

  // Update when currentPage prop changes
  useEffect(() => {
    if (currentPage !== activePage) {
      setActivePage(currentPage)
      if (pdfDocument) {
        renderPage(pdfDocument, currentPage, canvasRef.current)
      }
    }
  }, [currentPage, activePage, pdfDocument])

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > numPages) return

    setActivePage(newPage)
    setIsLoading(true)

    try {
      if (pdfDocument) {
        await renderPage(pdfDocument, newPage, canvasRef.current)
        if (onPageChange) {
          onPageChange(newPage)
        }
      }
    } catch (err) {
      console.error("Error changing page:", err)
      setError(`Failed to load page ${newPage}.`)
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="border rounded-md p-4 bg-red-50 text-red-700">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full border rounded-md overflow-hidden bg-white">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <canvas ref={canvasRef} className="max-w-full mx-auto" />
      </div>

      {numPages > 1 && (
        <div className="flex items-center justify-center mt-4 space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(activePage - 1)}
            disabled={activePage <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {activePage} of {numPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(activePage + 1)}
            disabled={activePage >= numPages || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
