import { Suspense } from "react";
import PricingPackages from "./components/PricingPackages";

export default function PricingPackagesPage() {
  return (
    <Suspense fallback={null}>
      <PricingPackages />
    </Suspense>
  );
}
