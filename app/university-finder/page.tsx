import { Suspense } from "react";
import UniversityFinderClient from "./UniversityFinderClient";

export default function UniversityFinderPage() {
  return (
    <Suspense fallback={<div />}>
      <UniversityFinderClient />
    </Suspense>
  );
}
