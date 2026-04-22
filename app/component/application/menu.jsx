"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";
import { Preferences } from "@capacitor/preferences";
import { showToast } from "./tostify";
import { Edit } from "lucide-react";

export default function FullScreenMobileMenu() {
  const router = useRouter();
  const [accessType, setAccessType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const { value: token } = await Preferences.get({
          key: "access_token",
        });

        if (!token) {
          showToast("error", "Please login to continue!");
          router.replace("/login");
          return;
        }

        // ✅ decode only (safe for client)
        const decoded = jwt.decode(token);

        if (!decoded?.matchType) {
          throw new Error("Invalid Access");
        }

        setAccessType(`/matches?type=${decoded.matchType}`);
      } catch (error) {
        console.error("Error loading user:", error);
        showToast("error", "Session expired. Please login again!");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);

  const handleMenuClick = useCallback(
    (link) => {
      if (!link) return;
      router.push(link);
    },
    [router],
  );

  if (loading) return null; // or loader

  const menuData = accessType
    ? [{ label: "Manage Matches", link: accessType, icon: Edit }]
    : [];

  return (
    <div className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-y-auto my-4">
      <nav className="space-y-3 m-4">
        {menuData.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleMenuClick(item.link)}
            className="w-full flex items-center gap-3 px-4 py-3 text-base font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition text-left"
          >
            {item.icon && <item.icon className="w-5 h-5" />}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
