import { DocumentAnalysisClient, AzureKeyCredential } from "@azure/ai-form-recognizer"

export interface AzureDocumentField {
  type: string
  text: string
  confidence: number
  boundingBox?: number[]
  page?: number
}

export interface AzureExtractionResult {
  fields: AzureDocumentField[]
  tables: any[]
  pages: number
  confidence: number
  processingTime: number
}

export class AzureDocumentIntelligenceClient {
  private client: DocumentAnalysisClient | null = null
  private endpoint: string | null = null
  private apiKey: string | null = null

  constructor(endpoint?: string, apiKey?: string) {
    this.endpoint = endpoint || process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT || null
    this.apiKey = apiKey || process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY || null

    if (this.endpoint && this.apiKey) {
      try {
        this.client = new DocumentAnalysisClient(this.endpoint, new AzureKeyCredential(this.apiKey))
      } catch (error) {
        console.error("Failed to initialize Azure Document Intelligence client:", error)
        this.client = null
      }
    }
  }

  /**
   * Check if Azure Document Intelligence is available
   */
  isAvailable(): boolean {
    return this.client !== null && this.endpoint !== null && this.apiKey !== null
  }

  /**
   * Analyze a document using Azure Document Intelligence
   */
  async analyzeDocument(fileBuffer: Buffer, fileName: string): Promise<AzureExtractionResult> {
    if (!this.client) {
      throw new Error("Azure Document Intelligence client is not available")
    }

    const startTime = Date.now()

    try {
      console.log(`Analyzing document with Azure Document Intelligence: ${fileName}`)

      // Use the prebuilt-document model for general document analysis
      const poller = await this.client.beginAnalyzeDocument("prebuilt-document", fileBuffer)
      const result = await poller.pollUntilDone()

      const processingTime = Date.now() - startTime
      console.log(`Azure analysis completed in ${processingTime}ms`)

      if (!result.documents || result.documents.length === 0) {
        throw new Error("No documents found in the analysis result")
      }

      const document = result.documents[0]
      const fields: AzureDocumentField[] = []

      // Extract key-value pairs
      if (result.keyValuePairs) {
        for (const kvp of result.keyValuePairs) {
          if (kvp.key && kvp.value) {
            const keyText = kvp.key.content?.toLowerCase() || ""
            const valueText = kvp.value.content || ""

            // Map common division order fields
            const fieldType = this.mapFieldType(keyText, valueText)

            if (fieldType) {
              fields.push({
                type: fieldType,
                text: valueText,
                confidence: (kvp.confidence || 0) * 100,
                boundingBox: kvp.value.boundingRegions?.[0]?.polygon,
                page: kvp.value.boundingRegions?.[0]?.pageNumber || 1,
              })
            }
          }
        }
      }

      // Extract additional fields from document content
      if (result.content) {
        const additionalFields = this.extractFieldsFromContent(result.content)
        fields.push(...additionalFields)
      }

      // Extract tables
      const tables =
        result.tables?.map((table) => ({
          rowCount: table.rowCount,
          columnCount: table.columnCount,
          cells: table.cells?.map((cell) => ({
            content: cell.content,
            rowIndex: cell.rowIndex,
            columnIndex: cell.columnIndex,
            confidence: cell.confidence,
          })),
        })) || []

      return {
        fields: this.deduplicateFields(fields),
        tables,
        pages: result.pages?.length || 1,
        confidence: this.calculateOverallConfidence(fields),
        processingTime,
      }
    } catch (error) {
      console.error("Error analyzing document with Azure:", error)
      throw new Error(
        `Azure Document Intelligence analysis failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Map field names to standardized types
   */
  private mapFieldType(keyText: string, valueText: string): string | null {
    const fieldMappings: Record<string, string> = {
      // Well information
      "well name": "WELL_NAME",
      well: "WELL_NAME",
      "api number": "API_NUMBER",
      api: "API_NUMBER",

      // Property description
      section: "SECTION",
      township: "TOWNSHIP",
      range: "RANGE",
      "property description": "PROPERTY_DESCRIPTION",
      "legal description": "PROPERTY_DESCRIPTION",

      // Entity information
      entity: "ENTITY",
      owner: "ENTITY",
      lessor: "ENTITY",
      company: "ENTITY",
      payee: "ENTITY",

      // Interest information
      "decimal interest": "DECIMAL_INTEREST",
      interest: "DECIMAL_INTEREST",
      "royalty interest": "DECIMAL_INTEREST",
      percentage: "DECIMAL_INTEREST",

      // Dates
      "effective date": "EFFECTIVE_DATE",
      "date prepared": "PREPARED_DATE",
      prepared: "PREPARED_DATE",
      date: "PREPARED_DATE",

      // Location
      county: "COUNTY",
      state: "STATE",

      // Operator
      operator: "OPERATOR",
      company: "OPERATOR",

      // Tract information
      "tract size": "TRACT_SIZE",
      acres: "TRACT_SIZE",
      acreage: "TRACT_SIZE",
    }

    for (const [key, type] of Object.entries(fieldMappings)) {
      if (keyText.includes(key)) {
        return type
      }
    }

    // Check if the value looks like specific field types
    if (this.looksLikeWellName(valueText)) return "WELL_NAME"
    if (this.looksLikeSection(valueText)) return "SECTION"
    if (this.looksLikeDecimalInterest(valueText)) return "DECIMAL_INTEREST"
    if (this.looksLikeDate(valueText)) return "EFFECTIVE_DATE"

    return null
  }

  /**
   * Extract fields from document content using pattern matching
   */
  private extractFieldsFromContent(content: string): AzureDocumentField[] {
    const fields: AzureDocumentField[] = []

    // Well name patterns
    const wellNameMatch = content.match(/(?:Well Name|Well)[:\s]+([A-Za-z0-9\s\-#]+(?:\d+[A-Za-z]?))/i)
    if (wellNameMatch && wellNameMatch[1]) {
      fields.push({
        type: "WELL_NAME",
        text: wellNameMatch[1].trim(),
        confidence: 85,
      })
    }

    // Section patterns
    const sectionMatch = content.match(/(?:Section|Sec\.?)[:\s]*(\d+)/i)
    if (sectionMatch && sectionMatch[1]) {
      fields.push({
        type: "SECTION",
        text: `Section ${sectionMatch[1]}`,
        confidence: 90,
      })
    }

    // Township patterns
    const townshipMatch = content.match(/(?:Township|Twp\.?)[:\s]*(\d+\s*[NSEW])/i)
    if (townshipMatch && townshipMatch[1]) {
      fields.push({
        type: "TOWNSHIP",
        text: `Township ${townshipMatch[1]}`,
        confidence: 90,
      })
    }

    // Range patterns
    const rangeMatch = content.match(/(?:Range|Rng\.?)[:\s]*(\d+\s*[NSEW])/i)
    if (rangeMatch && rangeMatch[1]) {
      fields.push({
        type: "RANGE",
        text: `Range ${rangeMatch[1]}`,
        confidence: 90,
      })
    }

    // Entity patterns
    const entityMatch = content.match(/(?:Entity|Owner|Lessor|Payee)[:\s]+([A-Za-z0-9\s\-&,.LLC]+)/i)
    if (entityMatch && entityMatch[1]) {
      fields.push({
        type: "ENTITY",
        text: entityMatch[1].trim(),
        confidence: 85,
      })
    }

    // Decimal interest patterns
    const interestMatch = content.match(/(?:Decimal Interest|Interest)[:\s]+(\d+\.?\d*)/i)
    if (interestMatch && interestMatch[1]) {
      fields.push({
        type: "DECIMAL_INTEREST",
        text: interestMatch[1],
        confidence: 90,
      })
    }

    // Effective date patterns
    const effectiveDateMatch = content.match(/(?:Effective Date)[:\s]+([A-Za-z0-9\s,\-/]+)/i)
    if (effectiveDateMatch && effectiveDateMatch[1]) {
      fields.push({
        type: "EFFECTIVE_DATE",
        text: effectiveDateMatch[1].trim(),
        confidence: 85,
      })
    }

    // Prepared date patterns
    const preparedDateMatch = content.match(/(?:Date Prepared|Prepared)[:\s]+([A-Za-z0-9\s,\-/]+)/i)
    if (preparedDateMatch && preparedDateMatch[1]) {
      fields.push({
        type: "PREPARED_DATE",
        text: preparedDateMatch[1].trim(),
        confidence: 85,
      })
    }

    // County patterns
    const countyMatch = content.match(/(?:County)[:\s]+([A-Za-z\s]+County)/i)
    if (countyMatch && countyMatch[1]) {
      fields.push({
        type: "COUNTY",
        text: countyMatch[1].trim(),
        confidence: 90,
      })
    }

    return fields
  }

  /**
   * Helper methods to identify field types
   */
  private looksLikeWellName(text: string): boolean {
    return /\w+\s+\d+[A-Za-z]?$/i.test(text) || /well/i.test(text)
  }

  private looksLikeSection(text: string): boolean {
    return /^(?:section\s+)?\d+$/i.test(text)
  }

  private looksLikeDecimalInterest(text: string): boolean {
    return /^\d*\.?\d+$/.test(text) && Number.parseFloat(text) <= 1
  }

  private looksLikeDate(text: string): boolean {
    return /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(text) || /\w+\s+\d{1,2},?\s+\d{4}/.test(text)
  }

  /**
   * Remove duplicate fields, keeping the one with highest confidence
   */
  private deduplicateFields(fields: AzureDocumentField[]): AzureDocumentField[] {
    const fieldMap = new Map<string, AzureDocumentField>()

    for (const field of fields) {
      const existing = fieldMap.get(field.type)
      if (!existing || field.confidence > existing.confidence) {
        fieldMap.set(field.type, field)
      }
    }

    return Array.from(fieldMap.values())
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(fields: AzureDocumentField[]): number {
    if (fields.length === 0) return 0

    const totalConfidence = fields.reduce((sum, field) => sum + field.confidence, 0)
    return Math.round(totalConfidence / fields.length)
  }
}

/**
 * Create a new Azure Document Intelligence client
 */
export function createAzureClient(endpoint?: string, apiKey?: string): AzureDocumentIntelligenceClient {
  return new AzureDocumentIntelligenceClient(endpoint, apiKey)
}
