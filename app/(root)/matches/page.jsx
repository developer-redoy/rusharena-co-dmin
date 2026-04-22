"use client";

import PlayMatch from "@/app/component/application/matchesList";
import { add_match } from "@/routes/websiteRoute";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Preferences } from "@capacitor/preferences";
import jwt from "jsonwebtoken";

export default function PlayMatchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [matchType, setMatchType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const validateAccess = async () => {
      try {
        const { value: token } = await Preferences.get({ key: "access_token" });
        const type = searchParams.get("type");

        // ❌ No stored type → redirect
        if (!token || !type) {
          router.replace("/");
          return;
        }

        const decoded = jwt.decode(token);
        const value = decoded.matchType;

        if (!value || !decoded) {
          throw new Error("Invalid Access");
        }

        // ❌ Mismatch → fix URL instead of redirect home
        if (type !== value) {
          router.replace(`/matches?type=${encodeURIComponent(value)}`);
          return;
        }

        if (isMounted) {
          setMatchType(value);
        }
      } catch (error) {
        console.error("Error checking type:", error);
        router.replace("/");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    validateAccess();

    return () => {
      isMounted = false;
    };
  }, [searchParams, router]);

  // ⏳ Prevent UI flicker / invalid render
  if (loading || !matchType) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="w-full flex flex-col bg-black">
        <Link
          href={`${add_match}?type=${matchType}`}
          className="w-full text-center rounded-xl py-3 my-2 mx-auto text-xl text-white bg-[#5c5ca9]"
        >
          + Create New Match
        </Link>
      </div>

      <PlayMatch type={matchType} />
    </>
  );
}
