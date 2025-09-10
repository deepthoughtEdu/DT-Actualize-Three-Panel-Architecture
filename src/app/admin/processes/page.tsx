"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({ subsets: ["latin"] });

// --- Types ---
interface Process {
  _id: string;
  title: string;
  status: "draft" | "published" | string;
  createdAt: string;
}

// --- Tiny inline icons (no extra deps) ---
function IconUsers(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3m-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3m0 2c-2.33 0-7 1.17-7 3.5V19c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-2.5C15 14.17 10.33 13 8 13m8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.94 1.97 3.45V19c0 .34-.05.66-.14.97H22c.55 0 1-.45 1-1v-2.5C23 14.17 18.33 13 16 13Z" />
    </svg>
  );
}
function IconSettings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 8a4 4 0 1 0 .001 8.001A4 4 0 0 0 12 8m8.94 3-1.66-.96.12-1.93-1.89-.73-.73-1.89-1.93.12L12 3.06 10.86 4.6l-1.93-.12-.73 1.89-1.89.73.12 1.93L3.06 11 4.6 12.14l-.12 1.93 1.89.73.73 1.89 1.93-.12L12 20.94l1.14-1.54 1.93.12.73-1.89 1.89-.73-.12-1.93L20.94 12 19.4 10.86l.12-1.93-1.89-.73-.73-1.89-1.93.12L12 3.06l-1.14 1.54-1.93-.12-.73 1.89-1.89.73.12 1.93L3.06 12l1.54 1.14-.12 1.93 1.89.73.73 1.89 1.93-.12L12 20.94l1.14-1.54 1.93.12.73-1.89 1.89-.73-.12-1.93L20.94 12Z" />
    </svg>
  );
}
function IconTrash(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M9 3h6a1 1 0 0 1 1 1v1h4v2H4V5h4V4a1 1 0 0 1 1-1m1 5h2v10h-2zm-4 0h2v10H6zm8 0h2v10h-2z" />
    </svg>
  );
}
function IconPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6Z" />
    </svg>
  );
}

// --- Helpers ---
const statusChip = (s: string) => {
  const map: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    draft: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  };
  return map[s] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
};

type SortKey = "title" | "status" | "createdAt";
type SortDir = "asc" | "desc";

export default function AdminProcessesPage() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | "published" | "draft">("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    fetchProcesses();
  }, []);

  async function fetchProcesses() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/admin/process", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load processes");
      }
      const data = await res.json();
      setProcesses(data);
    } catch (err: any) {
      console.error("Failed to load processes", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this process?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("You are not logged in.");
      const res = await fetch(`/api/admin/process/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete process");
      setProcesses((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(err.message);
    }
  }

  const filtered = useMemo(() => {
    let list = [...processes];
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(t));
    }
    if (status) {
      list = list.filter((p) => p.status === status);
    }
    list.sort((a, b) => {
      const A = a[sortKey];
      const B = b[sortKey];
      if (sortKey === "createdAt") {
        const da = new Date(A).getTime();
        const db = new Date(B).getTime();
        return sortDir === "asc" ? da - db : db - da;
        }
      const sa = String(A).toLowerCase();
      const sb = String(B).toLowerCase();
      if (sa < sb) return sortDir === "asc" ? -1 : 1;
      if (sa > sb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [processes, q, status, sortKey, sortDir]);

  function changeSort(key: SortKey) {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDir("asc");
      return key;
    });
  }

  if (loading) {
    return (
      <div className={`${openSans.className} p-8`}>
        <div className="animate-pulse text-slate-500">Loading processes…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${openSans.className} p-8`}>
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className={`${openSans.className} p-4 md:p-8`}>
      {/* Header Row */}
      <div className="mb-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Recruitment Processes</h1>
          <p className="text-sm text-slate-600">
            Browse, filter, and manage your processes.
          </p>
        </div>
        <Link
          href="/admin/processes/create"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
        >
          <IconPlus className="h-4 w-4" />
          New Process
        </Link>
      </div>

      {/* Controls */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="col-span-2 flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title…"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="flex items-center justify-start gap-2 md:justify-end">
          <button
            onClick={() => changeSort("title")}
            className={`rounded-lg border px-3 py-2 text-sm hover:bg-slate-50 ${
              sortKey === "title" ? "border-blue-300 text-blue-700" : "border-slate-200 text-slate-700"
            }`}
          >
            Sort by Title {sortKey === "title" ? (sortDir === "asc" ? "↑" : "↓") : ""}
          </button>
          <button
            onClick={() => changeSort("createdAt")}
            className={`rounded-lg border px-3 py-2 text-sm hover:bg-slate-50 ${
              sortKey === "createdAt" ? "border-blue-300 text-blue-700" : "border-slate-200 text-slate-700"
            }`}
          >
            Sort by Date {sortKey === "createdAt" ? (sortDir === "asc" ? "↑" : "↓") : ""}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr className="[&>th]:px-4 [&>th]:py-3">
                <th className="w-[40%]">Title</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    No processes found. Try adjusting filters or{" "}
                    <Link href="/admin/processes/create" className="text-blue-600 underline">
                      create a new process
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{p.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${statusChip(p.status)}`}>
                        <span className="h-2 w-2 rounded-full bg-current/60"></span>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/processes/${p._id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          title="Manage"
                        >
                          <IconSettings className="h-4 w-4" />
                          Manage
                        </Link>
                        <Link
                          href={`/admin/processes/applications/${p._id}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                          title="Applications"
                        >
                          <IconUsers className="h-4 w-4" />
                          Applications
                        </Link>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                          title="Delete"
                        >
                          <IconTrash className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
