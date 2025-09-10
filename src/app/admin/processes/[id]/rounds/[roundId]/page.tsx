"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Open_Sans } from "next/font/google";
import TiptapEditor from "@/components/tiptap/TiptapEditor";

const openSans = Open_Sans({ subsets: ["latin"] });

interface Field {
  _id: string;
  question: string;
  subType: string; // shortText, longText, multipleChoice, codeEditor, etc.
  options?: string[];
}

interface Uploads {
  url: string;
  type: "image" | "audio";
}

interface Round {
  _id: string;
  title: string;
  description?: string;
  type: string; // e.g., "mcq", "coding", "interview", "instruction"
  instruction?: string;
  uploads?: Uploads[];
  createdAt: string;
  fields?: Field[];
}

// tiny inline icons (no libs)
function IconEdit(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M5 18.08V21h2.92L18.84 10.08l-2.92-2.92L5 18.08M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.76 3.76 1.82-1.84Z" />
    </svg>
  );
}
function IconArrowLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z" />
    </svg>
  );
}
function IconPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
    </svg>
  );
}

export default function RoundDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string; roundId: string }>();
  const processId = useMemo(() => String(params?.id ?? ""), [params]);
  const roundId = useMemo(() => String(params?.roundId ?? ""), [params]);

  const [round, setRound] = useState<Round | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch round data
  useEffect(() => {
    async function fetchRound() {
      try {
        const res = await fetch(`/api/admin/process/${processId}/round/${roundId}`);
        if (!res.ok) throw new Error("Failed to fetch round");
        const data = await res.json();
        setRound(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (processId && roundId) fetchRound();
  }, [processId, roundId]);

  if (loading) {
    return (
      <div className={`${openSans.className} p-6`}>
        <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-28 w-full animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-64 w-full animate-pulse rounded bg-slate-200" />
      </div>
    );
  }
  if (error) return <div className={`${openSans.className} p-6 text-rose-600`}>Error: {error}</div>;
  if (!round) return <div className={`${openSans.className} p-6`}>Round not found.</div>;

  return (
    <div className={`${openSans.className} mx-auto max-w-5xl p-4 md:p-8`}>
      {/* Header card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{round.title}</h1>
            <div className="mt-1 text-sm text-slate-600">
              <span className="font-medium text-slate-700">Type:</span> {round.type}
            </div>
            {round.description && (
              <p className="mt-2 text-[0.95rem] leading-relaxed text-slate-700">{round.description}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push(`/admin/processes/${processId}/rounds/${roundId}/edit`)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <IconEdit className="h-4 w-4" />
              Edit Round
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {round.instruction && (
        <div className=" flex flex-col gap-4 mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm pb-2 font-semibold text-slate-800">Instructions</h2>
          <TiptapEditor
            editable={false}
            content={round.instruction}
          />

          {/* Uploads */}
          {/* {Array.isArray(round.uploads) && round.uploads.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {round.uploads.map((u, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                >
                  {u.type === "image" ? (
                    <img
                      src={u.url}
                      alt="instruction upload"
                      className="h-64 w-full bg-white object-contain"
                    />
                  ) : (
                    <div className="p-3">
                      <audio controls className="w-full">
                        <source src={u.url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )} */}
          {round.uploads && round.uploads.length > 0 && (
                <div className="space-y-4 mb-6 w-fit min-w-md mx-[200px]">
                  {round.uploads.map((u, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-gray-200 p-3 bg-gray-50 shadow-sm"
                    >
                      {u.type === "image" && (
                        <img
                          src={u.url}
                          alt="Instruction upload"
                          className="max-w-sm rounded-lg h-[200px] mx-auto"
                        />
                      )}
                      {u.type === "audio" && (
                        <audio controls className="w-full mt-2">
                          <source src={u.url} type="audio/mp3" />
                          Your browser does not support the audio element.
                        </audio>
                      )}
                    </div>
                  ))}
                </div>
              )}
        </div>
      )}

      {/* Fields (skip for instruction-only round) */}
      {round.type !== "instruction" && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Header row */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">Fields</h2>
            <div className="flex items-center gap-2">
              {/* <button
                onClick={() =>
                  router.push(`/admin/processes/${processId}/rounds/${roundId}/field`)
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Edit Fields
              </button> */}
              <button
                onClick={() =>
                  router.push(`/admin/processes/${processId}/rounds/${roundId}/field/create`)
                }
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
              >
                <IconPlus className="h-4 w-4" />
                Add Field
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr className="[&>th]:px-4 [&>th]:py-3">
                  <th className="w-[55%]">Field Title</th>
                  <th className="w-[20%]">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!round.fields || round.fields.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                      No fields yet. Use <span className="font-medium text-slate-700">Add Field</span> to create one.
                    </td>
                  </tr>
                ) : (
                  round.fields.map((field) => (
                    <tr key={field._id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{field.question}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{field.subType}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex items-center justify-end">
        <Link
          href={`/admin/processes/${processId}`}
          className="text-sm text-slate-600 hover:underline"
        >
          Back to Process
        </Link>
      </div>
    </div>
  );
}
