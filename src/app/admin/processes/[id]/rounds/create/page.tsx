"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Open_Sans } from "next/font/google";
import TiptapEditor from "@/components/tiptap/TiptapEditor";

const openSans = Open_Sans({ subsets: ["latin"] });

export default function CreateRoundPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"form" | "instruction" | "hybrid">("form");
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const titleError = useMemo(() => {
    if (!title.trim()) return "Title is required";
    if (title.trim().length < 3) return "Title must be at least 3 characters";
    return null;
  }, [title]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (titleError) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setErrorMsg("You must be logged in as admin.");
      return;
    }

    try {
      setLoading(true);

      const payload =
  type === "form"
    ? { title: title.trim(), type: "form", fields: [] as string[] }
    : type === "instruction"
    ? { title: title.trim(), type: "instruction", instruction }
    : { title: title.trim(), type: "hybrid", instruction, fields: [] as string[] };


      const res = await fetch(`/api/admin/process/${id}/round`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to create round");
      }

      const data = await res.json();
      // Navigate: for form rounds, go straight to fields; else back to list
      if (type === "form") {
        router.push(`/admin/processes/${id}/rounds/${data.roundId}`);
      } else {
        router.push(`/admin/processes/${id}`);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create round");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${openSans.className} mx-auto max-w-fit p-4 md:p-8`}>
      <h1 className="text-2xl font-semibold text-slate-900">Create New Round</h1>
      <p className="mt-1 text-sm text-slate-600">
        Choose the round type and provide details.
      </p>

      {errorMsg && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <fieldset disabled={loading} className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-800">
              Title <span className="text-rose-600">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Phone Screen"
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${titleError
                  ? "border-rose-300 focus:ring-rose-400"
                  : "border-slate-200 focus:ring-blue-500"
                }`}
              maxLength={120}
              autoFocus
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className={`${titleError ? "text-rose-600" : "text-slate-500"}`}>
                {titleError ? titleError : "Short, descriptive name for the round."}
              </span>
              <span className="text-slate-400">{title.trim().length}/120</span>
            </div>
          </div>

          {/* Type (radio) */}
          <div>
            <span className="block text-sm font-medium text-slate-800">Type</span>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${type === "form" ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:bg-slate-50"
                }`}>
                <input
                  type="radio"
                  name="type"
                  value="form"
                  checked={type === "form"}
                  onChange={() => setType("form")}
                />
                Form (questions)
              </label>
              <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${type === "instruction" ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:bg-slate-50"
                }`}>
                <input
                  type="radio"
                  name="type"
                  value="instruction"
                  checked={type === "instruction"}
                  onChange={() => setType("instruction")}
                />
                Instruction (read-only round)
              </label>

              <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${type === "hybrid" ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:bg-slate-50"
                }`}>
                <input
                  type="radio"
                  name="type"
                  value="hybrid"
                  checked={type === "hybrid"}
                  onChange={() => setType("hybrid")}
                />
                Hybrid (instruction + questions)
              </label>
            </div>
          </div>

          {/* Instruction textarea (only when instruction) */}
          {type === "instruction" && (
            <div>
              <label htmlFor="instruction" className="block text-sm font-medium text-slate-800">
                Instruction
              </label>
              <TiptapEditor
                content={instruction}
                onContentUpdate={setInstruction}
                editable={true}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => router.push(`/admin/processes/${id}`)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!titleError}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                    <path fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4A4 4 0 0 0 8 12H4z" />
                  </svg>
                  Creating…
                </>
              ) : (
                "Create Round"
              )}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
