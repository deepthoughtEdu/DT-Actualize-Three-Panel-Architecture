// src/app/admin/processes/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Process {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
}

export default function AdminProcessesPage() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProcesses();
  }, []);

  async function fetchProcesses() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/admin/process", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load processes");
      }

      const data = await res.json();
      setProcesses(data);
    } catch (err: any) {
      console.error("Failed to load processes", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this process?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in.");
        return;
      }

      const res = await fetch(`/api/admin/process/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete process");
      }

      // Refresh list after delete
      setProcesses((prev) => prev.filter((p) => p._id !== id));
      alert("Process deleted successfully");
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(err.message);
    }
  }

  if (loading) {
    return <p className="text-center py-10">Loading processes...</p>;
  }

  if (error) {
    return (
      <p className="text-center py-10 text-red-500">
        {error}
      </p>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recruitment Processes</h1>
        <Link
          href="/admin/processes/create"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          + New Process
        </Link>
      </div>

      {processes.length === 0 ? (
        <p>No processes found. Start by creating one.</p>
      ) : (
        <div className="space-y-4">
          {processes.map((process) => (
            <div
              key={process._id}
              className="p-4 bg-white shadow rounded-lg flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold">{process.title}</h2>
                <p className="text-sm text-gray-600">
                  Status:{" "}
                  <span
                    className={`${
                      process.status === "published"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {process.status}
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  Created on {new Date(process.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-3">

              <Link
                href={`/admin/processes/${process._id}`}
                className="px-3 py-1 bg-blue-700 rounded-lg hover:bg-blue-900 text-sm text-white"
              >
                Manage
              </Link>
              <button
                  onClick={() => handleDelete(process._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
