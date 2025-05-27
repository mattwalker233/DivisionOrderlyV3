// State-specific field definitions for division orders

interface StateFieldDefinition {
  fields: Array<{
    key: string
    label: string
  }>
  sampleFields: Record<string, any>
  sampleCounty: string
  sampleAPI: string
  textDescription: string
  formatNotes: string
  validationErrors?: string[]
}

const stateFields: Record<string, StateFieldDefinition> = {
  // New Mexico
  NM: {
    fields: [
      { key: "section", label: "Section" },
      { key: "township", label: "Township" },
      { key: "range", label: "Range" },
      { key: "meridian", label: "Meridian" },
      { key: "unitName", label: "Unit Name" },
      { key: "divisionOrderNumber", label: "Division Order Number" },
      { key: "ocdWellID", label: "OCD Well ID" },
      { key: "newMexicoStateLeaseNumber", label: "New Mexico State Lease Number" },
      { key: "blmLeaseNumber", label: "BLM Lease Number" },
    ],
    sampleFields: {
      section: "Section 14",
      township: "Township 18S",
      range: "Range 32E",
      meridian: "New Mexico Principal Meridian",
      unitName: "Permian Basin Unit",
      divisionOrderNumber: "NM-DO-2023-1456",
      ocdWellID: "NM-WELL-12345",
      newMexicoStateLeaseNumber: "NM-LEASE-67890",
      blmLeaseNumber: "BLM-LEASE-54321",
      legalDescription: "Section 14, Township 18S, Range 32E, New Mexico Principal Meridian, Lea County, New Mexico",
    },
    sampleCounty: "Lea County",
    sampleAPI: "30-025-45678",
    textDescription: "Section 14, Township 18S, Range 32E",
    formatNotes:
      "New Mexico division orders require Section, Township, and Range information. The New Mexico Principal Meridian should be specified.",
  },

  // Texas
  TX: {
    fields: [
      { key: "section", label: "Section" },
      { key: "block", label: "Block" },
      { key: "survey", label: "Survey" },
      { key: "abstract", label: "Abstract" },
      { key: "railroadCommissionID", label: "Railroad Commission ID" },
      { key: "texasSeveranceTaxID", label: "Texas Severance Tax ID" },
      { key: "texasLeaseNumber", label: "Texas Lease Number" },
    ],
    sampleFields: {
      section: "Section 36",
      block: "Block 12",
      survey: "PSL Survey",
      abstract: "Abstract 123",
      railroadCommissionID: "12345",
      texasSeveranceTaxID: "TX-STAX-67890",
      texasLeaseNumber: "TX-LEASE-54321",
      legalDescription: "The East Half (E/2) of Section 36, Block 12, PSL Survey, Abstract 123, Reeves County, Texas",
    },
    sampleCounty: "Reeves County",
    sampleAPI: "42-389-45678",
    textDescription: "Section 36, Block 12, PSL Survey, Abstract 123",
    formatNotes:
      "Texas division orders typically include Section, Block, and Survey information. Abstract numbers are required for proper legal description.",
  },

  // Oklahoma
  OK: {
    fields: [
      { key: "section", label: "Section" },
      { key: "township", label: "Township" },
      { key: "range", label: "Range" },
      { key: "spotting", label: "Spotting" },
      { key: "quarterSection", label: "Quarter Section" },
      { key: "occWellID", label: "OCC Well ID" },
      { key: "oklahomaTaxID", label: "Oklahoma Tax ID" },
    ],
    sampleFields: {
      section: "Section 23",
      township: "Township 4N",
      range: "Range 3W",
      spotting: "C NE/4",
      quarterSection: "NE/4",
      occWellID: "OK-WELL-12345",
      oklahomaTaxID: "OK-TAX-67890",
      legalDescription: "The Northeast Quarter (NE/4) of Section 23, Township 4N, Range 3W, Garfield County, Oklahoma",
    },
    sampleCounty: "Garfield County",
    sampleAPI: "35-047-45678",
    textDescription: "Section 23, Township 4N, Range 3W",
    formatNotes:
      "Oklahoma division orders require Section, Township, and Range information. Spotting information (e.g., C NE/4) is often included for well locations.",
  },

  // North Dakota
  ND: {
    fields: [
      { key: "section", label: "Section" },
      { key: "township", label: "Township" },
      { key: "range", label: "Range" },
      { key: "quarterSection", label: "Quarter Section" },
      { key: "spacing", label: "Spacing" },
      { key: "ndicWellID", label: "NDIC Well ID" },
      { key: "northDakotaLeaseNumber", label: "North Dakota Lease Number" },
    ],
    sampleFields: {
      section: "Section 18",
      township: "Township 152N",
      range: "Range 102W",
      quarterSection: "SW/4",
      spacing: "1280-acre spacing unit",
      ndicWellID: "ND-WELL-12345",
      northDakotaLeaseNumber: "ND-LEASE-67890",
      legalDescription:
        "The Southwest Quarter (SW/4) of Section 18, Township 152N, Range 102W, McKenzie County, North Dakota",
    },
    sampleCounty: "McKenzie County",
    sampleAPI: "33-053-45678",
    textDescription: "Section 18, Township 152N, Range 102W",
    formatNotes:
      "North Dakota division orders require Section, Township, and Range information. Spacing unit size is often specified.",
    validationErrors: ["Verify spacing unit size matches the legal description."],
  },

  // Colorado
  CO: {
    fields: [
      { key: "section", label: "Section" },
      { key: "township", label: "Township" },
      { key: "range", label: "Range" },
      { key: "cogccWellID", label: "COGCC Well ID" },
      { key: "coloradoStateLeaseNumber", label: "Colorado State Lease Number" },
    ],
    sampleFields: {
      section: "Section 5",
      township: "Township 20N",
      range: "Range 5E",
      cogccWellID: "CO-WELL-12345",
      coloradoStateLeaseNumber: "CO-LEASE-67890",
      legalDescription: "Section 5, Township 20N, Range 5E, Denver County, Colorado",
    },
    sampleCounty: "Denver County",
    sampleAPI: "16-026-45678",
    textDescription: "Section 5, Township 20N, Range 5E",
    formatNotes:
      "Colorado division orders use Section, Township, and Range. COGCC Well ID is required for identification.",
  },

  // Ohio
  OH: {
    fields: [
      { key: "tract", label: "Tract" },
      { key: "lot", label: "Lot" },
      { key: "township", label: "Township" },
      { key: "quarterTownship", label: "Quarter Township" },
      { key: "taxParcelID", label: "Tax Parcel ID" },
      { key: "odnrWellID", label: "ODNR Well ID" },
      { key: "ohioLeaseNumber", label: "Ohio Lease Number" },
      { key: "ohioSeveranceTaxID", label: "Ohio Severance Tax ID" },
    ],
    sampleFields: {
      tract: "Tract 22",
      lot: "Lot 12",
      township: "Green Township",
      quarterTownship: "SE Quarter",
      taxParcelID: "12-345-67",
      odnrWellID: "OH-WELL-12345",
      ohioLeaseNumber: "OH-LEASE-67890",
      ohioSeveranceTaxID: "OH-STAX-54321",
      legalDescription: "Lot 12, Green Township, Belmont County, Ohio",
    },
    sampleCounty: "Belmont County",
    sampleAPI: "34-013-45678",
    textDescription: "Lot 12, Green Township",
    formatNotes:
      "Ohio uses a unique system based on the Original Land Survey with townships divided into quarters and lots. Tax parcel IDs are essential for property identification.",
  },

  // West Virginia
  WV: {
    fields: [
      { key: "tract", label: "Tract" },
      { key: "township", label: "Township" },
      { key: "range", label: "Range" },
      { key: "wvdepWellAPINumber", label: "WVDEP Well API Number" },
      { key: "westVirginiaLeaseNumber", label: "West Virginia Lease Number" },
      { key: "westVirginiaSeveranceTaxID", label: "West Virginia Severance Tax ID" },
    ],
    sampleFields: {
      tract: "Tract 30",
      township: "Township 10N",
      range: "Range 2E",
      wvdepWellAPINumber: "WV-WELL-12345",
      westVirginiaLeaseNumber: "WV-LEASE-67890",
      westVirginiaSeveranceTaxID: "WV-STAX-54321",
      legalDescription: "Tract 30, Township 10N, Range 2E, Kanawha County, West Virginia",
    },
    sampleCounty: "Kanawha County",
    sampleAPI: "36-018-45678",
    textDescription: "Tract 30, Township 10N, Range 2E",
    formatNotes:
      "West Virginia division orders use Tract, Township, and Range. WVDEP Well API Number is required for identification.",
  },

  // Pennsylvania
  PA: {
    fields: [
      { key: "tract", label: "Tract" },
      { key: "township", label: "Township" },
      { key: "warrantName", label: "Warrant Name" },
      { key: "taxParcelID", label: "Tax Parcel ID" },
      { key: "deedBook", label: "Deed Book" },
      { key: "padepWellAPINumber", label: "PA DEP Well API Number" },
      { key: "pennsylvaniaLeaseNumber", label: "Pennsylvania Lease Number" },
      { key: "pennsylvaniaWellPermitNumber", label: "Pennsylvania Well Permit Number" },
    ],
    sampleFields: {
      tract: "Tract 45",
      township: "Washington Township",
      warrantName: "Smith Warrant",
      taxParcelID: "12-34-567",
      deedBook: "Book 123, Page 456",
      padepWellAPINumber: "PA-WELL-12345",
      pennsylvaniaLeaseNumber: "PA-LEASE-67890",
      pennsylvaniaWellPermitNumber: "PA-PERM-54321",
      legalDescription: "Tract 45, Washington Township, Washington County, Pennsylvania",
    },
    sampleCounty: "Washington County",
    sampleAPI: "37-125-45678",
    textDescription: "Tract 45, Washington Township",
    formatNotes:
      "Pennsylvania division orders typically use tract numbers and township names rather than the Section, Township, Range system. Deed book references are important for title verification.",
  },

  // Louisiana
  LA: {
    fields: [
      { key: "section", label: "Section" },
      { key: "township", label: "Township" },
      { key: "range", label: "Range" },
      { key: "parish", label: "Parish" },
      { key: "unitDesignation", label: "Unit Designation" },
    ],
    sampleFields: {
      section: "Section 4",
      township: "Township 12S",
      range: "Range 4E",
      parish: "Caddo Parish",
      unitDesignation: "HA RA SU",
      legalDescription: "Section 4, Township 12S, Range 4E, Caddo Parish, Louisiana",
    },
    sampleCounty: "Caddo Parish",
    sampleAPI: "17-017-45678",
    textDescription: "Section 4, Township 12S, Range 4E",
    formatNotes:
      "Louisiana division orders use Section, Township, and Range, but refer to counties as 'parishes'. Unit designations are often included for unitized fields.",
  },
}

export function getStateSpecificFields(stateCode: string): StateFieldDefinition {
  return stateFields[stateCode] || stateFields.TX // Default to Texas if state not found
}
