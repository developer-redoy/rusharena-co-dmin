import { Suspense } from "react";
import MatchDetailsContent from "./MatchDetailsContent";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-5">Loading...</div>}>
      <MatchDetailsContent />
    </Suspense>
  );
}
