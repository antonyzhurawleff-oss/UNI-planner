import { Suspense } from "react";
import CountryInfoClient from "./CountryInfoClient";

export default function CountryInfoPage() {
  return (
    <Suspense fallback={<div />}>
      <CountryInfoClient />
    </Suspense>
  );
}
