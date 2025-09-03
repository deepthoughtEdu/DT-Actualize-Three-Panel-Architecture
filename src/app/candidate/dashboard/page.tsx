"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface RoundProgress {
  roundId: string;
  status: "pending" | "submitted";
}

interface Application {
  _id: string;
  processId: {
    _id: string;
    title: string;
    description: string;
  };
  status: "applied" | "in-progress" | "completed";
  rounds: RoundProgress[];
}

export default function CandidateDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token"); // make sure you store token at login
      const res = await fetch("/api/candidate/applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch applications");
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchApplications();
}, []);


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-2xl font-semibold text-gray-800">
          No Applications Found
        </h2>
        <p className="text-gray-600 mb-6">
          You haven’t applied to any process yet. Explore opportunities!
        </p>
        <Link
          href="/candidate/processes"
          className="rounded-xl bg-blue-600 px-6 py-3 text-white shadow-md transition hover:bg-blue-700"
        >
          Browse Processes
        </Link>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50 p-6">
    <h1 className="mb-6 text-3xl font-bold text-gray-800">My Applications</h1>

    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {applications.map((app) => (
        <div
          key={app._id}
          className="rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold text-gray-800">
            {app.processId.title}
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            {app.processId.description}
          </p>

          <div className="mb-4">
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                app.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : app.status === "in-progress"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {app.status}
            </span>
          </div>

          <div className="space-y-2">
            {app.rounds.map((round, idx) => (
              <div
                key={round.roundId}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="text-gray-800">Round {idx + 1}</span>
                {round.status === "submitted" ? (
                  <span className="text-green-600 font-medium">Submitted</span>
                ) : (
                  <Link
                    href={`/candidate/processes/${app.processId._id}/round/${round.roundId}`}
                    className="text-blue-600 hover:underline"
                  >
                    Continue
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* CTA Section */}
    <div className="mt-10 flex flex-col items-center justify-center text-center">
      <h2 className="mb-2 text-2xl font-semibold text-gray-800">
        Looking for more opportunities?
      </h2>
      <p className="text-gray-600 mb-6">
        Browse other available processes and apply today!
      </p>
      <Link
        href="/candidate/processes"
        className="rounded-xl bg-blue-600 px-6 py-3 text-white shadow-md transition hover:bg-blue-700"
      >
        Browse Processes
      </Link>
    </div>
  </div>
);
}
