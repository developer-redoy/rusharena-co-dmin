"use client";
import TopMenuBar from "@/app/component/application/menubar";

export default function adminLayout({ children }) {
  return (
    <div className="w-full font-sans min-h-screen  flex flex-col items-center gap-16 m-auto">
      <main className="w-full ">
        <TopMenuBar />
        {children}
      </main>
    </div>
  );
}
