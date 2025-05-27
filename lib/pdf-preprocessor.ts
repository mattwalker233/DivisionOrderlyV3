import * as pdfjs from "pdfjs-dist"

// Initialize PDF.js worker
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
}

export interface ExtractedField {
  name: string
  value: string
  confidence: number
  pageNumber: number
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface PreprocessedDocument {
  text: string
  fields: ExtractedField[]
  pageCount: number
  metadata: Record<string, string>
}

// Regular expressions for common division order fields
const fieldPatterns = [
  {
    name: "tractSize",
    pattern: /(?:tract\s+size|total\s+acres)[\s:]*([0-9,.]+\s*acres)/i,
    confidence: 0.85,
  },
  {
    name: "royaltyInterest",
    pattern: /(?:royalty\s+interest|decimal\s+interest)[\s:]*([0-9./]+%?|\d+\/\d+|[0-9.]+)/i,
    confidence: 0.85,
  },
  {
    name: "sectionNumber",
    pattern: /(?:section|sec\.?)[\s:]*([0-9]+)/i,
    confidence: 0.8,
  },
  {
    name: "township",
    pattern: /(?:township|twp\.?)[\s:]*([0-9]+\s*[NSEW])/i,
    confidence: 0.8,
  },
  {
    name: "range",
    pattern: /(?:range|rng\.?)[\s:]*([0-9]+\s*[NSEW])/i,
    confidence: 0.8,
  },
  {
    name: "county",
    pattern: /(?:county|cnty\.?)[\s:]*([A-Za-z\s]+)(?:county|cnty\.?)?/i,
    confidence: 0.9,
  },
  {
    name: "state",
    pattern: /(?:state)[\s:]*([A-Za-z\s]+)/i,
    confidence: 0.9,
  },
  {
    name: "wellName",
    pattern: /(?:well\s+name|well)[\s:]*([A-Za-z0-9\s\-#]+)/i,
    confidence: 0.75,
  },
  {
    name: "operator",
    pattern: /(?:operator)[\s:]*([A-Za-z0-9\s\-&,.]+)/i,
    confidence: 0.85,
  },
  {
    name: "ownerName",
    pattern: /(?:owner|name)[\s:]*([A-Za-z0-9\s\-&,.]+)/i,
    confidence: 0.7,
  },
  {
    name: "apiNumber",
    pattern: /(?:api\s+number|api\s+no\.?)[\s:]*([0-9-]+)/i,
    confidence: 0.95,
  },
  {
    name: "leaseNumber",
    pattern: /(?:lease\s+number|lease\s+no\.?)[\s:]*([A-Za-z0-9-]+)/i,
    confidence: 0.9,
  },
]

/**
 * Extract text from a PDF file
 */
export async function extractTextFromPDF(pdfData: ArrayBuffer): Promise<string> {
  try {
    const loadingTask = pdfjs.getDocument({ data: pdfData })
    const pdf = await loadingTask.promise

    let fullText = ""

    // Get total number of pages
    const numPages = pdf.numPages

    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(" ")
      fullText += `\n--- Page ${i} ---\n${pageText}`
    }

    return fullText
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    throw new Error("Failed to extract text from PDF")
  }
}

/**
 * Extract metadata from a PDF file
 */
export async function extractPDFMetadata(pdfData: ArrayBuffer): Promise<Record<string, string>> {
  try {
    const loadingTask = pdfjs.getDocument({ data: pdfData })
    const pdf = await loadingTask.promise
    const metadata = await pdf.getMetadata()

    return metadata.info || {}
  } catch (error) {
    console.error("Error extracting metadata from PDF:", error)
    return {}
  }
}

/**
 * Extract fields from text using regex patterns
 */
export function extractFieldsFromText(text: string): ExtractedField[] {
  const fields: ExtractedField[] = []

  fieldPatterns.forEach(({ name, pattern, confidence }) => {
    const match = text.match(pattern)
    if (match && match[1]) {
      // Determine which page the match is on
      const textBeforeMatch = text.substring(0, match.index)
      const pageMatches = [...textBeforeMatch.matchAll(/--- Page (\d+) ---/g)]
      const pageNumber = pageMatches.length > 0 ? Number.parseInt(pageMatches[pageMatches.length - 1][1]) : 1

      fields.push({
        name,
        value: match[1].trim(),
        confidence,
        pageNumber,
      })
    }
  })

  return fields
}

/**
 * Preprocess a PDF file
 */
export async function preprocessPDF(pdfData: ArrayBuffer): Promise<PreprocessedDocument> {
  try {
    // Extract text from PDF
    const text = await extractTextFromPDF(pdfData)

    // Extract metadata
    const metadata = await extractPDFMetadata(pdfData)

    // Extract fields from text
    const fields = extractFieldsFromText(text)

    // Get page count
    const loadingTask = pdfjs.getDocument({ data: pdfData })
    const pdf = await loadingTask.promise
    const pageCount = pdf.numPages

    return {
      text,
      fields,
      pageCount,
      metadata,
    }
  } catch (error) {
    console.error("Error preprocessing PDF:", error)
    throw new Error("Failed to preprocess PDF")
  }
}
