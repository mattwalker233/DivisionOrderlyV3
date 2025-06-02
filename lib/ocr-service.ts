import { createWorker } from 'tesseract.js';
import { PDFDocument } from 'pdf-lib';

// Initialize worker with English language
let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

async function initializeWorker() {
  if (!worker) {
    worker = await createWorker('eng');
    // Configure worker for better accuracy
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,-%$/()', // Add characters you expect
      tessedit_pageseg_mode: '1', // Automatic page segmentation with OSD
      tessedit_ocr_engine_mode: '3', // Most accurate mode
    });
  }
  return worker;
}

export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  try {
    const worker = await initializeWorker();
    const { data: { text } } = await worker.recognize(imageBuffer);
    return text;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error('Failed to extract text from image');
  }
}

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const numPages = pdfDoc.getPageCount();
    let allText = '';

    // Process each page
    for (let i = 0; i < numPages; i++) {
      const page = pdfDoc.getPage(i);
      // Convert page to image (this is a simplified version, you might want to adjust resolution)
      const pngBytes = await page.exportImage({
        format: 'png',
        width: page.getWidth() * 2, // Double the resolution for better OCR
        height: page.getHeight() * 2
      });

      // Extract text from the image
      const pageText = await extractTextFromImage(Buffer.from(pngBytes));
      allText += `\\n--- Page ${i + 1} ---\\n${pageText}`;
    }

    return allText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export async function processDocument(file: File): Promise<string> {
  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (file.type === 'application/pdf') {
      return await extractTextFromPDF(buffer);
    } else if (file.type.startsWith('image/')) {
      return await extractTextFromImage(buffer);
    } else {
      throw new Error('Unsupported file type. Please upload a PDF or image file.');
    }
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}

// Clean up worker when done
export async function cleanup() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
} 