import { Suspense } from "react";
import EssayEditorClient from "./EssayEditorClient";

export default function EssayEditorPage() {
  return (
    <Suspense fallback={<div />}>
      <EssayEditorClient />
    </Suspense>
  );
}
