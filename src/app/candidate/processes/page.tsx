"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Process {
  _id: string;
  title: string;
  description: string;
  status: "draft" | "published";
  createdAt: string;
}

export default function CandidateProcessesPage() {
  const router = useRouter();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const res = await fetch("/api/candidate/processes");
        if (!res.ok) throw new Error("Failed to fetch processes");
        const data = await res.json();
        setProcesses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProcesses();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Loading processes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        Available Processes
      </h1>

      {processes.length === 0 ? (
        <p className="text-gray-500">No processes available right now.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {processes.map((process) => (
            <div
              key={process._id}
              className="cursor-pointer rounded-2xl bg-white p-6 shadow-md transition hover:shadow-lg"
              onClick={() =>
                router.push(`/candidate/processes/${process._id}`)
              }
            >
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                {process.title}
              </h2>
              <p className="mb-4 text-sm text-gray-600 line-clamp-3">
                {process.description}
              </p>
              <p className="text-xs text-gray-400">
                Created on {new Date(process.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
