"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({ subsets: ["latin"] });

interface Round {
  _id: string;
  order: number;
  title: string;
  type: string;
  description?: string;
}

export default function EditRoundPage() {
  const params = useParams<{ id: string; roundId: string }>();
  const id = useMemo(() => String(params?.id ?? ""), [params]);
  const roundId = useMemo(() => String(params?.roundId ?? ""), [params]);
  const router = useRouter();

  const [round, setRound] = useState<Round | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const original = useRef<Round | null>(null);

  useEffect(() => {
    async function fetchRound() {
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/admin/process/${id}/round/${roundId}`);
        if (!res.ok) throw new Error("Failed to load round");
        const data = (await res.json()) as Round;
        setRound(data);
        original.current = data;
      } catch (err: any) {
        setErrorMsg(err?.message || "Failed to load round");
      } finally {
        setLoading(false);
      }
    }
    if (id && roundId) fetchRound();
  }, [id, roundId]);

  const titleError =
    !round?.title?.trim()
      ? "Title is required"
      : round.title.trim().length < 3
      ? "Title must be at least 3 characters"
      : null;

  const orderError =
    round && (Number.isNaN(Number(round.order)) || Number(round.order) < 1)
      ? "Order must be a positive number"
      : null;

  const isDirty =
    round && original.current
      ? JSON.stringify(
          { order: round.order, title: round.title, description: round.description ?? "" }
        ) !==
        JSON.stringify({
          order: original.current.order,
          title: original.current.title,
          description: original.current.description ?? "",
        })
      : false;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!round || titleError || orderError) return;

    setErrorMsg(null);
    setSaving(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch(`/api/admin/process/${id}/round/${roundId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          order: Number(round.order),
          title: round.title.trim(),
          description: (round.description ?? "").trim(),
          // type intentionally excluded (non-editable)
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to update round");
      }

      router.push(`/admin/processes/${id}`);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update round");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setRound((prev) => (prev ? { ...prev, [name]: name === "order" ? Number(value) : value } : prev));
  }

  if (loading) {
    return (
      <div className={`${openSans.className} mx-auto max-w-2xl p-6`}>
        <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-28 w-full animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-20 w-full animate-pulse rounded bg-slate-200" />
      </div>
    );
  }

  if (!round) {
    return (
      <div className={`${openSans.className} mx-auto max-w-2xl p-6`}>
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Round not found.
        </p>
      </div>
    );
  }

  return (
    <div className={`${openSans.className} mx-auto max-w-2xl p-4 md:p-8`}>
      <h1 className="text-2xl font-semibold text-slate-900">Edit Round</h1>
      <p className="mt-1 text-sm text-slate-600">
        Update the details of this round. The type is fixed once created.
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
        <fieldset disabled={saving} className="space-y-5">
          {/* Order & Title */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* <div>
              <label htmlFor="order" className="block text-sm font-medium text-slate-800">
                Order <span className="text-rose-600">*</span>
              </label>
              <input
                id="order"
                name="order"
                type="number"
                min={1}
                value={round.order}
                onChange={handleChange}
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                  orderError ? "border-rose-300 focus:ring-rose-400" : "border-slate-200 focus:ring-blue-500"
                }`}
              />
              <p className={`mt-1 text-xs ${orderError ? "text-rose-600" : "text-slate-500"}`}>
                {orderError ? orderError : "Controls display order (1, 2, 3…)"}
              </p>
            </div> */}

            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-slate-800">
                Title <span className="text-rose-600">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={round.title}
                onChange={handleChange}
                placeholder="e.g. Phone Screen"
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                  titleError ? "border-rose-300 focus:ring-rose-400" : "border-slate-200 focus:ring-blue-500"
                }`}
                maxLength={120}
              />
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className={`${titleError ? "text-rose-600" : "text-slate-500"}`}>
                  {titleError ? titleError : "Short, descriptive name for the round."}
                </span>
                <span className="text-slate-400">{round.title.trim().length}/120</span>
              </div>
            </div>
          </div>

          {/* Type (locked) */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-slate-800">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={round.type}
              disabled
              className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
            >
              <option value="form">Form</option>
              <option value="instruction">Instruction</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">Type cannot be changed after creation.</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-800">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={round.description ?? ""}
              onChange={handleChange}
              rows={5}
              placeholder="Explain what happens in this round…"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={1000}
            />
            <div className="mt-1 text-right text-xs text-slate-400">
              {(round.description ?? "").trim().length}/1000
            </div>
          </div>

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
              disabled={saving || !!titleError || !!orderError || !isDirty}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                    <path fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4A4 4 0 0 0 8 12H4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
