import { processWithClaude } from '@/lib/claude-processor';

export interface ExtractionResult {
  wellName: string;
  operator: string;
  county: string;
  royaltyInterest: number;
  tractAcres: number;
  ownerName: string;
  effectiveDate: string;
  propertyDescription?: string;
  preparedDate?: string;
}

async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  // Only import pdf-parse in server environment
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(pdfBuffer);
  return data.text;
}

async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    // For PDFs, we need to send to the server
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/extract-text', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to extract text from PDF');
    }
    
    const result = await response.json();
    return result.text;
  } else {
    // For text files, we can read directly in the browser
    return await file.text();
  }
}

export async function processDocument(input: File | Buffer): Promise<ExtractionResult> {
  try {
    let text: string;
    
    if (input instanceof File) {
      text = await extractTextFromFile(input);
    } else {
      text = await extractTextFromPDF(input);
    }

    const result = await processWithClaude(text, input instanceof File ? input.name : 'document.pdf');
    
    // Map the result to our ExtractionResult interface
    return {
      wellName: result.wellName,
      operator: result.operator,
      county: result.county,
      royaltyInterest: result.royaltyInterest,
      tractAcres: result.tractAcres,
      ownerName: result.ownerName,
      effectiveDate: result.effectiveDate,
      propertyDescription: result.propertyDescription,
      preparedDate: result.rawData?.additionalDetails?.preparedDate,
    };
  } catch (error) {
    console.error('Error processing document:', error);
    throw new Error('Failed to process document');
  }
}

/**
 * Calculate royalty amounts based on tract size, royalty interest, and allocations
 */
export function calculateRoyalties(
  tractSizeStr: string,
  royaltyInterestStr: string,
  allocations: { interestPercentage: number }[]
): { netAcres: number; royaltyAmount: number; interestPercentage: number }[] {
  // Parse tract size to get numeric value
  const tractSizeMatch = tractSizeStr.match(/(\d+(\.\d+)?)/)
  const tractSizeAcres = tractSizeMatch ? Number.parseFloat(tractSizeMatch[1]) : 0

  // Parse royalty interest
  const royaltyInterest = Number.parseFloat(royaltyInterestStr)

  // Calculate royalties for each allocation
  return allocations.map((allocation) => {
    const netAcres = tractSizeAcres * allocation.interestPercentage
    const royaltyAmount = netAcres * royaltyInterest

    return {
      ...allocation,
      netAcres,
      royaltyAmount,
    }
  })
}

/**
 * Validate that allocations add up to 100%
 */
export function validateAllocations(allocations: { interestPercentage: number }[]): boolean {
  const totalPercentage = allocations.reduce((sum, allocation) => sum + allocation.interestPercentage, 0)
  return Math.abs(totalPercentage - 1.0) < 0.0001 // Allow for small floating point errors
}
