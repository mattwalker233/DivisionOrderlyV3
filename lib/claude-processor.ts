import { type ExtractedData } from './types'

interface ClaudeAnalysisResult {
  wellName: string;
  operator: string;
  county: string;
  royaltyInterest: number;
  tractAcres: number;
  ownerName: string;
  effectiveDate: string;
  confidence: number;
  propertyDescription?: string;
  additionalDetails?: Record<string, any>;
}

const ANTHROPIC_API_KEY = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
const ANTHROPIC_API_BASE_URL = process.env.NEXT_PUBLIC_ANTHROPIC_API_BASE_URL || 'https://api.anthropic.com/v1';

export async function processWithClaude(
  fileContent: string,
  fileName: string
): Promise<ExtractedData> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error(
      "Anthropic API key not configured. Please set the NEXT_PUBLIC_ANTHROPIC_API_KEY environment variable."
    );
  }

  try {
    // Prepare the system and user messages for Claude
    const systemMessage = `You are an expert in analyzing division orders for oil and gas properties. Your task is to extract key information from division order documents and return it in a structured JSON format.

Key points to remember:
1. Convert any fractional interests to decimal (e.g., 3/16 → 0.1875)
2. Standardize dates to MM/DD/YYYY format
3. Extract property descriptions including section, township, and range
4. Look for both direct mentions and implied information
5. Maintain high accuracy and indicate confidence levels
6. Return all monetary values as numbers without currency symbols`;

    const userMessage = `Please analyze this division order document and extract the following information. Format your response ONLY as a JSON object with these exact fields:

{
  "wellName": "string - the name of the well",
  "operator": "string - operating company name",
  "county": "string - county name",
  "royaltyInterest": "number - decimal format (e.g., 0.1875 for 3/16)",
  "tractAcres": "number - total acres in tract",
  "ownerName": "string - name of interest owner",
  "effectiveDate": "string - MM/DD/YYYY format",
  "propertyDescription": "string - section, township, range description",
  "confidence": "number - your confidence in the extraction (0.0 to 1.0)",
  "additionalDetails": {
    // any other relevant information found
  }
}

Document content:
${fileContent}`;

    // Call Claude API with the latest version
    const response = await fetch(`${ANTHROPIC_API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4096,
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.1, // Lower temperature for more consistent outputs
        system: "You are an expert in analyzing division orders for oil and gas properties."
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API Error Response:', errorText);
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const analysisResult = parseClaudeResponse(result.content[0].text);

    // Map the Claude result to our ExtractedData interface
    return {
      wellName: analysisResult.wellName || '',
      operator: analysisResult.operator || '',
      county: analysisResult.county || '',
      royaltyInterest: analysisResult.royaltyInterest || 0,
      tractAcres: analysisResult.tractAcres || 0,
      ownerName: analysisResult.ownerName || '',
      effectiveDate: analysisResult.effectiveDate || '',
      confidence: analysisResult.confidence || 0,
      propertyDescription: analysisResult.propertyDescription,
      preparedDate: analysisResult.additionalDetails?.preparedDate,
      rawData: {
        originalResponse: result,
        additionalDetails: analysisResult.additionalDetails
      }
    };
  } catch (error) {
    console.error('Error processing with Claude:', error);
    throw new Error(`Claude analysis failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function parseClaudeResponse(response: string): ClaudeAnalysisResult {
  try {
    // Extract JSON from Claude's response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Ensure numeric values are properly converted
    return {
      wellName: String(parsed.wellName || ''),
      operator: String(parsed.operator || ''),
      county: String(parsed.county || ''),
      royaltyInterest: convertToNumber(parsed.royaltyInterest),
      tractAcres: convertToNumber(parsed.tractAcres),
      ownerName: String(parsed.ownerName || ''),
      effectiveDate: String(parsed.effectiveDate || ''),
      confidence: convertToNumber(parsed.confidence),
      propertyDescription: parsed.propertyDescription ? String(parsed.propertyDescription) : undefined,
      additionalDetails: parsed.additionalDetails || {}
    };
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    return {
      wellName: '',
      operator: '',
      county: '',
      royaltyInterest: 0,
      tractAcres: 0,
      ownerName: '',
      effectiveDate: '',
      confidence: 0
    };
  }
}

function convertToNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Handle fractions
    if (value.includes('/')) {
      const [numerator, denominator] = value.split('/').map(Number);
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
    }
    // Handle percentage
    if (value.includes('%')) {
      const percentage = parseFloat(value.replace('%', ''));
      if (!isNaN(percentage)) {
        return percentage / 100;
      }
    }
    // Handle plain numbers
    const number = parseFloat(value);
    if (!isNaN(number)) {
      return number;
    }
  }
  return 0;
} 