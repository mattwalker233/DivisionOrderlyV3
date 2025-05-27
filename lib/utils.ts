import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the default county for a state code
 */
export function getDefaultCounty(stateCode: string): string {
  const countyMap: Record<string, string> = {
    TX: "Reeves County",
    NM: "Lea County",
    OH: "Belmont County",
    WV: "Doddridge County",
    PA: "Washington County",
    OK: "Kingfisher County",
    ND: "McKenzie County",
    LA: "Caddo Parish",
  }
  return countyMap[stateCode] || "Sample County"
}

/**
 * Get state name by state code
 */
export function getStateNameByCode(stateCode: string): string {
  const stateMap: Record<string, string> = {
    TX: "Texas",
    NM: "New Mexico",
    OH: "Ohio",
    WV: "West Virginia",
    PA: "Pennsylvania",
    OK: "Oklahoma",
    ND: "North Dakota",
    LA: "Louisiana",
  }
  return stateMap[stateCode] || stateCode
}

/**
 * Get state by code
 */
export function getStateByCode(stateCode: string): { code: string; name: string } {
  return {
    code: stateCode,
    name: getStateNameByCode(stateCode),
  }
}

/**
 * Get company by ID
 */
export function getCompanyById(companyId: string): { id: string; name: string } {
  // This is a placeholder. In a real app, you would fetch this from a database
  return {
    id: companyId,
    name: `Company ${companyId}`,
  }
}
