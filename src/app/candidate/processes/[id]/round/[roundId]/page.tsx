"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TiptapEditor from "@/components/tiptap/TiptapEditor";
import Link from "next/link";

interface Field {
  _id: string;
  question: string;
  subType: "shortText" | "longText" | "number";
}

interface Upload {
  url: string;
  type: "image" | "audio";
}

interface Round {
  _id: string;
  order: number;
  title: string;
  type: "form" | "instruction";
  fields?: Field[];
  instruction?: string;
  uploads?: Upload[];
}

export default function RoundSubmissionPage() {
  const { id, roundId } = useParams<{ id: string; roundId: string }>();
  const router = useRouter();

  const [rounds, setRounds] = useState<Round[]>([]);
  const [round, setRound] = useState<Round | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

   useEffect(() => {
    const markInProgress = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch(`/api/candidate/applications/${id}/round/${roundId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: [] }), // 🔹 empty, still marks as in-progress
      });
    };

    markInProgress();
  }, [id, roundId]);

  // ✅ Fetch process + application answers
  useEffect(() => {
    const fetchProcessAndAnswers = async () => {
      try {
        const token = localStorage.getItem("token");

        // fetch process
        const res = await fetch(`/api/candidate/processes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch process");
        const process = await res.json();

        const sortedRounds = [...process.rounds].sort(
          (a: Round, b: Round) => Number(a.order) - Number(b.order)
        );
        setRounds(sortedRounds);

        const selected = sortedRounds.find((r) => r._id === roundId);
        setRound(selected || null);

        // fetch application (to load existing answers)
        const appRes = await fetch(`/api/candidate/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (appRes.ok) {
          const apps = await appRes.json();
          const app = apps.find((a: any) => a.process._id === id);
          if (app) {
            const roundProgress = app.rounds.find(
              (r: any) => r.roundId === roundId
            );
            if (roundProgress && roundProgress.answers) {
              const prefilled: Record<string, string> = {};
              roundProgress.answers.forEach((ans: any) => {
                prefilled[ans.fieldId] = ans.answer;
              });
              setAnswers(prefilled);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id && roundId) fetchProcessAndAnswers();
  }, [id, roundId]);

  // ✅ Autosave on change
  const handleChange = async (fieldId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await fetch(`/api/candidate/applications/${id}/round/${roundId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: [{ fieldId, answer: value }],
        }),
      });
    } catch (err) {
      console.error("Autosave failed:", err);
    } finally {
      setSaving(false);
    }
  };

  // ✅ Full round submit
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload =
        round?.type === "form"
          ? {
            answers: Object.entries(answers).map(([fieldId, answer]) => ({
              fieldId,
              answer,
            })),
          }
          : {};

      const res = await fetch(
        `/api/candidate/applications/${id}/round/${roundId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Submission failed");

      const currentIndex = rounds.findIndex((r) => r._id === roundId);
      if (currentIndex !== -1 && currentIndex < rounds.length - 1) {
        const nextRoundId = rounds[currentIndex + 1]._id;
        // alert("Round completed! Moving to next round...");
        router.push(`/candidate/processes/${id}/round/${nextRoundId}`);
      } else {
        // alert("All rounds completed! Redirecting to dashboard...");
        router.push(`/candidate/dashboard`);
      }
    } catch (err) {
      console.error(err);
      // alert("Failed to submit round. Try again.");
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
      <h1 className="text-center mb-2 text-3xl font-bold text-gray-800">{round.title}</h1>

      {round.type === "instruction" && (
        <>
          <p className="flex justify-center mb-6 text-gray-700">
            <TiptapEditor
              editable={false}
              content={round.instruction}
            />
          </p>

          {/* ✅ Show uploads if any */}
          {round.uploads && round.uploads.length > 0 && (
            <div className="flex gap-3 justify-center mb-6 space-y-4">
              {round.uploads.map((u, idx) => (
                <div
                  key={idx}
                  className="rounded-xl flex border border-gray-200 p-3 bg-white shadow-sm "
                >
                  {u.type === "image" && (
                    <img
                      src={u.url}
                      alt="Instruction upload"
                      className="max-w-sm rounded-lg h-[200px]"
                    />
                  )}
                  {u.type === "audio" && (
                    <>
                      {console.log("Audio URL:", u.url)}
                      <audio controls className="flex flex-row my-10 ">
                        <source src={u.url} type="audio/mp3" />
                        Your browser does not support the audio element.
                      </audio>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className='flex justify-center gap-4'>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-6 py-3 text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Proceeding..." : "Proceed to Next Round"}
            </button>

            <Link href="/candidate/dashboard">
              <button className="rounded-xl bg-blue-600 px-6 py-3 text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50">
                Return to dashboard
              </button>
            </Link>
          </div>
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
              <label className="mb-2 font-medium text-gray-800">
                {field.question}
              </label>
              <input
                type="text"
                className="rounded-xl border p-3 text-gray-700 shadow-sm focus:border-blue-500 focus:ring"
                value={answers[field._id] || ""}
                onChange={(e) => handleChange(field._id, e.target.value)}
              />
            </div>
          ))}

          {saving && (
            <p className="text-sm text-gray-500">Saving draft...</p>
          )}

          <div className="flex flex-row gap-5">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-green-600 px-6 py-3 text-white shadow-md transition hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Round"}
            </button>

            <Link href="/candidate/dashboard">
              <button className="rounded-xl bg-blue-600 px-6 py-3 text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50">
                Return to dashboard
              </button>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
