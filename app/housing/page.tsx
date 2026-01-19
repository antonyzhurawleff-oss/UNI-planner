import { Suspense } from "react";
import HousingClient from "./HousingClient";

export default function HousingPage() {
  return (
    <Suspense fallback={<div />}>
      <HousingClient />
    </Suspense>
  );
}
