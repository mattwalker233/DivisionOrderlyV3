import { AnalyzeDocumentCommand, GetDocumentAnalysisCommand } from "@aws-sdk/client-textract";
import { textractClient } from "./textract-config";

export interface TextractResponse {
  text: string;
  confidence: number;
  formFields: Record<string, string>;
}

/**
 * Process a PDF document using Amazon Textract
 * @param documentBuffer PDF file buffer
 * @returns Extracted text and form fields
 */
export async function processDocument(documentBuffer: Buffer): Promise<TextractResponse> {
  try {
    // Start synchronous document analysis
    const command = new AnalyzeDocumentCommand({
      Document: {
        Bytes: documentBuffer
      },
      FeatureTypes: ["FORMS", "TABLES"], // Enable form and table extraction
    });

    const response = await textractClient.send(command);

    // Process the response
    let extractedText = "";
    const formFields: Record<string, string> = {};
    let totalConfidence = 0;
    let blockCount = 0;

    response.Blocks?.forEach(block => {
      if (block.BlockType === "LINE" && block.Text) {
        extractedText += block.Text + "\n";
        if (block.Confidence) {
          totalConfidence += block.Confidence;
          blockCount++;
        }
      }
      
      // Extract form fields
      if (block.BlockType === "KEY_VALUE_SET" && block.EntityTypes?.includes("KEY")) {
        const key = block.Text;
        const valueBlock = response.Blocks?.find(b => 
          b.BlockType === "KEY_VALUE_SET" && 
          b.Id === block.Relationships?.find(r => r.Type === "VALUE")?.Ids?.[0]
        );
        
        if (key && valueBlock?.Text) {
          formFields[key] = valueBlock.Text;
        }
      }
    });

    const averageConfidence = blockCount > 0 ? totalConfidence / blockCount : 0;

    return {
      text: extractedText.trim(),
      confidence: averageConfidence,
      formFields
    };
  } catch (error) {
    console.error("Error processing document with Textract:", error);
    throw error;
  }
} 