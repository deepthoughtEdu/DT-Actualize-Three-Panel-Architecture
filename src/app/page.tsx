// src/app/page.tsx
"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-4xl font-bold mb-6 text-blue-700">Welcome to DTActualize</h1>
      <p className="text-lg text-gray-600 mb-10">
        AI-powered recruitment platform for streamlined hiring processes.
      </p>

      <div className="flex gap-6">
        <Link
          href="/admin/login"
          className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md"
        >
          Admin Login
        </Link>

        <Link
          href="/candidate/login"
          className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-md"
        >
          Apply as Candidate
        </Link>
      </div>
    </div>
  );
}
