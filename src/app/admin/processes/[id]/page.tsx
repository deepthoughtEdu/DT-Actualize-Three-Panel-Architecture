"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// --- Types ---
interface Round {
  _id: string;
  order: number;
  title: string;
  type: string; // "instruction" | others
}
interface Process {
  _id: string;
  title: string;
  description: string;
  status: string; // "published" | "draft" | "archived" | etc.
  rounds: Round[];
}

// --- Tiny inline icons (no deps) ---
function IconSettings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 8a4 4 0 1 0 .001 8.001A4 4 0 0 0 12 8m8.94 3-1.66-.96.12-1.93-1.89-.73-.73-1.89-1.93.12L12 3.06 10.86 4.6l-1.93-.12-.73 1.89-1.89.73.12 1.93L3.06 11 4.6 12.14l-.12 1.93 1.89.73.73 1.89 1.93-.12L12 20.94l1.14-1.54 1.93.12.73-1.89 1.89-.73-.12-1.93L20.94 12Z"/>
    </svg>
  );
}
function IconPublish(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 2l4 4h-3v6h-2V6H8l4-4m-7 9h14v9H5v-9Z"/>
    </svg>
  );
}
function IconEye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/>
    </svg>
  );
}
function IconEdit(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M5 18.08V21h2.92L18.84 10.08l-2.92-2.92L5 18.08M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.76 3.76 1.83-1.83Z"/>
    </svg>
  );
}
function IconFields(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M3 5h18v2H3V5m0 6h18v2H3v-2m0 6h18v2H3v-2Z"/>
    </svg>
  );
}
function IconInstruction(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M13 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3m-1 5v6h2V8h-2Zm0 8v2h2v-2h-2Z"/>
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
    archived: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  };
  return map[s] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
};

export default function ProcessDetailsPage() {
  const params = useParams();
  const [isPublished, setIsPublished] = useState(false);
  const id = useMemo(() => String(params?.id ?? ""), [params]);
  const router = useRouter();

  const [process, setProcess] = useState<Process | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch process (with rounds)
  useEffect(() => {
    async function fetchProcess() {
      const res = await fetch(`/api/admin/process/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProcess(data);
        setIsPublished(data.status == 'published');
      }
      setLoading(false);
    }
    if (id) fetchProcess();
  }, [id]);

  // --- Round Actions (lifted from your RoundsPage) ---
  const handleView = (roundId: string) => {
    router.push(`/admin/processes/${id}/rounds/${roundId}`);
  };

  const handleEdit = (roundId: string) => {
    router.push(`/admin/processes/${id}/rounds/${roundId}/edit`);
  };

  const handleManage = (roundId: string, type: string) => {
    if (type === "instruction") {
      router.push(`/admin/processes/${id}/rounds/${roundId}/instruction`);
    } else {
      router.push(`/admin/processes/${id}/rounds/${roundId}`);
    }
  };

  const handleCreate = () => {
    router.push(`/admin/processes/${id}/rounds/create`);
  };

  const handleDelete = async (roundId: string) => {
    if (!confirm("Are you sure you want to delete this round?")) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const res = await fetch(`/api/admin/process/${id}/round/${roundId}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      // Optimistically remove from state
      setProcess((prev) =>
        prev ? { ...prev, rounds: prev.rounds.filter((r) => r._id !== roundId) } : prev
      );
    } else {
      alert("Failed to delete round");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-24 w-full animate-pulse rounded bg-slate-200" />
        <div className="mt-6 h-56 w-full animate-pulse rounded bg-slate-200" />
      </div>
    );
  }

  if (!process) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Process not found.
        </p>
        <Link href="/admin/processes" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to Processes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      {/* Header card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{process.title}</h1>
            <p className="mt-1 text-sm text-slate-600">{process.description}</p>
            <div className="mt-3">
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${statusChip(process.status)}`}>
                <span className="h-2 w-2 rounded-full bg-current/60" />
                {process.status}
              </span>
            </div>
          </div>
          {!isPublished && <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push(`/admin/processes/${id}/publish`)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <IconPublish className="h-4 w-4" />
              Publish
            </button>
          </div>}
        </div>
      </div>

      {/* Rounds table + actions inline */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Table header with Create */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">Rounds</h2>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <IconPlus className="h-4 w-4" />
            Add Round
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr className="[&>th]:px-4 [&>th]:py-3">
                <th className="w-[5%]">#</th>
                <th className="w-[35%]">Title</th>
                <th className="w-[10%]">Type</th>
                <th className="w-[40%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {process.rounds.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    No rounds yet. Click <span className="font-medium text-slate-700">Add Round</span> to add one.
                  </td>
                </tr>
              ) : (
                process.rounds
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((round) => (
                    <tr key={round._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{round.order}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{round.title}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{round.type}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(round._id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            title="View"
                          >
                            <IconEye className="h-4 w-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(round._id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                            title="Edit"
                          >
                            <IconEdit className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleManage(round._id, round.type)}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-white hover:opacity-95 ${
                              round.type === "instruction" ? "bg-amber-600" : "bg-indigo-600"
                            }`}
                            title={round.type === "instruction" ? "Instruction" : "Fields"}
                          >
                            {round.type === "instruction" ? (
                              <>
                                <IconInstruction className="h-4 w-4" />
                                Instruction
                              </>
                            ) : (
                              <>
                                <IconFields className="h-4 w-4" />
                                Fields
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(round._id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
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

      {/* Footer link */}
      <div className="mt-6 flex items-center justify-end">
        <Link href="/admin/processes" className="text-sm text-slate-600 hover:underline">
          Back to Processes
        </Link>
      </div>
    </div>
  );
}
