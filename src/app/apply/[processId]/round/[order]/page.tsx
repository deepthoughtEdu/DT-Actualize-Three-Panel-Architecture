// src/app/apply/[processId]/round/[order]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Round = {
  order: number;
  title: string;
  instructions?: string;
  fields?: { name: string; type: string; label: string; required?: boolean }[];
};

type ProcessMeta = {
  _id: string;
  title: string;
  rounds: Round[];
};

export default function RoundPage() {
  const { processId, order } = useParams<{ processId: string; order: string }>();
  const router = useRouter();

  const [process, setProcess] = useState<ProcessMeta | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Record<string, string | File>>({});

  useEffect(() => {
    async function loadProcess() {
      try {
        setLoading(true);
        const res = await fetch(`/api/public/process/${processId}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load process");
        const data = await res.json();
        setProcess(data);

        const roundData = data.rounds.find(
          (r: Round) => r.order === Number(order)
        );
        setRound(roundData || null);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadProcess();
  }, [processId, order]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, files } = e.target as any;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const candidateId = localStorage.getItem("candidateId");
      if (!candidateId) throw new Error("No candidate found");

      const submissionPayload = new FormData();
      submissionPayload.append("candidateId", candidateId);
      submissionPayload.append("processId", processId!);
      submissionPayload.append("roundOrder", order!);

      Object.entries(formData).forEach(([k, v]) => {
        if (v instanceof File) {
          submissionPayload.append(k, v);
        } else {
          submissionPayload.append(k, v as string);
        }
      });

      const res = await fetch("/api/submissions", {
        method: "POST",
        body: submissionPayload,
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to submit");
      }

      // Next round or completion
      if (process && Number(order) < process.rounds.length) {
        router.push(`/apply/${processId}/round/${Number(order) + 1}`);
      } else {
        router.push(`/apply/${processId}/complete`);
      }
    } catch (e: any) {
      alert(e.message || "Submission failed");
    }
  }

  if (loading) return <div className="p-6">Loading round…</div>;
  if (error || !round)
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Round not available</h1>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{round.title}</h1>
        {round.instructions && (
          <p className="mt-2 text-sm opacity-80">{round.instructions}</p>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {round.fields?.map((field) => (
          <div key={field.name} className="flex flex-col">
            <label className="font-medium mb-1">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                required={field.required}
                className="border rounded p-2"
                onChange={handleChange}
              />
            ) : field.type === "file" ? (
              <input
                type="file"
                name={field.name}
                required={field.required}
                className="border rounded p-2"
                onChange={handleChange}
              />
            ) : (
              <input
                type={field.type}
                name={field.name}
                required={field.required}
                className="border rounded p-2"
                onChange={handleChange}
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-black text-white"
        >
          Submit & Continue
        </button>
      </form>
    </div>
  );
}
