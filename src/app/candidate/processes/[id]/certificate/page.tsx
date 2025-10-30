"use client";

import React from "react";
import { useIsCertificateUnlocked } from "../Context";

export default function CertificatePage() {
  const isCertificateUnlocked = useIsCertificateUnlocked();

  return (
    <div className="relative h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-8 overflow-hidden">
      {/* Content container that blurs only this area */}
      <div
        className={`relative w-full max-w-3xl text-center transition-all duration-500 ${
          !isCertificateUnlocked ? "blur-md select-none pointer-events-none" : ""
        }`}
      >
        <h1 className="text-3xl font-bold text-blue-800 mb-4">
          🎓 Your Certificate
        </h1>
        <p className="text-gray-700 text-lg max-w-2xl mx-auto">
          Congratulations! You have successfully completed all rounds of the
          process. Download your certificate below.
        </p>

        <button
          className="mt-8 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
          disabled={!isCertificateUnlocked}
        >
          Download Certificate
        </button>
      </div>

      {/* Lock message — stays inside main area only */}
      {!isCertificateUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm z-10">
          <p className="text-gray-700 font-medium text-lg bg-white/80 px-6 py-3 rounded-xl shadow-md">
            🔒 Complete all rounds to unlock your certificate.
          </p>
        </div>
      )}
    </div>
  );
}
