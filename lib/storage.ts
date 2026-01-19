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
    console.warn("getDatabase: DATABASE_URL not found, using fallback storage");
    return null;
  }
  try {
    console.log("getDatabase: Creating Neon database connection");
    return neon(databaseUrl);
  } catch (error: any) {
    console.error("getDatabase: Error creating database connection:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
    });
    return null;
  }
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
  console.log(`saveSubmission: Saving submission with ID: ${submission.id}`);
  const sql = getDatabase();
  
  // Use Neon Postgres if available
  if (sql) {
    console.log("saveSubmission: Using Neon Postgres database");
    try {
      await ensureTable();
      console.log(`saveSubmission: Table ensured, inserting submission ID: ${submission.id}`);
      await sql`
        INSERT INTO submissions (id, email, input, response, created_at)
        VALUES (${submission.id}, ${submission.email}, ${JSON.stringify(submission.input)}::jsonb, ${JSON.stringify(submission.response)}::jsonb, ${submission.createdAt}::timestamp)
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          input = EXCLUDED.input,
          response = EXCLUDED.response
      `;
      console.log(`saveSubmission: Successfully saved submission ID: ${submission.id} to database`);
      return;
    } catch (error: any) {
      console.error("saveSubmission: Error saving to database:", error);
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
        submissionId: submission.id,
      });
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
  console.log(`getSubmissionById: Looking for submission with ID: ${id}`);
  const sql = getDatabase();
  
  // Use Neon Postgres if available
  if (sql) {
    console.log("getSubmissionById: Using Neon Postgres database");
    try {
      await ensureTable();
      console.log(`getSubmissionById: Table ensured, querying for ID: ${id}`);
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
      
      console.log(`getSubmissionById: Query returned ${rows.length} row(s)`);
      
      if (rows.length === 0) {
        console.log(`getSubmissionById: No submission found in database for ID: ${id}`);
        // Fall back to in-memory or file system
        if (IS_SERVERLESS) {
          console.log("getSubmissionById: Checking in-memory storage");
          const submission = inMemoryStorage.find((s) => s.id === id);
          if (submission) {
            console.log("getSubmissionById: Found in in-memory storage");
            return submission;
          }
        }
        // Try file system
        try {
          console.log("getSubmissionById: Checking file system");
          const submissions = await getSubmissions();
          const found = submissions.find((s) => s.id === id);
          if (found) {
            console.log("getSubmissionById: Found in file system");
            return found;
          }
        } catch (fsError) {
          console.error("getSubmissionById: File system error:", fsError);
        }
        return null;
      }
      
      const row = rows[0] as any;
      console.log(`getSubmissionById: Successfully retrieved submission for ID: ${id}`);
      return {
        id: row.id,
        email: row.email,
        input: row.input,
        response: row.response,
        createdAt: row.created_at,
      };
    } catch (error: any) {
      console.error("getSubmissionById: Error reading from database:", error);
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
      });
      // Fall back to in-memory or file system
      if (IS_SERVERLESS) {
        console.log("getSubmissionById: Falling back to in-memory storage");
        const submission = inMemoryStorage.find((s) => s.id === id);
        if (submission) {
          console.log("getSubmissionById: Found in in-memory storage (fallback)");
          return submission;
        }
      }
      // Try file system
      try {
        console.log("getSubmissionById: Falling back to file system");
        const submissions = await getSubmissions();
        const found = submissions.find((s) => s.id === id);
        if (found) {
          console.log("getSubmissionById: Found in file system (fallback)");
          return found;
        }
      } catch (fsError) {
        console.error("getSubmissionById: File system fallback error:", fsError);
      }
      return null;
    }
  }
  
  console.log("getSubmissionById: Database not available, using fallback methods");
  // Fallback to other methods
  try {
    const submissions = await getSubmissions();
    const found = submissions.find((s) => s.id === id);
    if (found) {
      console.log("getSubmissionById: Found in fallback storage");
      return found;
    }
    console.log(`getSubmissionById: Not found in fallback storage for ID: ${id}`);
    return null;
  } catch (error) {
    console.error("Error in getSubmissionById fallback:", error);
    return null;
  }
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
