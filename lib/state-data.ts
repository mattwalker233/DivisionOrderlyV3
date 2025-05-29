export interface State {
  code: string;
  name: string;
  description: string;
  companies: string[];
}

export const stateData: State[] = [
  {
    code: "TX",
    name: "Texas",
    description: "Permian Basin & Eagle Ford Shale",
    companies: ["Devon Energy", "Pioneer Natural Resources", "EOG Resources"]
  },
  {
    code: "NM",
    name: "New Mexico",
    description: "Delaware Basin & San Juan Basin",
    companies: ["Occidental", "ConocoPhillips"]
  },
  {
    code: "OK",
    name: "Oklahoma",
    description: "SCOOP/STACK & Anadarko Basin",
    companies: ["Continental Resources", "Marathon Oil"]
  },
  {
    code: "ND",
    name: "North Dakota",
    description: "Bakken Formation",
    companies: ["Hess Corporation", "Whiting Petroleum"]
  },
  {
    code: "LA",
    name: "Louisiana",
    description: "Haynesville Shale",
    companies: ["Chesapeake Energy", "Comstock Resources"]
  },
  {
    code: "PA",
    name: "Pennsylvania",
    description: "Marcellus Shale",
    companies: ["EQT Corporation", "Range Resources"]
  },
  {
    code: "OH",
    name: "Ohio",
    description: "Utica Shale & Point Pleasant Formation",
    companies: ["Ascent Resources", "Gulfport Energy"]
  },
  {
    code: "WV",
    name: "West Virginia",
    description: "Marcellus & Utica Shale",
    companies: ["Antero Resources", "Southwestern Energy"]
  },
  {
    code: "CO",
    name: "Colorado",
    description: "DJ Basin & Piceance Basin",
    companies: ["PDC Energy", "Civitas Resources"]
  },
  {
    code: "WY",
    name: "Wyoming",
    description: "Powder River & Green River Basins",
    companies: ["Chesapeake Energy", "PureWest Energy"]
  }
];

export function getStateByCode(code: string): State | undefined {
  return stateData.find(state => state.code === code);
}

export function getStateNameByCode(code: string): string {
  const state = getStateByCode(code);
  return state ? state.name : code;
}

export function getCompaniesByState(code: string): string[] {
  const state = getStateByCode(code);
  return state ? state.companies : [];
}

export function getCompanyById(stateCode: string, companyId: string): string | undefined {
  const state = getStateByCode(stateCode);
  if (!state) return undefined;
  return state.companies[parseInt(companyId)];
}
