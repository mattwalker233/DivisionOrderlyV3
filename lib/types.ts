import type React from "react"

// Division Order Types
export interface DivisionOrder {
  id: string
  fileName: string
  uploadDate: string
  wellName: string
  propertyDescription: string
  entity: string
  decimalInterest: number | string
  effectiveDate: string
  preparedDate: string
  extractedData?: ExtractedData
}

export interface ExtractedData {
  wellName: string
  operator: string
  county: string
  royaltyInterest: number
  tractAcres: number
  ownerName: string
  effectiveDate: string
  confidence: number
  rawData?: any
  propertyDescription?: string
  preparedDate?: string
  additionalDetails?: Record<string, any>
}

export interface SectionBreakdown {
  sectionNumber: string
  netAcres: number
  grossAcres: number
  royaltyInterest: number
  calculatedRoyalty: number
  confidenceScore: number
}

export interface ConfidenceField {
  value: string
  confidence: number
}

export interface Allocation {
  sectionNumber: string
  interestPercentage: number
  netAcres?: number
  royaltyAmount?: number
}

// Form Types
export interface StateSpecificField {
  id: string
  label: string
  type: "text" | "number" | "date" | "select"
  required: boolean
  options?: string[]
  placeholder?: string
  defaultValue?: string | number
  validation?: {
    pattern?: string
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
  }
}

export interface StateSpecificFormConfig {
  stateCode: string
  stateName: string
  fields: StateSpecificField[]
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Environment Status Types
export interface EnvironmentStatus {
  azureConfigured: boolean
  endpoint?: string
  apiKey?: string
  lastChecked: string
}

// Document Processing Types
export interface ProcessingResult {
  success: boolean
  extractedData?: ExtractedData
  error?: string
}

export interface DocumentProcessingOptions {
  enhancedExtraction: boolean
  confidenceThreshold: number
}

// UI Component Types
export interface TabData {
  id: string
  label: string
  icon?: React.ReactNode
  content: React.ReactNode
}

export interface ProgressStep {
  id: string
  label: string
  description?: string
  status: "pending" | "current" | "complete" | "error"
}

export interface FileUploadResult {
  success: boolean
  fileName: string
  fileSize: number
  fileType: string
  uploadDate: string
  error?: string
}

export interface ExtractionPreviewProps {
  extractedData: ExtractedData
  onEdit?: (field: string, value: string) => void
  onApprove?: () => void
  onReject?: () => void
}

export interface DocumentVerificationProps {
  file: File
  extractedData: ExtractedData
  onVerify: (verified: boolean, data: ExtractedData) => void
}

export interface PdfPreviewProps {
  file: File
  pageNumber?: number
  width?: number
  height?: number
  scale?: number
  onPageChange?: (pageNumber: number) => void
}

export interface StateSelector {
  selectedState: string
  onStateChange: (stateCode: string) => void
}

export interface OperatorSelector {
  stateCode: string
  selectedOperator: string
  onOperatorChange: (operatorId: string) => void
}

export interface WellSelector {
  stateCode: string
  operatorId: string
  selectedWell: string
  onWellChange: (wellId: string) => void
}

export interface CompanyFormProps {
  stateCode: string
  initialData?: Partial<Company>
  onSubmit: (data: Partial<Company>) => void
  onCancel?: () => void
}

export interface Company {
  id: string
  name: string
  stateCode: string
  county: string
  wells: Well[]
}

export interface Well {
  id: string
  name: string
  apiNumber?: string
  location?: string
}

export interface CompanyDisplayProps {
  company: Company
  onEdit?: () => void
  onDelete?: () => void
}

export interface AddCompanyModalProps {
  stateCode: string
  isOpen: boolean
  onClose: () => void
  onCompanyAdded: (company: Company) => void
}

export interface AddOperatorModalProps {
  stateCode: string
  isOpen: boolean
  onClose: () => void
  onOperatorAdded: (operator: { id: string; name: string }) => void
}

export interface FileUploaderProps {
  accept?: string
  maxSize?: number
  multiple?: boolean
  onUpload: (files: File[]) => void
  onError?: (error: string) => void
}

export interface DirectExtractionProps {
  file: File
  onExtracted: (data: ExtractedData) => void
  onError: (error: string) => void
}

export interface ExtractedInfoDisplayProps {
  extractedData: ExtractedData
  onEdit?: (field: keyof ExtractedData, value: any) => void
}

export interface AdvancedDocumentProcessorProps {
  file: File
  stateCode: string
  stateName: string
  companyId: string
  companyName: string
  onReset?: () => void
}

export interface PdfPreprocessorProps {
  file: File
  onPreprocessed: (result: { success: boolean; message: string; file?: File }) => void
}

export interface EnvironmentStatusProps {
  onSetupClick?: () => void
}

export interface AzureAiStatusProps {
  onSetupClick?: () => void
}

export interface AzureCredentialsFormProps {
  onSubmit: (credentials: { endpoint: string; apiKey: string }) => void
  onCancel?: () => void
  initialValues?: { endpoint?: string; apiKey?: string }
}

export interface AutoExtractionProps {
  file: File
  stateCode: string
  stateName: string
  companyId: string
  companyName: string
  onExtracted: (data: ExtractedData) => void
  onError: (error: string) => void
}
