import { getSubmission } from "../actions";
import { notFound } from "next/navigation";
import ResultsClient from "./ResultsClient";

interface ResultsPageProps {
  searchParams: { id?: string };
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const id = searchParams.id;

  if (!id) {
    notFound();
  }

  const submission = await getSubmission(id);

  if (!submission) {
    notFound();
  }

  return <ResultsClient submission={submission} />;
}
