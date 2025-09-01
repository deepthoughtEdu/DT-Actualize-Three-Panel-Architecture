"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Field {
  _id: string;
  question: string;
  subType: "shortText" | "longText" | "number"; // extend later if needed
}

interface Upload {
  url: string;
  type: "image" | "audio"; // can extend later
}

interface Round {
  _id: string;
  order: number;
  title: string;
  type: "form" | "instruction";
  fields?: Field[];
  instruction?: string;
  uploads?: Upload[];   // 👈 new
}

export default function RoundSubmissionPage() {
  const { id, roundId } = useParams<{ id: string; roundId: string }>();
  const router = useRouter();

  const [rounds, setRounds] = useState<Round[]>([]);
  const [round, setRound] = useState<Round | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProcess = async () => {
      try {
        const res = await fetch(`/api/candidate/processes/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("Failed to fetch process");

        const process = await res.json();

        // ✅ sort rounds by order
        const sortedRounds = [...process.rounds].sort(
          (a: Round, b: Round) => Number(a.order) - Number(b.order)
        );
        setRounds(sortedRounds);

        const selected = sortedRounds.find((r) => r._id === roundId);
        setRound(selected || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id && roundId) fetchProcess();
  }, [id, roundId]);

  const handleChange = (fieldId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (round?.type === "form") {
        // Submit answers only for form rounds
        const res = await fetch(`/api/candidate/applications/${id}/round/${roundId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            answers: Object.entries(answers).map(([fieldId, answer]) => ({
              fieldId,
              answer,
            })),
          }),
        });

        if (!res.ok) throw new Error("Submission failed");
      }

      // ✅ Find next round
      const currentIndex = rounds.findIndex((r) => r._id === roundId);
      if (currentIndex !== -1 && currentIndex < rounds.length - 1) {
        const nextRoundId = rounds[currentIndex + 1]._id;
        alert("Round completed! Moving to next round...");
        router.push(`/candidate/processes/${id}/round/${nextRoundId}`);
      } else {
        alert("All rounds completed! Redirecting to dashboard...");
        router.push(`/candidate/dashboard`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit round. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Loading round...</p>
      </div>
    );
  }

  if (!round) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">Round not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="mb-2 text-2xl font-bold text-gray-800">{round.title}</h1>

      {round.type === "instruction" && (
        <>
          <p className="mb-6 text-gray-700">{round.instruction}</p>

          {/* ✅ Show uploads if any */}
          {round.uploads && round.uploads.length > 0 && (
            <div className="flex gap-3 justify-between mb-6 space-y-4">
              {round.uploads.map((u, idx) => (
                <div key={idx} className="rounded-xl flex border border-gray-200 p-3 bg-white shadow-sm">
                  {u.type === "image" && (
                    <img
                      src={u.url}
                      alt="Instruction upload"
                      className="max-w-sm rounded-lg h-[300px]"
                    />
                  )}
                  {u.type === "audio" && (
                    <audio controls className="w-full h-[300px]">
                      <source src={u.url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-blue-600 px-6 py-3 text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Proceeding..." : "Proceed to Next Round"}
          </button>
        </>
      )}


      {round.type === "form" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          {round.fields?.map((field) => (
            <div key={field._id} className="flex flex-col">
              <label className="mb-2 font-medium text-gray-800">{field.question}</label>
              <input
                type="text"
                className="rounded-xl border p-3 text-gray-700 shadow-sm focus:border-blue-500 focus:ring"
                required
                onChange={(e) => handleChange(field._id, e.target.value)}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-green-600 px-6 py-3 text-white shadow-md transition hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Round"}
          </button>
        </form>
      )}
    </div>
  );
}
