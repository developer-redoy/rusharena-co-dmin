"use client";

import React from "react";

const PrizePopup = ({ totalPrize, perKill, allPrize = [], onClose }) => {
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
              TOTAL WIN PRIZE
            </div>
          </div>

          {/* Prize Content */}
          <div className="text-center space-y-1 pb-8 text-sm mt-4">
            {allPrize.length > 0 &&
              allPrize.map((prize, index) => (
                <p key={index}>
                  🔥 {index + 1}
                  {index === 0
                    ? "st"
                    : index === 1
                    ? "nd"
                    : index === 2
                    ? "rd"
                    : "th"}{" "}
                  Prize: <strong>{prize}</strong> Taka
                </p>
              ))}

            <p>
              🔥 Per Kill: <strong>{perKill}</strong> Taka
            </p>
            <p className="font-bold my-4 text-yellow-400">
              🏆 Total Prize Pool: <strong>{totalPrize}</strong> Taka
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrizePopup;
