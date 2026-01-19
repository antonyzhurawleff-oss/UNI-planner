// University data lookup helper
// This can be extended with real API calls or scraping

export interface UniversityInfo {
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  applicationStartDate?: string;
  applicationDeadline?: string;
  semesterStartDate?: string;
  tuitionFee?: string;
  commonPrograms?: string[];
}

// Knowledge base of real university data with actual program names
const UNIVERSITY_DATABASE: Record<string, Record<string, UniversityInfo & { commonPrograms?: string[] }>> = {
  Austria: {
    "University of Vienna": {
      websiteUrl: "https://www.univie.ac.at/en/",
      contactEmail: "studienabteilung@univie.ac.at",
      contactPhone: "+43 1 4277-0",
            applicationStartDate: "March 1, 2026",
            applicationDeadline: "September 5, 2026",
            semesterStartDate: "October 2026",
      tuitionFee: "€726.72 per semester for non-EU students, €0 for EU students",
      commonPrograms: ["Bachelor in Business and Economics (BBE)", "Master in Business Administration", "Bachelor in Computer Science", "Master in Computer Science"],
    },
    "Vienna University of Economics and Business": {
      websiteUrl: "https://www.wu.ac.at/en/",
      contactEmail: "admissions@wu.ac.at",
      contactPhone: "+43 1 31336-0",
            applicationStartDate: "February 1, 2026",
            applicationDeadline: "May 15, 2026",
            semesterStartDate: "October 2026",
      tuitionFee: "€726.72 per semester",
      commonPrograms: ["Bachelor in Business and Economics (BBE)", "Master in International Business", "Master in Finance", "Master in Marketing"],
    },
  },
  Germany: {
    "University of Heidelberg": {
      websiteUrl: "https://www.uni-heidelberg.de/en",
      contactEmail: "studium@uni-heidelberg.de",
      contactPhone: "+49 6221 54-0",
      applicationStartDate: "May 1, 2026",
      applicationDeadline: "July 15, 2026",
      semesterStartDate: "October 2026",
      tuitionFee: "€0 (free tuition for all students)",
    },
    "Technical University of Munich": {
      websiteUrl: "https://www.tum.de/en/",
      contactEmail: "studium@tum.de",
      contactPhone: "+49 89 289-01",
            applicationStartDate: "April 1, 2026",
            applicationDeadline: "May 31, 2026",
            semesterStartDate: "October 2026",
      tuitionFee: "€0 (free tuition)",
      commonPrograms: ["Master of Science in Computer Science", "Bachelor of Science in Computer Science", "Master of Science in Management"],
    },
    "Ludwig Maximilian University of Munich": {
      websiteUrl: "https://www.lmu.de/en/",
      contactEmail: "info@lmu.de",
      contactPhone: "+49 89 2180-0",
      applicationStartDate: "May 1, 2026",
      applicationDeadline: "July 15, 2026",
      semesterStartDate: "October 2026",
      tuitionFee: "€0 (free tuition)",
      commonPrograms: ["Bachelor of Science in Business Administration", "Master of Science in Business Administration", "Bachelor of Science in Computer Science"],
    },
    "LMU Munich": {
      websiteUrl: "https://www.lmu.de/en/",
      contactEmail: "info@lmu.de",
      contactPhone: "+49 89 2180-0",
      applicationStartDate: "May 1, 2026",
      applicationDeadline: "July 15, 2026",
      semesterStartDate: "October 2026",
      tuitionFee: "€0 (free tuition)",
    },
    "LMU": {
      websiteUrl: "https://www.lmu.de/en/",
      contactEmail: "info@lmu.de",
      contactPhone: "+49 89 2180-0",
      applicationStartDate: "May 1, 2026",
      applicationDeadline: "July 15, 2026",
      semesterStartDate: "October 2026",
      tuitionFee: "€0 (free tuition)",
    },
  },
  Netherlands: {
    "University of Amsterdam": {
      websiteUrl: "https://www.uva.nl/en",
      contactEmail: "info@uva.nl",
      contactPhone: "+31 20 525-9111",
      applicationStartDate: "October 1, 2025",
      applicationDeadline: "January 15, 2026",
      semesterStartDate: "September 2026",
      tuitionFee: "€2,314 per year for EU students, €9,000-15,000 for non-EU",
    },
    "Delft University of Technology": {
      websiteUrl: "https://www.tudelft.nl/en/",
      contactEmail: "contactcenter-esa@tudelft.nl",
      contactPhone: "+31 15 278-2222",
      applicationStartDate: "October 1, 2025",
      applicationDeadline: "January 15, 2026",
      semesterStartDate: "September 2026",
      tuitionFee: "€2,314 per year for EU students, €15,000-19,000 for non-EU",
    },
  },
  France: {
    "Sorbonne University": {
      websiteUrl: "https://www.sorbonne-universite.fr/en",
      contactEmail: "scolarite@sorbonne-universite.fr",
      contactPhone: "+33 1 44 27 30 00",
            applicationStartDate: "January 1, 2026",
            applicationDeadline: "April 1, 2026",
            semesterStartDate: "September 2026",
      tuitionFee: "€2,770 per year for EU students, €3,770 for non-EU",
    },
  },
  UK: {
    "University of Oxford": {
      websiteUrl: "https://www.ox.ac.uk/",
      contactEmail: "admissions@ox.ac.uk",
      contactPhone: "+44 1865 270000",
            applicationStartDate: "June 1, 2026",
            applicationDeadline: "October 15, 2026",
            semesterStartDate: "October 2026",
      tuitionFee: "£9,250 per year for UK students, £27,840-39,010 for international",
    },
    "University of Cambridge": {
      websiteUrl: "https://www.cam.ac.uk/",
      contactEmail: "admissions@cam.ac.uk",
      contactPhone: "+44 1223 333300",
            applicationStartDate: "June 1, 2026",
            applicationDeadline: "October 15, 2026",
            semesterStartDate: "October 2026",
      tuitionFee: "£9,250 per year for UK students, £24,507-63,990 for international",
    },
  },
};

export function getUniversityData(university: string, country: string): UniversityInfo | null {
  const countryData = UNIVERSITY_DATABASE[country];
  if (!countryData) return null;

  // Normalize university name for matching
  const normalized = university.trim();
  
  // Try exact match first
  if (countryData[normalized]) {
    return countryData[normalized];
  }

  // Try case-insensitive exact match
  const exactMatch = Object.keys(countryData).find((key) => 
    key.toLowerCase() === normalized.toLowerCase()
  );
  if (exactMatch) {
    return countryData[exactMatch];
  }

  // Try partial match - check if any key contains the university name or vice versa
  const matchedKey = Object.keys(countryData).find((key) => {
    const keyLower = key.toLowerCase();
    const uniLower = normalized.toLowerCase();
    
    // Check if university name contains key or key contains university name
    if (uniLower.includes(keyLower) || keyLower.includes(uniLower)) {
      return true;
    }
    
    // Extract main words and check matches
    const uniWords = uniLower.split(/\s+/).filter(w => w.length > 3);
    const keyWords = keyLower.split(/\s+/).filter(w => w.length > 3);
    
    // If at least 2 words match, consider it a match
    const matchingWords = uniWords.filter(w => keyWords.includes(w));
    return matchingWords.length >= 2;
  });

  return matchedKey ? countryData[matchedKey] : null;
}

export function enrichProgramWithUniversityData(program: { university: string; country: string; name?: string; field?: string; [key: string]: any }): any {
  const universityData = getUniversityData(program.university, program.country);
  
  if (!universityData) {
    return program;
  }

  // Enrich program with real data - use database data as primary source
  // Only use existing values if they are meaningful (not empty/null)
  const hasValue = (val: any) => val && val !== "Not specified" && val !== "not specified" && val.trim() !== "";
  
  // Try to suggest real program name if field matches
  let suggestedName = program.name;
  if (universityData.commonPrograms && program.field) {
    const fieldLower = program.field.toLowerCase();
    const matchingProgram = universityData.commonPrograms.find(p => 
      p.toLowerCase().includes(fieldLower) || 
      fieldLower.includes("business") && p.toLowerCase().includes("business") ||
      fieldLower.includes("economics") && p.toLowerCase().includes("economics")
    );
    if (matchingProgram && (!program.name || program.name === "Not specified")) {
      suggestedName = matchingProgram;
    }
  }
  
  return {
    ...program,
    // Use suggested real program name if available
    name: suggestedName || program.name,
    // Use database data first, fallback to existing if it's meaningful
    websiteUrl: universityData.websiteUrl || (hasValue(program.websiteUrl) ? program.websiteUrl : undefined),
    contactEmail: universityData.contactEmail || (hasValue(program.contactEmail) ? program.contactEmail : undefined),
    contactPhone: universityData.contactPhone || (hasValue(program.contactPhone) ? program.contactPhone : undefined),
    applicationStartDate: universityData.applicationStartDate || (hasValue(program.applicationStartDate) ? program.applicationStartDate : undefined),
    applicationDeadline: universityData.applicationDeadline || (hasValue(program.applicationDeadline) ? program.applicationDeadline : undefined),
    semesterStartDate: universityData.semesterStartDate || (hasValue(program.semesterStartDate) ? program.semesterStartDate : undefined),
    tuitionFee: universityData.tuitionFee || (hasValue(program.tuitionFee) ? program.tuitionFee : undefined),
  };
}
