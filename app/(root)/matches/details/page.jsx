import { Suspense } from "react";
import MatchDetailsContent from "./MatchDetailsContent";

export const dynamic = "force-dynamic"; // 🔥 IMPORTANT

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MatchDetailsContent />
    </Suspense>
  );
}
