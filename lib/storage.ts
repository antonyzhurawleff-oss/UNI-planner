import { Submission, AdmissionPlan } from "@/app/types";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json");

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read all submissions
export function getSubmissions(): Submission[] {
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
  ensureDataDir();
  const submissions = getSubmissions();
  const index = submissions.findIndex((s) => s.id === submissionId);
  if (index !== -1) {
    submissions[index].response.plan = plan;
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
  }
}
