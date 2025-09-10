"use client";

import { useState, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({ subsets: ["latin"] });

export default function CreateProcessPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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

    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setErrorMsg("You are not logged in.");
        setLoading(false);
        return;
      }

      const res = await axios.post(
        "/api/admin/process",
        { title: title.trim(), description: description.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      router.push(`/admin/processes/${res.data._id}`);
    } catch (err: any) {
      console.error("Failed to create process:", err);
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to create process";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${openSans.className} mx-auto max-w-2xl p-4 md:p-8`}>
      <h1 className="text-2xl font-semibold text-slate-900">Create New Recruitment Process</h1>
      <p className="mt-1 text-sm text-slate-600">
        Give your process a clear name and optional description.
      </p>

      {/* Error banner */}
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
              placeholder="e.g. Software Engineer Hiring"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                titleError
                  ? "border-rose-300 focus:ring-rose-400"
                  : "border-slate-200 focus:ring-blue-500"
              }`}
              maxLength={120}
              autoFocus
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className={`${
                titleError ? "text-rose-600" : "text-slate-500"
              }`}>
                {titleError ? titleError : "Use a short, descriptive title."}
              </span>
              <span className="text-slate-400">{title.trim().length}/120</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-800">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              placeholder="Brief description of the recruitment process"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={1000}
            />
            <div className="mt-1 text-right text-xs text-slate-400">
              {description.trim().length}/1000
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
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
                "Create Process"
              )}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
