/**
 * Renders a PDF page to a canvas element
 * @param pdf The PDF document object from PDF.js
 * @param pageNumber The page number to render (1-based)
 * @param canvas The canvas element to render to
 * @param scale Optional scale factor (default: 1.5)
 */
export async function renderPage(pdf: any, pageNumber: number, canvas: HTMLCanvasElement | null, scale = 1.5) {
  if (!canvas) {
    console.error("Canvas element is null")
    return
  }

  try {
    // Get the page
    const page = await pdf.getPage(pageNumber)

    // Set the scale for better rendering quality
    const viewport = page.getViewport({ scale })

    // Set canvas dimensions to match the viewport
    canvas.height = viewport.height
    canvas.width = viewport.width

    // Prepare canvas for rendering
    const context = canvas.getContext("2d")

    if (!context) {
      console.error("Could not get canvas context")
      return
    }

    // Clear the canvas before rendering
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Render the page
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    }

    await page.render(renderContext).promise
  } catch (error) {
    console.error("Error rendering PDF page:", error)
  }
}

/**
 * Gets information about a PDF document
 * @param pdf The PDF document object from PDF.js
 * @returns Object with document information
 */
export async function getPdfInfo(pdf: any) {
  try {
    const metadata = await pdf.getMetadata()
    return {
      numPages: pdf.numPages,
      title: metadata?.info?.Title || "Untitled Document",
      author: metadata?.info?.Author || "Unknown Author",
      creationDate: metadata?.info?.CreationDate || "Unknown Date",
    }
  } catch (error) {
    console.error("Error getting PDF info:", error)
    return {
      numPages: pdf.numPages,
      title: "Untitled Document",
      author: "Unknown Author",
      creationDate: "Unknown Date",
    }
  }
}
