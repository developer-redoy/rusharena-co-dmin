"use client";
import PlayMatch from "@/app/component/application/matchesList";
import { add_match } from "@/routes/websiteRoute";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Preferences } from "@capacitor/preferences";

export default function PlayMatchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [matchType, setMatchType] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const checkType = async () => {
      try {
        const { value } = await Preferences.get({ key: "access_type" });
        const type = searchParams.get("type");

        // ✅ Handle missing stored value
        if (!value) {
          router.replace("/");
          return;
        }

        // ✅ Redirect if mismatch
        if (type !== value) {
          router.replace("/");
          return;
        }

        // ✅ Safe state update
        if (isMounted) {
          setMatchType(value);
        }
      } catch (error) {
        console.error("Error checking type:", error);
        router.replace("/");
      }
    };

    checkType();

    return () => {
      isMounted = false; // prevent memory leak
    };
  }, [searchParams, router]);

  useEffect(() => {
    const checkaccess = async () => {
      const { value } = await Preferences.get({ key: "access_type" });

      const type = searchParams.get("type");

      if (pathname === "/matches") {
        if (!value) {
          router.replace("/");
          return; // ✅ prevent invalid redirect
        }
        if (type !== value) {
          router.replace(`/matches?type=${encodeURIComponent(value)}`);
          return;
        }
      }
      checkaccess();
    };
  }, []);
  return (
    <>
      <div className="w-full p-0 m-0 flex flex-col bg-black">
        <Link
          href={`${add_match}/?type=${matchType}`}
          className="w-full text-center rounded-xl py-3 my-2 mx-auto text-xl text-white bg-[#5c5ca9]
   
  "
        >
          + Create New Match
        </Link>
      </div>
      <PlayMatch type={matchType} />
    </>
  );
}
