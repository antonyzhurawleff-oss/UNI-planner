import OpenAI from "openai";
import { UserInput, AIResponse, AdmissionPlan, Program } from "@/app/types";
import { enrichProgramWithUniversityData } from "./universityData";
import { 
  searchUniversityAdmissionInfo, 
  searchProgramStructure,
  formatSearchResultsForPrompt,
  searchUniversityImage,
  searchAdmissionRequirements,
  searchStudentHousing,
  searchHousingImage,
  searchCountryInfo,
  searchCountryAdvantages,
  SearchResult
} from "./webSearch";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAdmissionPlan(input: UserInput): Promise<AIResponse> {
  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
    throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY in .env.local");
  }

  // Search for real-time admission data using SerpAPI
  let realTimeData = "";
  try {
    const searchPromises = input.countries.flatMap(country =>
      input.programs.map(program =>
        searchUniversityAdmissionInfo("", program, country)
      )
    );
    
    const allResults = await Promise.all(searchPromises);
    const searchResults = allResults.flat();
    
    if (searchResults.length > 0) {
      realTimeData = `\n\nREAL-TIME SEARCH RESULTS FROM INTERNET:\n${formatSearchResultsForPrompt(searchResults)}\n\nUSE THIS REAL-TIME DATA to get accurate admission requirements, deadlines, and contact information. Prioritize information from these search results over general knowledge.`;
    }
  } catch (error) {
    console.warn("Web search failed, continuing without real-time data:", error);
    realTimeData = "\n\nNote: Real-time web search is not available. Use your knowledge base and typical university information.";
  }

  const prompt = `You are an admissions advisor. Generate detailed program recommendations with COMPLETE REAL-WORLD information.

IMPORTANT: You MUST use REAL, ACTUAL information from the internet about universities. Search for and use:
- Real university websites and program pages
- Actual admissions office contact information (email and phone)
- Real application deadlines and dates for 2025-2026 academic year
- Actual tuition fees and costs
- Real program descriptions and requirements

Based on the following profile:
- Admission type: ${input.admissionType}
- Countries: ${input.countries.join(", ")}
- Desired programs/fields: ${input.programs.join(", ")}
- Program language preference: ${input.programLanguage === "English" ? "English-taught programs only" : input.programLanguage === "Local" ? "Local language programs only" : "Either English or local language"}
- Grades: ${input.grades}
- Language exam: ${input.languageExam}${input.examScore ? ` (Score: ${input.examScore})` : ""}
- Budget: ${input.budget}

Return JSON with specific programs including ALL REAL details:
{
  "programs": [
    {
      "name": "REAL program name from university website (e.g., 'Bachelor in Business and Economics (BBE)' for WU Vienna, 'Master of Computer Science' for TU Munich, 'Bachelor of Science in Business Administration' for University of Amsterdam). Use the EXACT program name as it appears on the university website, including abbreviations like BBE, BSc, MSc, etc.",
      "field": "Field of study",
      "university": "Real university name",
      "country": "Country name",
      "language": "English" or "Local",
      "category": "Realistic" or "Reach",
      "reason": "Why this program matches the profile",
      "websiteUrl": "REAL official university/program website URL (must be actual working URL, e.g., https://www.university.edu/program)",
      "contactEmail": "REAL admissions office email from university website (e.g., admissions@univie.ac.at, studien@uni-heidelberg.de)",
      "contactPhone": "REAL admissions office phone from university website with country code (e.g., +43 1 4277-0, +49 6221 54-0)",
      "applicationStartDate": "REAL application opening date for 2025-2026 (e.g., 'October 1, 2025', 'November 15, 2025')",
      "applicationDeadline": "REAL application deadline for 2025-2026 (e.g., 'January 15, 2026', 'March 1, 2026')",
      "semesterStartDate": "REAL semester start date (e.g., 'September 2026', 'October 2026')",
      "tuitionFee": "REAL tuition fee from university website (e.g., '€726.72 per semester', 'Free for EU students, €1,500 for non-EU', '€0')",
      "admissionStatus": "Can apply now" or "Need improvement" or "Eligible now",
      "requiredImprovements": "What needs to be improved to apply (e.g., 'Improve IELTS score from 6.5 to 7.0')",
      "description": "Real 2-3 sentence description of the program and university based on official information",
      "programStructure": "Detailed structure of the program including: core courses, elective courses, modules, specialization tracks, thesis requirements, internship opportunities, etc. (e.g., 'Core courses: Microeconomics, Macroeconomics, Statistics, Econometrics. Electives: International Trade, Development Economics. Thesis required in final semester. Optional internship.')"
    }
  ],
}

CRITICAL REQUIREMENTS:
- Use ONLY REAL universities and programs that exist in the specified countries
- Use ONLY REAL program names as they appear on university websites (e.g., "Bachelor in Business and Economics (BBE)" for WU Vienna, NOT "Bachelor of Business Administration")
- Use ONLY REAL website URLs that actually exist (verify before including)
- Use ONLY REAL contact emails and phone numbers from official university websites
- Use ONLY REAL application deadlines for 2025-2026 academic year
- Use ONLY REAL tuition fees from official sources
- Return 8-12 specific programs
- For "admissionStatus": use "Can apply now" if current grades/exam scores meet requirements, "Eligible now" if already qualified, "Need improvement" if scores/grades need to be better
- "requiredImprovements" should be specific and actionable (only if status is "Need improvement")
- Match programs to fields: ${input.programs.join(", ")}
- Programs must be from: ${input.countries.join(", ")}
- Respect language preference: ${input.programLanguage}
- DO NOT make up or invent information - use only real, verifiable data
- NEVER return "Not specified" or empty strings - ALWAYS provide real data
       - If you cannot find exact data, use realistic data based on typical university information for that country
       - For "programStructure": Include actual course names, modules, and structure from the university's official program page. Be specific about core courses, electives, thesis requirements, internships, etc.

EXAMPLES OF REAL PROGRAM NAMES:
- Austria: "Bachelor in Business and Economics (BBE)" at WU Vienna, "Bachelor of Business Administration" at University of Vienna
- Germany: "Master of Science in Computer Science" at TU Munich, "Bachelor of Science in Business Administration" at University of Heidelberg
- Netherlands: "Bachelor of Science in Business Administration" at University of Amsterdam, "Master of Science in Computer Science" at TU Delft
- UK: "BA in Economics" at Oxford, "MSc in Computer Science" at Cambridge

EXAMPLE: For "Vienna University of Economics and Business" in Austria:
- name: "Bachelor in Business and Economics (BBE)" (REAL program name with abbreviation)
- websiteUrl: "https://www.wu.ac.at/en/"
- contactEmail: "admissions@wu.ac.at"
- contactPhone: "+43 1 31336-0"
- applicationStartDate: "February 1, 2026"
- applicationDeadline: "May 15, 2026"
- tuitionFee: "€726.72 per semester"
- semesterStartDate: "October 2026"

Return ONLY valid JSON, no markdown, no emojis, no additional text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful admissions advisor. Always return valid JSON only, no markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON response
    const parsed = JSON.parse(content) as AIResponse;

    // Validate structure
    if (!parsed.programs) {
      throw new Error("Invalid response structure");
    }

    // Enrich programs with real university data from knowledge base
    // This MUST happen after parsing to fill in missing data
    parsed.programs = await Promise.all(parsed.programs.map(async (program) => {
      // Apply enrichment from knowledge base - this will add real data
      const enriched = enrichProgramWithUniversityData(program);
      
      // Always search for university image using SerpAPI to ensure we have the best image
      try {
        console.log(`[Image Search] Starting search for ${enriched.university} in ${enriched.country}`);
        const imageUrl = await searchUniversityImage(enriched.university, enriched.country);
        if (imageUrl) {
          enriched.imageUrl = imageUrl;
          console.log(`[Image Search] ✅ Successfully found and saved image for ${enriched.university}: ${imageUrl}`);
        } else {
          console.warn(`[Image Search] ⚠️ No image found for ${enriched.university} in ${enriched.country}`);
        }
      } catch (error: any) {
        console.error(`[Image Search] ❌ Failed to search image for ${enriched.university}:`, error?.message || error);
        // Continue without image if search fails
      }
      
      // Log final program data to verify imageUrl is present
      if (enriched.imageUrl) {
        console.log(`[Image Search] ✅ Final program data for ${enriched.university} includes imageUrl: ${enriched.imageUrl}`);
      } else {
        console.warn(`[Image Search] ⚠️ Final program data for ${enriched.university} has NO imageUrl`);
      }
      
      // Return enriched program with all fields
      return enriched;
    }));

    return parsed;
  } catch (error: any) {
    console.error("OpenAI error:", error);
    
    // Provide more specific error messages
    if (error?.status === 401 || error?.response?.status === 401 || error?.message?.includes("401")) {
      throw new Error("Invalid OpenAI API key. Please check your .env.local file and restart the server.");
    }
    if (error?.status === 429 || error?.message?.includes("rate limit")) {
      throw new Error("OpenAI API rate limit exceeded. Please try again later.");
    }
    if (error?.message?.includes("API key") || error?.message?.includes("authentication")) {
      throw new Error("OpenAI API key authentication failed. Please verify your API key in .env.local and restart the server.");
    }
    if (error?.message) {
      throw new Error(`Failed to generate admission plan: ${error.message}`);
    }
    
    throw new Error("Failed to generate admission plan. Please try again.");
  }
}

export async function generateProgramPlan(program: Program, userInput: UserInput): Promise<AdmissionPlan> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
    throw new Error("OpenAI API key is not configured");
  }

  // Search for real-time admission requirements FIRST (grades, exams, video essays, CV, etc.)
  let requirementsData = "";
  try {
    const requirementsSearch = await searchAdmissionRequirements(program.university, program.name, program.country);
    
    if (requirementsSearch.length > 0) {
      requirementsData = `\n\nREAL-TIME ADMISSION REQUIREMENTS SEARCH RESULTS:\n${formatSearchResultsForPrompt(requirementsSearch)}\n\nUSE THIS REAL-TIME DATA to extract EXACT requirements for this program:\n- GPA/Grade requirements\n- Language exam requirements (IELTS, TOEFL, etc.) with minimum scores\n- Entrance exams (GRE, GMAT, SAT, etc.)\n- Video essay requirements\n- CV/Resume requirements\n- Portfolio requirements\n- Recommendation letters\n- Other document requirements\n\nPRIORITIZE this real-time data over general knowledge.`;
    }
  } catch (error) {
    console.warn("Requirements search failed:", error);
  }

  // Search for other real-time data (deadlines, structure, etc.)
  let realTimeProgramData = "";
  try {
    const admissionSearch = await searchUniversityAdmissionInfo(program.university, program.name, program.country);
    const structureSearch = await searchProgramStructure(program.university, program.name);
    
    if (admissionSearch.length > 0 || structureSearch.length > 0) {
      const allResults = [...admissionSearch, ...structureSearch];
      realTimeProgramData = `\n\nREAL-TIME PROGRAM DATA:\n${formatSearchResultsForPrompt(allResults)}\n\nUSE THIS REAL-TIME DATA for accurate deadlines and program structure.`;
    }
  } catch (error) {
    console.warn("Web search failed for program plan:", error);
  }

  const prompt = `You are an admissions advisor. Generate a detailed, personalized admission plan for a specific program using REAL information from the internet.

Program Details:
- Program: ${program.name}
- University: ${program.university}
- Country: ${program.country}
- Website: ${program.websiteUrl || "Not specified"}
- Contact Email: ${program.contactEmail || "Not specified"}
- Contact Phone: ${program.contactPhone || "Not specified"}
- Application Start: ${program.applicationStartDate || "Not specified"}
- Application Deadline: ${program.applicationDeadline || "Not specified"}
- Semester Start: ${program.semesterStartDate || "Not specified"}
- Tuition Fee: ${program.tuitionFee || "Not specified"}

User Profile:
- Admission type: ${userInput.admissionType}
- Grades: ${userInput.grades}
- Language exam: ${userInput.languageExam}${userInput.examScore ? ` (Score: ${userInput.examScore})` : ""}
- Budget: ${userInput.budget}
- Admission Status: ${program.admissionStatus}
       ${program.requiredImprovements ? `- Required Improvements: ${program.requiredImprovements}` : ""}
${requirementsData}
${realTimeProgramData}

IMPORTANT: Use REAL information from the internet about this specific university and program.${requirementsData ? " The ADMISSION REQUIREMENTS search results above contain real-time data - use them as the PRIMARY SOURCE for requirements section." : ""} Search for actual requirements, deadlines, and procedures.${realTimeProgramData ? " The search results above contain real-time data - use them as the primary source." : ""}

Create a detailed step-by-step admission plan with SPECIFIC dates, costs, and actions based on REAL university requirements:

Return JSON:
{
  "requirements": {
    "languageExams": ["Specific language exam requirements with minimum scores (e.g., 'IELTS: 7.0 minimum', 'TOEFL: 100 minimum')"],
    "gpaRequirements": "GPA or grade requirements (e.g., 'Minimum 3.0 GPA or equivalent', 'A-levels: AAB')",
    "entranceExams": ["Any entrance exams required (e.g., 'GRE: required with minimum 160 verbal', 'GMAT: minimum 600')"],
    "videoEssay": true or false,
    "portfolio": true or false,
    "recommendationLetters": number of recommendation letters required,
    "otherRequirements": ["Any other specific requirements (e.g., 'Motivation letter required', 'CV/Resume required', 'Interview may be required')"]
  },
  "Now – 3 months": ["Specific action with exact dates from program", "Another action with dates"],
  "3–6 months": ["Action items with specific dates", "More steps with deadlines"],
  "Before deadlines": ["Final steps with exact deadlines from program", "Submission checklist with dates"]
}

CRITICAL REQUIREMENTS:
- FIRST SECTION: "requirements" - List ALL specific admission requirements for this university and program:
  * Language exam requirements (IELTS, TOEFL, etc.) with minimum scores based on real university standards
  * GPA/grade requirements specific to this university (e.g., minimum GPA, A-levels, etc.)
  * Entrance exams required (GRE, GMAT, SAT, subject-specific tests, etc.)
  * Video essay/video interview requirements (if applicable)
  * Portfolio requirements (if applicable)
  * Number of recommendation letters needed
  * Other specific requirements (motivation letters, CV, interviews, etc.)
- Use the EXACT dates from the program (applicationStartDate: ${program.applicationStartDate}, applicationDeadline: ${program.applicationDeadline}, semesterStartDate: ${program.semesterStartDate})
- Include the EXACT tuition fee: ${program.tuitionFee} and payment deadlines
- Reference the REAL contact information: email ${program.contactEmail}, phone ${program.contactPhone}
- Include the REAL website URL: ${program.websiteUrl} for reference
- Be specific about documents needed and when (based on real requirements for ${program.university} in ${program.country})
- If admissionStatus is "Need improvement", include specific steps to improve with target scores/grades
- Make actions actionable and time-specific with real dates
- Research actual admission requirements for ${program.university} ${program.name} program - each university has DIFFERENT requirements

Return ONLY valid JSON, no markdown, no emojis.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful admissions advisor. Always return valid JSON only, no markdown formatting." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No response from OpenAI");

    const parsed = JSON.parse(content) as AdmissionPlan;
    
    // Validate required structure
    if (!parsed["Now – 3 months"] || !parsed["3–6 months"] || !parsed["Before deadlines"]) {
      throw new Error("Invalid plan structure");
    }

    // Ensure requirements section exists (optional but recommended)
    if (!parsed.requirements) {
      parsed.requirements = {
        languageExams: [],
        gpaRequirements: undefined,
        entranceExams: [],
        videoEssay: false,
        portfolio: false,
        recommendationLetters: 0,
        otherRequirements: [],
      };
    }

    return parsed;
  } catch (error: any) {
    console.error("Program plan generation error:", error);
    throw new Error("Failed to generate program plan. Please try again.");
  }
}

export interface HousingOption {
  name: string;
  address: string;
  cost: string;
  availability: string;
  contact: string;
  facilities: string[];
  roomTypes: string[];
  imageUrl?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  websiteUrl?: string;
  description?: string;
}

export async function generateHousingOptions(
  university: string,
  city: string,
  country: string
): Promise<HousingOption[]> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
    throw new Error("OpenAI API key is not configured");
  }

  // Search for real-time housing data using SerpAPI
  let searchResults: SearchResult[] = [];
  let realTimeData = "";
  try {
    searchResults = await searchStudentHousing(university, city, country);
    
    if (searchResults.length > 0) {
      realTimeData = `\n\nREAL-TIME HOUSING SEARCH RESULTS FROM INTERNET:\n${formatSearchResultsForPrompt(searchResults)}\n\nUSE THIS REAL-TIME DATA to extract EXACT information about student housing options.`;
    }
  } catch (error) {
    console.warn("Housing search failed:", error);
    realTimeData = "\n\nNote: Real-time web search is not available.";
  }

  const prompt = `You are a student housing advisor. Extract structured information about student housing options from search results.

University: ${university}
City: ${city}
Country: ${country}
${realTimeData}

Based on the search results above, extract information about student housing/dormitories and return structured JSON:

Return JSON object:
{
  "housingOptions": [
    {
      "name": "Name of the housing facility (e.g., 'Student Residence Vienna', 'ÖJAB Housing', 'WU Dormitory')",
      "address": "Full street address if available, or city/area (e.g., 'Vienna, Austria' or 'Währinger Straße 1, 1090 Vienna')",
      "cost": "Monthly cost with currency (e.g., '€300-600/month', '€450 per month', 'From €350/month')",
      "availability": "Availability status (e.g., 'Usually available', 'Limited availability', 'Competitive', 'Apply early')",
      "contact": "Contact email or phone if found in search results, or 'Contact via website'",
      "facilities": ["Array of facilities like: wifi, kitchen, laundry, gym, common room, study room, parking, etc."],
      "roomTypes": ["Array of room types like: single room, double room, shared room, apartment, studio, etc."],
      "difficulty": "Easy" or "Medium" or "Hard" based on availability (Easy = usually available, Medium = limited, Hard = competitive/difficult to get),
      "websiteUrl": "Official website URL if found in search results",
      "description": "Brief 1-2 sentence description of the housing option"
    }
  ]
}

CRITICAL REQUIREMENTS:
- Extract ONLY real information from the search results
- Use actual names of housing facilities found in the results
- Extract real costs, addresses, and contact information from the search results
- If information is not in search results, you can use general knowledge but mark clearly
- Return 3-8 housing options
- For "difficulty": 
  * "Easy" = usually available, many spots, easy to get
  * "Medium" = limited availability, some competition
  * "Hard" = competitive, difficult to get, very limited spots
- Extract facilities and room types from search results descriptions
- Use ONLY real website URLs if found in search results
- NEVER return "Not specified" - use reasonable defaults based on typical student housing

Return ONLY valid JSON, no markdown, no emojis, no additional text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful student housing advisor. Always return valid JSON only, no markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(content) as { housingOptions: HousingOption[] };
    
    if (!parsed.housingOptions || !Array.isArray(parsed.housingOptions)) {
      throw new Error("Invalid response structure");
    }

    // Search for images for each housing option
    const optionsWithImages = await Promise.all(
      parsed.housingOptions.map(async (option) => {
        try {
          const imageUrl = await searchHousingImage(option.name, city, country);
          if (imageUrl) {
            option.imageUrl = imageUrl;
          }
        } catch (error) {
          console.warn(`Failed to search image for ${option.name}:`, error);
        }
        return option;
      })
    );

    return optionsWithImages;
  } catch (error: any) {
    console.error("OpenAI housing options error:", error);
    if (error?.message) {
      throw new Error(error.message);
    }
    throw new Error("Failed to generate housing options. Please try again.");
  }
}

export interface CountryInfo {
  name: string;
  overview: string;
  advantages: string[];
  benefitsForStudents: string[];
  challenges: string[];
  nuances: string[];
  costOfLiving: {
    accommodation: string;
    food: string;
    transport: string;
    utilities: string;
    entertainment: string;
    healthInsurance: string;
    totalMonthly: string;
    detailedBreakdown?: string;
  };
}

export async function generateCountryInfo(country: string): Promise<CountryInfo> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
    throw new Error("OpenAI API key is not configured");
  }

  // Search for real-time country information using SerpAPI
  let costOfLivingData = "";
  let advantagesData = "";
  try {
    const [costResults, advantagesResults] = await Promise.all([
      searchCountryInfo(country),
      searchCountryAdvantages(country)
    ]);
    
    if (costResults.length > 0) {
      costOfLivingData = `\n\nREAL-TIME COST OF LIVING DATA:\n${formatSearchResultsForPrompt(costResults)}\n\nUSE THIS REAL-TIME DATA to extract EXACT costs and expenses.`;
    }
    
    if (advantagesResults.length > 0) {
      advantagesData = `\n\nREAL-TIME COUNTRY ADVANTAGES/CHALLENGES DATA:\n${formatSearchResultsForPrompt(advantagesResults)}\n\nUSE THIS REAL-TIME DATA to extract information about pros, cons, benefits, and challenges.`;
    }
  } catch (error) {
    console.warn("Country info search failed:", error);
  }

  const prompt = `You are a study abroad advisor. Provide comprehensive information about studying in ${country} for international students.

${costOfLivingData}
${advantagesData}

Based on the search results above, provide detailed information about ${country}:

Return JSON object:
{
  "name": "${country}",
  "overview": "2-3 sentence overview of the country as a study destination",
  "advantages": ["Array of 5-7 main advantages of studying in this country (e.g., 'High-quality education system', 'Affordable tuition fees', 'Rich cultural heritage')"],
  "benefitsForStudents": ["Array of 5-7 specific benefits for international students (e.g., 'Many programs in English', 'Work permit during studies', 'Post-study work opportunities')"],
  "challenges": ["Array of 3-5 main challenges (e.g., 'Language barrier for non-English speakers', 'Cold climate', 'High living costs in major cities')"],
  "nuances": ["Array of 3-5 important nuances or things to know (e.g., 'Student visa required', 'Health insurance mandatory', 'Public transport is excellent')"],
  "costOfLiving": {
    "accommodation": "Detailed accommodation cost (e.g., '€300-800/month for student dorms, €500-1200/month for private apartments')",
    "food": "Food expenses (e.g., '€200-400/month for groceries and eating out')",
    "transport": "Transportation costs (e.g., '€50-100/month for public transport student pass')",
    "utilities": "Utilities if not included (e.g., '€50-150/month for electricity, heating, internet')",
    "entertainment": "Entertainment and leisure (e.g., '€100-200/month for movies, events, social activities')",
    "healthInsurance": "Health insurance cost (e.g., '€50-100/month for mandatory student insurance')",
    "totalMonthly": "Total monthly estimate (e.g., '€750-1850/month')",
    "detailedBreakdown": "Detailed breakdown paragraph with specific examples and ranges"
  }
}

CRITICAL REQUIREMENTS:
- Extract REAL cost information from search results - use actual numbers from the search results
- If search results contain specific costs, use those EXACT numbers
- Provide comprehensive advantages and benefits based on real information about the country
- Mention REAL challenges that international students face
- Include important nuances like visa requirements, language requirements, cultural aspects
- For costOfLiving: Extract detailed, realistic costs from search results
- For detailedBreakdown: Provide a paragraph with specific examples (e.g., "Student dormitory in Vienna costs €350-550/month, while private room in shared apartment costs €500-800/month...")
- Use ONLY real information from search results when available
- Return realistic and helpful information for prospective students

Return ONLY valid JSON, no markdown, no emojis, no additional text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful study abroad advisor. Always return valid JSON only, no markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(content) as CountryInfo;
    
    if (!parsed.name || !parsed.overview) {
      throw new Error("Invalid response structure");
    }

    return parsed;
  } catch (error: any) {
    console.error("OpenAI country info error:", error);
    if (error?.message) {
      throw new Error(error.message);
    }
    throw new Error("Failed to generate country information. Please try again.");
  }
}

export interface DocumentGuide {
  documentType: string;
  country: string;
  overview: string;
  requirements: string[];
  documentsNeeded: string[];
  applicationSteps: string[];
  processingTime: string;
  costs: string;
  importantNotes: string[];
  officialLinks?: string[];
}

export async function generateDocumentGuide(
  country: string,
  documentType: string
): Promise<DocumentGuide> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured. Please set it in .env.local");
  }

  // Map document type to search-friendly name
  const documentTypeMap: Record<string, string> = {
    visa: "student visa",
    residence_permit: "residence permit",
    bank_account: "student bank account",
    health_insurance: "student health insurance",
    registration: "student registration residence registration"
  };

  const searchQuery = documentTypeMap[documentType] || documentType;

  // Search for document requirements using SerpAPI
  let realTimeData = "";
  try {
    const { searchDocumentRequirements, formatSearchResultsForPrompt } = await import("./webSearch");
    const searchResults = await searchDocumentRequirements(country, searchQuery);
    realTimeData = formatSearchResultsForPrompt(searchResults);
  } catch (error: any) {
    console.warn("SerpAPI document search not available:", error.message);
    realTimeData = "\n\nNote: Real-time web search is not available.";
  }

  const prompt = `You are a documentation advisor for international students. Provide comprehensive, detailed information about obtaining ${searchQuery} in ${country} for international students.

${realTimeData}

Based on the search results above, provide detailed step-by-step information about obtaining ${searchQuery} in ${country}:

Return JSON object:
{
  "documentType": "${searchQuery}",
  "country": "${country}",
  "overview": "2-3 sentence overview explaining what this document is and why it's needed for students",
  "requirements": ["Array of 5-8 eligibility requirements (e.g., 'Must be enrolled in a recognized educational institution', 'Valid passport required', 'Proof of financial means', etc.)"],
  "documentsNeeded": ["Array of 8-12 specific documents required for application (e.g., 'Valid passport with at least 6 months validity', 'Letter of admission from university', 'Proof of health insurance', 'Proof of financial resources (€10,000+ in bank account)', 'Passport-sized photos', 'Completed application form', etc.)"],
  "applicationSteps": ["Array of 8-15 detailed step-by-step procedures in chronological order (e.g., 'Step 1: Gather all required documents (passport, admission letter, bank statements)', 'Step 2: Fill out the official application form from [authority website]', 'Step 3: Schedule an appointment at the embassy/consulate using their online system', 'Step 4: Attend the appointment and submit all documents in person', 'Step 5: Pay the application fee (€XX) at the embassy', 'Step 6: Wait for processing (typically X-X weeks)', 'Step 7: Collect your document from the embassy or receive it by mail', etc.)"],
  "processingTime": "Detailed processing time information (e.g., '4-8 weeks from application submission', 'Express processing available for additional fee (2-3 weeks)')",
  "costs": "Detailed cost breakdown (e.g., 'Application fee: €75, Express processing: €150 additional, Biometric data collection: €25, Total: €75-250 depending on processing speed')",
  "importantNotes": ["Array of 5-10 critical notes, warnings, tips, and important information (e.g., 'Apply at least 3 months before your program starts', 'All documents must be translated into [language] and certified', 'You must apply from your home country, not after arrival', 'Keep copies of all submitted documents', 'Processing times may be longer during peak season (August-September)', 'Some embassies require in-person interviews', etc.)"],
  "officialLinks": ["Array of official website URLs if found in search results (e.g., 'https://www.embassy-website.com/student-visa', 'https://immigration-authority.gov/student-permits')"]
}

CRITICAL REQUIREMENTS:
- Extract ONLY real information from search results
- Provide detailed, step-by-step procedures - students should be able to follow these steps exactly
- Include specific costs, processing times, and requirements based on search results
- If search results contain official links, include them
- Mention specific authorities, embassies, or offices where applications are processed
- Include practical tips and common mistakes to avoid
- Provide REAL document requirements based on search results
- Include information about when to apply (timeline relative to program start date)
- Mention any specific requirements for students from different countries if relevant
- NEVER return "Not specified" - use general knowledge if search results don't have specific info, but mark it clearly
- Make the steps actionable and chronological - students should know exactly what to do in order

Return ONLY valid JSON, no markdown, no emojis, no additional text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON response
    const cleaned = content.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");
    const parsed = JSON.parse(cleaned);

    return parsed;
  } catch (error: any) {
    console.error("OpenAI document guide error:", error);
    if (error?.message) {
      throw new Error(error.message);
    }
    throw new Error("Failed to generate document guide. Please try again.");
  }
}
