"use client";
import { Suspense } from "react";
import TopMenuBar from "@/app/component/application/menubar";

export default function adminLayout({ children }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="w-full font-sans min-h-screen  flex flex-col items-center gap-16 m-auto">
        <main className="w-full ">
          <TopMenuBar />
          {children}
        </main>
      </div>
    </Suspense>
  );
}
