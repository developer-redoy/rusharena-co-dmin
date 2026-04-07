"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Preferences } from "@capacitor/preferences";
import ButtonLoading from "../buttonLoading";
import { showToast } from "./tostify";

// ✅ Modal Component
function ConfirmModal({ open, onClose, onConfirm, loading }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl p-6 w-[90%] max-w-md shadow-xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-3">Confirm Logout</h2>
        <p className="text-gray-300 mb-6">Are you sure you want to logout?</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TopMenuBar() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [accessType, setAccessType] = useState(null);

  // ✅ Get access type from Preferences
  useEffect(() => {
    async function fetchAccessType() {
      try {
        const { value } = await Preferences.get({ key: "access_type" });
        setAccessType(value || ""); // fallback
      } catch (error) {
        console.error("Error fetching access type:", error);
      }
    }
    fetchAccessType();
  }, []);

  // ✅ Logout logic
  const handleLogout = async () => {
    setLoading(true);

    try {
      await Preferences.remove({ key: "access_token" });
      await Preferences.remove({ key: "access_type" });

      showToast("success", "Logged out successfully!");
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      showToast("error", "Failed to logout. Try again.");
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  return (
    <div>
      <div className="w-full bg-gray-900 text-gray-200 overflow-y-auto">
        {/* Header */}
        <div className="mb-6 bg-gray-800 p-4 rounded flex justify-between items-center">
          <h1 className="text-2xl font-bold text-yellow-600 underline">
            {accessType} Dashboard
          </h1>

          <ButtonLoading
            className="rounded-full bg-red-600 hover:bg-red-700"
            onclick={() => setModalOpen(true)}
            text="Logout"
            loading={loading}
          />
        </div>

        {/* ✅ Confirm Modal */}
        <ConfirmModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleLogout}
          loading={loading}
        />
      </div>
    </div>
  );
}
