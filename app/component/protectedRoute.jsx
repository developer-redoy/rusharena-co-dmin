"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Preferences } from "@capacitor/preferences";
import axios from "axios";

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        // 🔐 Get JWT token
        const { value: token } = await Preferences.get({
          key: "access_token",
        });

        // ❌ No token → redirect
        if (!token) {
          if (!pathname.startsWith("/login")) {
            router.replace("/login");
          }
          return;
        }

        // ✅ Verify token via backend
        const res = await axios.get("/api/checkAuth", {
          params: { accessToken: token },
        });

        if (!res?.data?.success) {
          throw new Error("Invalid token");
        }

        // ✅ Prevent logged-in users from visiting login
        if (pathname.startsWith("/login")) {
          router.replace("/");
          return;
        }
      } catch (error) {
        console.error("Auth failed:", error);

        // 🔥 Clear token
        await Preferences.remove({ key: "access_token" });

        // 🔁 Redirect to login
        router.replace("/login");
      } finally {
        if (isMounted) setChecking(false);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  // ⏳ Loading screen
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return children;
}
