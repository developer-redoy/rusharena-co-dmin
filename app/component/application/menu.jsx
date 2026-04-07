"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import { Preferences } from "@capacitor/preferences";
import { showToast } from "./tostify";

import { Edit } from "lucide-react";

// ✅ Menu Data
// const menuData = [
// {    label: "Edit Photos", link: clowdinaryLink, icon: ImageIcon, confirm: true,  },
// ];

export default function FullScreenMobileMenu() {
  const router = useRouter();

  const [accessType, setAccessType] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const { value } = await Preferences.get({ key: "access_type" });

        if (!value) {
          showToast("error", "Please login to continue!");
          return;
        }
        setAccessType("/matches?type=" + value);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    }

    loadUser();
  }, []);

  const menuData = [{ label: "Manage Matches", link: accessType, icon: Edit }];

  // ✅ Menu click handler
  const handleMenuClick = useCallback(
    (item) => {
      if (item.confirm) {
        setPendingLink(item.link);
        setModalOpen(true);
      } else {
        router.push(item.link);
      }
    },
    [router],
  );

  return (
    <div className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-y-auto my-4 ">
      <nav className="space-y-3 m-4">
        {menuData.map((item, idx) =>
          item.subMenu ? (
            <Accordion key={idx} type="single" collapsible>
              <AccordionItem value={item.label}>
                <AccordionTrigger className="flex items-center justify-between w-full px-4 py-3 text-base font-medium bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                  <div className="flex items-center gap-3">
                    {item.icon && <item.icon className="w-5 h-5" />}
                    <span>{item.label}</span>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pl-10 space-y-2 pt-2">
                  {item.subMenu.map((sub, sidx) => (
                    <Link
                      key={sidx}
                      href={sub.link}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
                    >
                      {sub.icon && <sub.icon className="w-4 h-4" />}
                      <span>{sub.label}</span>
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <button
              key={idx}
              onClick={() => handleMenuClick(item)}
              className="w-full flex items-center gap-3 px-4 py-3 text-base font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition text-left"
            >
              {item.icon && <item.icon className="w-5 h-5" />}
              <span>{item.label}</span>
            </button>
          ),
        )}
      </nav>
    </div>
  );
}
