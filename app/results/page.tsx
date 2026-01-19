import { getSubmission } from "../actions";
import { notFound } from "next/navigation";
import ResultsClient from "./ResultsClient";

export const dynamic = "force-dynamic";

interface ResultsPageProps {
  searchParams: { id?: string };
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const id = searchParams.id;

  if (!id) {
    console.error("ResultsPage: No ID provided in searchParams");
    notFound();
  }

  console.log(`ResultsPage: Loading submission with ID: ${id}`);

  try {
    const submission = await getSubmission(id);

    if (!submission) {
      console.error(`ResultsPage: Submission not found for ID: ${id}`);
      notFound();
    }

    console.log(`ResultsPage: Successfully loaded submission for ID: ${id}`);
    return <ResultsClient submission={submission} />;
  } catch (error: any) {
    console.error("ResultsPage: Error loading submission:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      id,
    });
    notFound();
  }
}
