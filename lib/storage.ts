import { Submission, AdmissionPlan } from "@/app/types";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json");

// Check if we're in a serverless environment (Vercel, etc.)
const IS_SERVERLESS = process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

// In-memory storage for serverless environments
let inMemoryStorage: Submission[] = [];

// Ensure data directory exists (only in non-serverless environments)
function ensureDataDir() {
  if (IS_SERVERLESS) {
    return; // Skip file system operations in serverless
  }
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read all submissions
export function getSubmissions(): Submission[] {
  if (IS_SERVERLESS) {
    return inMemoryStorage;
  }
  
  ensureDataDir();
  if (!fs.existsSync(SUBMISSIONS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(SUBMISSIONS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Save a submission
export function saveSubmission(submission: Submission): void {
  if (IS_SERVERLESS) {
    inMemoryStorage.push(submission);
    return;
  }
  
  ensureDataDir();
  const submissions = getSubmissions();
  submissions.push(submission);
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
}

// Get submission by ID
export function getSubmissionById(id: string): Submission | null {
  const submissions = getSubmissions();
  return submissions.find((s) => s.id === id) || null;
}

// Get submissions by email
export function getSubmissionsByEmail(email: string): Submission[] {
  const submissions = getSubmissions();
  return submissions.filter((s) => s.email.toLowerCase() === email.toLowerCase());
}

// Update plan for a submission
export function updateSubmissionPlan(submissionId: string, plan: AdmissionPlan): void {
  if (IS_SERVERLESS) {
    const submission = inMemoryStorage.find((s) => s.id === submissionId);
    if (submission) {
      submission.response.plan = plan;
    }
    return;
  }
  
  ensureDataDir();
  const submissions = getSubmissions();
  const index = submissions.findIndex((s) => s.id === submissionId);
  if (index !== -1) {
    submissions[index].response.plan = plan;
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
  }
}
