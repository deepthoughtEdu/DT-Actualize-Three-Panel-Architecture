// src/app/apply/[processId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ProcessMeta = {
  _id: string;
  title: string;
  description?: string;
  rounds?: any[];
  status: "draft" | "published";
};

export default function ProcessLandingPage() {
  const { processId } = useParams<{ processId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [process, setProcess] = useState<ProcessMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Minimal inline form state for creating candidate (if missing)
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");

  useEffect(() => {
    async function loadProcess() {
      try {
        setLoading(true);
        const res = await fetch(`/api/public/process/${processId}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || "Failed to load process");
        }
        const data = await res.json();
        setProcess(data);
      } catch (e: any) {
        setError(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    loadProcess();
  }, [processId]);

  async function ensureCandidate(): Promise<string | null> {
    // Use localStorage to persist candidateId (simple approach)
    const existing = typeof window !== "undefined" ? localStorage.getItem("candidateId") : null;
    if (existing) return existing;

    // No candidate yet — show quick form
    setShowCandidateForm(true);
    return null;
  }

  async function handleCreateCandidate() {
    try {
      if (!candidateName.trim() || !candidateEmail.trim()) {
        alert("Please enter name and email");
        return;
      }
      // Register candidate via our optional auth route
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: candidateName, email: candidateEmail }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to register");
      }
      const data = await res.json();
      const id = data?.candidate?._id || data?.candidateId;
      if (!id) throw new Error("No candidate id returned");
      localStorage.setItem("candidateId", id);
      setShowCandidateForm(false);
      // proceed to round 1
      router.push(`/apply/${processId}/round/1`);
    } catch (e: any) {
      alert(e.message || "Failed to create candidate");
    }
  }

  async function handleStart() {
    const id = await ensureCandidate();
    if (id) {
      router.push(`/apply/${processId}/round/1`);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p>Loading process…</p>
      </div>
    );
  }

  if (error || !process) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-2">Process not available</h1>
        <p className="text-sm opacity-80">{error || "Please check the link or try again later."}</p>
      </div>
    );
  }

  if (process.status !== "published") {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-2">{process.title}</h1>
        <p className="text-sm opacity-80">This process isn’t published yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{process.title}</h1>
        {process.description && (
          <p className="mt-2 text-sm opacity-80">{process.description}</p>
        )}
      </header>

      {!showCandidateForm ? (
        <button
          onClick={handleStart}
          className="px-4 py-2 rounded-md bg-black text-white"
        >
          Start
        </button>
      ) : (
        <div className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Tell us about you</h2>
          <div className="space-y-2">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Full name"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Email"
              type="email"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateCandidate}
              className="px-4 py-2 rounded-md bg-black text-white"
            >
              Continue
            </button>
            <button
              onClick={() => setShowCandidateForm(false)}
              className="px-4 py-2 rounded-md bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
