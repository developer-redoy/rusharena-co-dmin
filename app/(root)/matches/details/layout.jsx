import { Suspense } from "react";

export default function RootLayout({ children }) {
  return <Suspense fallback={<p>Loading matches...</p>}>{children}</Suspense>;
}
