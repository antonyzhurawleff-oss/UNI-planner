export type AdmissionType = "Bachelor" | "Master";

export type Country = "Germany" | "Netherlands" | "Italy" | "France" | "UK" | "Austria" | "Not sure";

export type LanguageExam = "IELTS" | "TOEFL" | "None";

export type Budget = "Free" | "< 3,000" | "3,000 - 10,000" | "10,000 - 30,000" | "> 30,000";

export type ProgramField = 
  | "Business & Management"
  | "Computer Science & IT"
  | "Engineering"
  | "Medicine & Health"
  | "Law"
  | "Arts & Humanities"
  | "Social Sciences"
  | "Natural Sciences"
  | "Economics"
  | "Psychology"
  | "Architecture"
  | "Not sure";

export type ProgramLanguage = "English" | "Local" | "Either";

export interface UserInput {
  admissionType: AdmissionType;
  countries: Country[];
  programs: ProgramField[];
  programLanguage: ProgramLanguage;
  grades: string;
  languageExam: LanguageExam;
  examScore?: string;
  budget: Budget;
  email: string;
}

export interface Program {
  name: string;
  field: string;
  university: string;
  country: string;
  language: "English" | "Local";
  category: "Realistic" | "Reach";
  reason: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  applicationStartDate?: string;
  applicationDeadline?: string;
  semesterStartDate?: string;
  tuitionFee?: string;
  admissionStatus?: "Can apply now" | "Need improvement" | "Eligible now";
  requiredImprovements?: string;
  imageUrl?: string;
  description?: string;
  programStructure?: string; // Course structure, modules, curriculum
}

export interface University {
  name: string;
  country: string;
  category: "Realistic" | "Reach";
  reason: string;
}

export interface AdmissionPlan {
  requirements?: {
    languageExams?: string[];
    gpaRequirements?: string;
    entranceExams?: string[];
    videoEssay?: boolean;
    portfolio?: boolean;
    recommendationLetters?: number;
    otherRequirements?: string[];
  };
  "Now – 3 months": string[];
  "3–6 months": string[];
  "Before deadlines": string[];
}

export interface AIResponse {
  programs: Program[];
  universities?: University[];
  plan?: AdmissionPlan;
}

export interface Submission {
  id: string;
  email: string;
  input: UserInput;
  response: AIResponse;
  createdAt: string;
}
