"use server";

import { UserInput, AIResponse, Submission, Country, Program, AdmissionPlan } from "./types";
import { generateAdmissionPlan, generateProgramPlan, generateHousingOptions, HousingOption, generateCountryInfo, CountryInfo, generateDocumentGuide, DocumentGuide } from "@/lib/openai";
import { saveSubmission, getSubmissionsByEmail, getSubmissionById, updateSubmissionPlan } from "@/lib/storage";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";

export async function submitForm(formData: FormData) {
  // Extract form data
  const admissionType = formData.get("admissionType") as UserInput["admissionType"];
  const countries = formData.getAll("countries") as Country[];
  const programs = formData.getAll("programs") as UserInput["programs"];
  const programLanguage = formData.get("programLanguage") as UserInput["programLanguage"];
  const grades = formData.get("grades") as string;
  const languageExam = formData.get("languageExam") as UserInput["languageExam"];
  const examScore = formData.get("examScore") as string | null;
  const budget = formData.get("budget") as UserInput["budget"];
  const email = formData.get("email") as string;

  // Validate required fields
  if (!admissionType || !countries.length || !programs.length || !programLanguage || !grades || !languageExam || !budget || !email) {
    return { error: "All required fields must be filled" };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Invalid email address" };
  }

  const input: UserInput = {
    admissionType,
    countries: countries as UserInput["countries"],
    programs: programs as UserInput["programs"],
    programLanguage: programLanguage as UserInput["programLanguage"],
    grades,
    languageExam,
    examScore: examScore || undefined,
    budget,
    email: email.toLowerCase(),
  };

  try {
    // Generate AI response
    const response: AIResponse = await generateAdmissionPlan(input);

    // Save submission
    const submission: Submission = {
      id: randomUUID(),
      email: input.email,
      input,
      response,
      createdAt: new Date().toISOString(),
    };

    saveSubmission(submission);

    // Return submission ID for client-side redirect
    // Using redirect() here doesn't work when called from client handler
    return { success: true, id: submission.id };
  } catch (error: any) {
    // Next.js redirect() throws a special error that should be re-thrown
    // Check if this is a redirect error (digest === 'NEXT_REDIRECT' or message contains 'NEXT_REDIRECT')
    if (error?.digest === 'NEXT_REDIRECT' || error?.message === 'NEXT_REDIRECT' || error?.message?.includes('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors
    }
    
    console.error("Submission error:", error);
    
    // Return more specific error messages
    if (error?.message) {
      // If error message contains specific info, show it
      if (error.message.includes("API key") || error.message.includes("OpenAI")) {
        return { error: error.message };
      }
      return { error: error.message };
    }
    
    return { error: "Failed to process your request. Please try again." };
  }
}

// Helper to get submission by ID (for results page)
export async function getSubmission(id: string): Promise<Submission | null> {
  return getSubmissionById(id);
}

// Helper to get submissions by email (for email-based access)
export async function getSubmissionsForEmail(email: string): Promise<Submission[]> {
  return getSubmissionsByEmail(email);
}

// Generate plan for a specific program
export async function generatePlanForProgram(submissionId: string, programIndex: number): Promise<{ success: boolean; plan?: AdmissionPlan; error?: string }> {
  try {
    const submission = getSubmissionById(submissionId);
    if (!submission) {
      return { success: false, error: "Submission not found" };
    }

    const response = submission.response || {};
    let programs: Program[] = [];
    
    // Handle both old format (universities) and new format (programs)
    if (response.programs && Array.isArray(response.programs)) {
      programs = response.programs;
    } else if (response.universities && Array.isArray(response.universities)) {
      // Convert old format to new format for backward compatibility
      programs = response.universities.map((uni: any) => ({
        name: uni.name || "Program",
        field: uni.field || "",
        university: uni.name || "",
        country: uni.country || "",
        language: "English" as const,
        category: uni.category || "Realistic" as const,
        reason: uni.reason || "",
        admissionStatus: uni.admissionStatus,
        requiredImprovements: uni.requiredImprovements,
        websiteUrl: uni.websiteUrl,
        contactEmail: uni.contactEmail,
        contactPhone: uni.contactPhone,
        applicationStartDate: uni.applicationStartDate,
        applicationDeadline: uni.applicationDeadline,
        semesterStartDate: uni.semesterStartDate,
        tuitionFee: uni.tuitionFee,
        description: uni.description,
      }));
    }

    if (!programs || programs.length === 0) {
      return { success: false, error: "Programs not found in submission" };
    }

    const program = programs[programIndex];
    if (!program) {
      return { success: false, error: "Program not found" };
    }

    const plan = await generateProgramPlan(program, submission.input);
    
    // Update submission with plan
    updateSubmissionPlan(submissionId, plan);

    return { success: true, plan };
  } catch (error: any) {
    console.error("Error generating program plan:", error);
    return { success: false, error: error.message || "Failed to generate plan" };
  }
}

// Generate housing options for a university
export async function getHousingOptions(
  university: string,
  city: string,
  country: string
): Promise<{ success: boolean; options?: HousingOption[]; error?: string }> {
  try {
    const options = await generateHousingOptions(university, city, country);
    return { success: true, options };
  } catch (error: any) {
    console.error("Housing options generation error:", error);
    return { success: false, error: error.message || "Failed to generate housing options" };
  }
}

// Get comprehensive country information
export async function getCountryInfo(
  country: string
): Promise<{ success: boolean; info?: CountryInfo; error?: string }> {
  try {
    const info = await generateCountryInfo(country);
    return { success: true, info };
  } catch (error: any) {
    console.error("Country info generation error:", error);
    return { success: false, error: error.message || "Failed to generate country information" };
  }
}

// Get detailed document guide
export async function getDocumentGuide(
  country: string,
  documentType: string
): Promise<{ success: boolean; guide?: DocumentGuide; error?: string }> {
  try {
    const guide = await generateDocumentGuide(country, documentType);
    return { success: true, guide };
  } catch (error: any) {
    console.error("Document guide generation error:", error);
    return { success: false, error: error.message || "Failed to generate document guide" };
  }
}
