export interface StateData {
  code: string
  name: string
  description: string
  companies: Company[]
}

export interface Company {
  id: string
  name: string
  wells: Well[]
}

export interface Well {
  id: string
  name: string
  location: string
}

// Sample state data for design purposes
export const stateData: StateData[] = [
  {
    code: "TX",
    name: "Texas",
    description: "Manage division orders for Texas oil and gas properties",
    companies: [
      {
        id: "tx-company-1",
        name: "Permian Basin Energy",
        wells: [
          { id: "well-1", name: "Permian 1H", location: "Midland County" },
          { id: "well-2", name: "Permian 2H", location: "Reeves County" },
        ],
      },
      {
        id: "tx-company-2",
        name: "Texas Oil Partners",
        wells: [{ id: "well-3", name: "Eagle Ford 1", location: "Karnes County" }],
      },
    ],
  },
  {
    code: "NM",
    name: "New Mexico",
    description: "Manage division orders for New Mexico oil and gas properties",
    companies: [
      {
        id: "nm-company-1",
        name: "Delaware Basin LLC",
        wells: [{ id: "well-4", name: "Delaware 1H", location: "Lea County" }],
      },
    ],
  },
  {
    code: "OK",
    name: "Oklahoma",
    description: "Manage division orders for Oklahoma oil and gas properties",
    companies: [
      {
        id: "ok-company-1",
        name: "SCOOP Energy",
        wells: [{ id: "well-5", name: "SCOOP 1H", location: "Grady County" }],
      },
    ],
  },
]

// Required export functions
export function getStateByCode(code: string): StateData | undefined {
  return stateData.find((state) => state.code === code)
}

export function getCompanyById(companyId: string): Company | undefined {
  for (const state of stateData) {
    const company = state.companies.find((c) => c.id === companyId)
    if (company) return company
  }
  return undefined
}

export function getStateNameByCode(code: string): string {
  const state = getStateByCode(code)
  return state ? state.name : code
}

// Additional helper functions
export function getAllStates(): StateData[] {
  return stateData
}

export function getCompaniesByState(stateCode: string): Company[] {
  const state = getStateByCode(stateCode)
  return state ? state.companies : []
}
