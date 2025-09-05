// src/app/admin/page.tsx
"use client";

import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Manage recruitment processes, rounds, and candidate applications.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/processes"
          className="p-6 rounded-2xl shadow-md border hover:shadow-lg transition bg-white"
        >
          <h2 className="text-xl font-semibold mb-2">📂 Processes</h2>
          <p className="text-gray-500">
            View and manage all recruitment processes.
          </p>
        </Link>

        {/* <Link
          href="/admin/login"
          className="p-6 rounded-2xl shadow-md border hover:shadow-lg transition bg-white"
        >
          <h2 className="text-xl font-semibold mb-2">🔐 Authentication</h2>
          <p className="text-gray-500">Login and manage your admin account.</p>
        </Link> */}

        <Link
          href="/admin/processes/create"
          className="p-6 rounded-2xl shadow-md border hover:shadow-lg transition bg-white"
        >
          <h2 className="text-xl font-semibold mb-2">➕ Create Process</h2>
          <p className="text-gray-500">
            Start a new recruitment workflow from scratch.
          </p>
        </Link>

        <Link
          href="/admin/register"
          className="p-6 rounded-2xl shadow-md border hover:shadow-lg transition bg-white"
        >
          <h2 className="text-xl font-semibold mb-2">🛡️ Create Admin</h2>
          <p className="text-gray-500">
            Authorize other users to manage the platform.
          </p>
        </Link>
      </div>
    </div>
  );
}
