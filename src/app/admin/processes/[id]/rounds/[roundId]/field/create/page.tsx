// src/app/admin/processes/[id]/rounds/[roundId]/field/create/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({ subsets: ["latin"] });

type SubType =
  | "shortText"
  | "longText"
  | "singleChoice"
  | "multipleChoice"
  | "codeEditor";

export default function CreateFieldPage() {
  const params = useParams<{ id: string; roundId: string }>();
  const processId = useMemo(() => String(params?.id ?? ""), [params]);
  const roundId = useMemo(() => String(params?.roundId ?? ""), [params]);
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [type, setType] = useState<SubType>("shortText");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // load token only in the browser
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const questionError =
    !question.trim()
      ? "Question is required"
      : question.trim().length < 5
      ? "Field Title must be at least 5 characters"
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (questionError) return;
    if (!token) {
      setErrorMsg("You are not logged in.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/process/${processId}/round/${roundId}/field`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ question: question.trim(), subType: type }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to create field");
      }

      // go back to the round details
      router.push(`/admin/processes/${processId}/rounds/${roundId}`);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create field");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${openSans.className} mx-auto max-w-2xl p-4 md:p-8`}>
      <h1 className="text-2xl font-semibold text-slate-900">Create Field</h1>
      <p className="mt-1 text-sm text-slate-600">
        Define the fields and choose the response type.
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
          {/* Question */}
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-slate-800">
              Field Title <span className="text-rose-600">*</span>
            </label>
            <input
              id="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Why do you want to join us?"
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                questionError
                  ? "border-rose-300 focus:ring-rose-400"
                  : "border-slate-200 focus:ring-blue-500"
              }`}
              maxLength={240}
              autoFocus
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className={`${questionError ? "text-rose-600" : "text-slate-500"}`}>
                {questionError ? questionError : "Keep it clear and concise."}
              </span>
              <span className="text-slate-400">{question.trim().length}/240</span>
            </div>
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-slate-800">
              Response Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as SubType)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="shortText">Short Text</option>
              <option value="fileUpload">File Upload</option>
              {/* <option value="longText">Long Text</option>
              <option value="singleChoice">Single Choice</option>
              <option value="multipleChoice">Multiple Choice</option>
              <option value="codeEditor">Code Editor</option> */}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              You can configure options/validation later if needed.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => router.push(`/admin/processes/${processId}/rounds/${roundId}`)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!questionError}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
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
                "Create Field"
              )}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
