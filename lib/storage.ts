import { Submission, AdmissionPlan } from "@/app/types";
import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

const DATA_DIR = path.join(process.cwd(), "data");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json");

// Check if we're in a serverless environment (Vercel, etc.)
const IS_SERVERLESS = process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

// Get Neon database connection
function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return null;
  }
  return neon(databaseUrl);
}

// Initialize database table (run once)
async function ensureTable() {
  const sql = getDatabase();
  if (!sql) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        input JSONB NOT NULL,
        response JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
  } catch (error: any) {
    console.error("Error creating table:", error);
    // Don't throw - allow fallback to in-memory storage
  }
}

// In-memory storage as fallback (only used if database is not available)
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
export async function getSubmissions(): Promise<Submission[]> {
  const sql = getDatabase();
  
  // Use Neon Postgres if available
  if (sql) {
    try {
      await ensureTable();
      const rows = await sql`
        SELECT 
          id,
          email,
          input,
          response,
          created_at::text as created_at
        FROM submissions
        ORDER BY created_at DESC
      `;
      
      return rows.map((row: any) => ({
        id: row.id,
        email: row.email,
        input: row.input,
        response: row.response,
        createdAt: row.created_at,
      }));
    } catch (error: any) {
      console.error("Error reading from database:", error);
      // If database error, fall back to in-memory (for serverless) or file system
      if (IS_SERVERLESS) {
        console.warn("Falling back to in-memory storage due to database error");
        return inMemoryStorage;
      }
      return [];
    }
  }
  
  // Fallback to in-memory for serverless without database
  if (IS_SERVERLESS) {
    return inMemoryStorage;
  }
  
  // Use file system for local development
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
export async function saveSubmission(submission: Submission): Promise<void> {
  const sql = getDatabase();
  
  // Use Neon Postgres if available
  if (sql) {
    try {
      await ensureTable();
      await sql`
        INSERT INTO submissions (id, email, input, response, created_at)
        VALUES (${submission.id}, ${submission.email}, ${JSON.stringify(submission.input)}::jsonb, ${JSON.stringify(submission.response)}::jsonb, ${submission.createdAt}::timestamp)
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          input = EXCLUDED.input,
          response = EXCLUDED.response
      `;
      return;
    } catch (error) {
      console.error("Error saving to database:", error);
      throw error;
    }
  }
  
  // Fallback to in-memory for serverless without database
  if (IS_SERVERLESS) {
    inMemoryStorage.push(submission);
    return;
  }
  
  // Use file system for local development
  ensureDataDir();
  const submissions = await getSubmissions();
  submissions.push(submission);
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
}

// Get submission by ID
export async function getSubmissionById(id: string): Promise<Submission | null> {
  const sql = getDatabase();
  
  // Use Neon Postgres if available
  if (sql) {
    try {
      await ensureTable();
      const rows = await sql`
        SELECT 
          id,
          email,
          input,
          response,
          created_at::text as created_at
        FROM submissions
        WHERE id = ${id}
        LIMIT 1
      `;
      
      if (rows.length === 0) {
        return null;
      }
      
      const row = rows[0] as any;
      return {
        id: row.id,
        email: row.email,
        input: row.input,
        response: row.response,
        createdAt: row.created_at,
      };
    } catch (error) {
      console.error("Error reading from database:", error);
      return null;
    }
  }
  
  // Fallback to other methods
  const submissions = await getSubmissions();
  return submissions.find((s) => s.id === id) || null;
}

// Get submissions by email
export async function getSubmissionsByEmail(email: string): Promise<Submission[]> {
  const sql = getDatabase();
  
  // Use Neon Postgres if available
  if (sql) {
    try {
      await ensureTable();
      const rows = await sql`
        SELECT 
          id,
          email,
          input,
          response,
          created_at::text as created_at
        FROM submissions
        WHERE LOWER(email) = LOWER(${email})
        ORDER BY created_at DESC
      `;
      
      return rows.map((row: any) => ({
        id: row.id,
        email: row.email,
        input: row.input,
        response: row.response,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error("Error reading from database:", error);
      return [];
    }
  }
  
  // Fallback to other methods
  const submissions = await getSubmissions();
  return submissions.filter((s) => s.email.toLowerCase() === email.toLowerCase());
}

// Update plan for a submission
export async function updateSubmissionPlan(submissionId: string, plan: AdmissionPlan): Promise<void> {
  const sql = getDatabase();
  
  // Use Neon Postgres if available
  if (sql) {
    try {
      await ensureTable();
      const submission = await getSubmissionById(submissionId);
      if (submission) {
        const updatedResponse = { ...submission.response, plan };
        await sql`
          UPDATE submissions
          SET response = ${JSON.stringify(updatedResponse)}::jsonb
          WHERE id = ${submissionId}
        `;
      }
      return;
    } catch (error) {
      console.error("Error updating in database:", error);
      throw error;
    }
  }
  
  // Fallback to in-memory for serverless without database
  if (IS_SERVERLESS) {
    const submission = inMemoryStorage.find((s) => s.id === submissionId);
    if (submission) {
      submission.response.plan = plan;
    }
    return;
  }
  
  // Use file system for local development
  ensureDataDir();
  const submissions = await getSubmissions();
  const index = submissions.findIndex((s) => s.id === submissionId);
  if (index !== -1) {
    submissions[index].response.plan = plan;
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
  }
}
