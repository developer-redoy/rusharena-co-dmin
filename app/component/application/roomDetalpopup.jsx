"use client";

import React from "react";
import { showToast } from "./tostify";

// helper function for copy
const copyToClipboard = (text, type) => {
  try {
    navigator.clipboard.writeText(text);
    showToast("success", `${type}: coppid Successfully`);
  } catch (error) {}
};

const RoomPopup = ({ roomId, roomPass, isJoined, onClose }) => {
  const hasRoom = roomId && roomPass;

  return (
    <div
      className="fixed inset-0 mb-20 bg-black/30 backdrop-blur-sm flex items-end justify-center z-50"
      onClick={onClose}
    >
      <div
        className="w-full sm:w-[400px] p-5 mb-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gray-900 text-gray-100 rounded-t-3xl shadow-lg border border-gray-700 animate-fadeInUp">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-9 right-1/2 translate-x-1/2 bg-gray-800 hover:bg-gray-700 rounded-full p-3 shadow-md z-50"
          >
            ✖
          </button>

          {/* Header */}
          <div className="text-center">
            <div className="bg-yellow-500 text-black rounded-t-xl py-2 font-bold">
              Room Details
            </div>
          </div>

          {/* Content */}
          <div className="mt-4 space-y-2 pb-8 text-center text-sm">
            {isJoined && hasRoom ? (
              <>
                <div className="flex justify-center items-center gap-2 my-2">
                  <p>🔥 Room ID: {roomId}</p>
                  <button
                    onClick={() => copyToClipboard(roomId, "Room id")}
                    className="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                  >
                    Copy
                  </button>
                </div>
                <div className="flex justify-center items-center gap-2 my-2">
                  <p>🔑 Password: {roomPass}</p>
                  <button
                    onClick={() => copyToClipboard(roomPass, "Passowrd")}
                    className="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                  >
                    Copy
                  </button>
                </div>
              </>
            ) : (
              <p className="font-bold my-4 text-yellow-400">
                ম্যাচ শুরু হওয়ার ৫-১০ মিনিট আগে Room Id শেয়ার করা হবে।
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPopup;
