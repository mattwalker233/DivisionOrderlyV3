import { DetectDocumentTextCommand } from "@aws-sdk/client-textract";
import { textractClient } from "./textract-config";

export async function testTextractConnection() {
  try {
    // Create a simple test image/document
    const testBuffer = Buffer.from('Test document');
    
    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: testBuffer
      }
    });

    console.log('Testing Textract connection...');
    const response = await textractClient.send(command);
    console.log('Textract connection successful!');
    console.log('Response:', JSON.stringify(response, null, 2));
    return true;
  } catch (error) {
    console.error('Textract connection test failed:', error);
    return false;
  }
} 