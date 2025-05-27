/**
 * This module provides mock test data for development and testing.
 * It avoids direct file system access during build time.
 */

// Mock PDF buffer for testing
export const mockPdfBuffer = Buffer.from(
  "%PDF-1.5\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 68 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Sample Division Order Document for Testing) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000234 00000 n\n0000000302 00000 n\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n421\n%%EOF",
  "ascii",
)

// Mock extracted text for testing
export const mockExtractedText = `
Sample Division Order Document for Testing

Well Name: Test Well 1H
Section: 14
Township: 26S
Range: 32E
Owner: Test Owner LLC
Interest: 0.1875
Effective Date: 01/15/2023
Prepared: 01/10/2023

This is a sample division order document for testing purposes.
`

// Mock image buffer for testing
export const mockImageBuffer = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
)
