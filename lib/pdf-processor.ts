import pdfParse from "pdf-parse"
import { createCanvas } from "canvas"
import { createWorker } from "tesseract.js"
import sharp from "sharp"
import * as pdfjsLib from "pdfjs-dist"

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

// Initialize Tesseract worker
let tesseractWorker: any = null

async function initializeTesseractWorker() {
  if (!tesseractWorker) {
    tesseractWorker = await createWorker("eng")
  }
  return tesseractWorker
}

/**
 * Extract text from a PDF using pdf-parse
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(pdfBuffer)
    return data.text
  } catch (error) {
    console.error("Error extracting text with pdf-parse:", error)
    return ""
  }
}

/**
 * Render a PDF page to an image using PDF.js and canvas
 */
export async function renderPDFPageToImage(pdfBuffer: Buffer, pageNum: number): Promise<Buffer> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer })
    const pdf = await loadingTask.promise

    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: 2.0 }) // Higher scale for better OCR

    const canvas = createCanvas(viewport.width, viewport.height)
    const context = canvas.getContext("2d")

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    }

    await page.render(renderContext).promise

    // Convert canvas to buffer
    const imageBuffer = canvas.toBuffer("image/png")
    return imageBuffer
  } catch (error) {
    console.error("Error rendering PDF page to image:", error)
    throw error
  }
}

/**
 * Process an image with OCR using Tesseract.js
 */
export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  try {
    const worker = await initializeTesseractWorker()

    // Optimize image for OCR
    const optimizedImageBuffer = await sharp(imageBuffer)
      .greyscale() // Convert to grayscale
      .normalize() // Normalize the image
      .sharpen() // Sharpen the image
      .toBuffer()

    const { data } = await worker.recognize(optimizedImageBuffer)
    return data.text
  } catch (error) {
    console.error("Error extracting text from image with Tesseract:", error)
    return ""
  }
}

/**
 * Extract text from a PDF using both pdf-parse and OCR for better results
 */
export async function extractTextFromPDFWithOCR(pdfBuffer: Buffer): Promise<string> {
  try {
    // First try with pdf-parse for text layer extraction
    const textLayerContent = await extractTextFromPDF(pdfBuffer)

    // If we got substantial text, return it
    if (textLayerContent.length > 100) {
      return textLayerContent
    }

    // If text layer extraction didn't yield good results, try OCR
    console.log("Text layer extraction insufficient, trying OCR...")

    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer })
    const pdf = await loadingTask.promise
    const numPages = pdf.numPages

    let fullText = ""

    // Process first 5 pages or all pages if less than 5
    const pagesToProcess = Math.min(numPages, 5)

    for (let i = 1; i <= pagesToProcess; i++) {
      console.log(`Processing page ${i} of ${pagesToProcess} with OCR`)
      const pageImage = await renderPDFPageToImage(pdfBuffer, i)
      const pageText = await extractTextFromImage(pageImage)
      fullText += `\n--- Page ${i} ---\n${pageText}`
    }

    return fullText
  } catch (error) {
    console.error("Error in extractTextFromPDFWithOCR:", error)
    return ""
  }
}

/**
 * Process a document (PDF or image) and extract text
 */
export async function processDocument(file: Buffer, mimeType: string): Promise<string> {
  try {
    if (mimeType === "application/pdf") {
      return await extractTextFromPDFWithOCR(file)
    } else if (mimeType.startsWith("image/")) {
      // Optimize image for OCR
      const optimizedImageBuffer = await sharp(file).greyscale().normalize().sharpen().toBuffer()

      return await extractTextFromImage(optimizedImageBuffer)
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`)
    }
  } catch (error) {
    console.error("Error processing document:", error)
    throw error
  }
}

/**
 * Clean up resources when done
 */
export async function cleanupResources() {
  if (tesseractWorker) {
    await tesseractWorker.terminate()
    tesseractWorker = null
  }
}
