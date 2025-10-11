// src/app/admin/processes/[id]/publish/page.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({ subsets: ["latin"] });

type Round = {
  _id: string;
  order: number;
  title: string;
  type: string; // "form" | "instruction" | ...
};
type Process = {
  _id: string;
  title: string;
  description?: string;
  status?: string; // "draft" | "published" etc.
  rounds?: Round[];
  createdAt?: string;
};

function IconCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
    </svg>
  );
}
function IconX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4Z" />
    </svg>
  );
}
function IconPublish(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 2 8 6h3v6h2V6h3l-4-4Zm-7 9h14v9H5v-9Z" />
    </svg>
  );
}

export default function PublishProcessPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const processId = params.id;

  const [process, setProcess] = useState<Process | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch process details
  useEffect(() => {
    async function fetchProcess() {
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/admin/process/${processId}`);
        if (!res.ok) throw new Error("Failed to fetch process");
        const data = (await res.json()) as Process;
        setProcess(data);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to fetch process");
      } finally {
        setLoading(false);
      }
    }
    if (processId) fetchProcess();
  }, [processId]);

  // Simple checks before publishing
  const checks = useMemo(() => {
    const rounds = process?.rounds ?? [];
    const hasTitle = Boolean(process?.title?.trim());
    const hasAtLeastOneRound = rounds.length > 0;
    const orderedAscending = rounds.length
      ? rounds.slice().every((r, i, arr) =>
        i === 0 ? r.order >= 1 : r.order >= 1 && r.order >= arr[i - 1].order
      )
      : true;
    const roundsHaveTitles = rounds.every((r) => r.title && r.title.trim().length >= 2);

    return {
      hasTitle,
      hasAtLeastOneRound,
      orderedAscending,
      roundsHaveTitles,
    };
  }, [process]);

  const allGood =
    checks.hasTitle &&
    checks.hasAtLeastOneRound &&
    checks.orderedAscending &&
    checks.roundsHaveTitles;

  // Publish action
  async function handlePublish() {
    setPublishing(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/process/${processId}/publish`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to publish process");
      router.push(`/admin/processes/${processId}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to publish process");
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <div className={`${openSans.className} mx-auto max-w-3xl p-6`}>
        <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-28 w-full animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-20 w-full animate-pulse rounded bg-slate-200" />
      </div>
    );
  }

  if (!process) {
    return (
      <div className={`${openSans.className} mx-auto max-w-3xl p-6`}>
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Process not found.
        </p>
      </div>
    );
  }

  return (
    <div className={`${openSans.className} mx-auto max-w-3xl p-4 md:p-8`}>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Publish Process
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Review the checklist and publish when everything looks good.
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wide text-slate-500">Current</div>
            <div className="text-sm font-medium text-slate-800">{process.status || "draft"}</div>
          </div>
        </div>

        {/* Process summary */}
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="font-medium text-slate-900">{process.title}</div>
          {process.description && (
            <div className="mt-1 text-sm text-slate-600 line-clamp-3">{process.description}</div>
          )}
          <div className="mt-2 text-xs text-slate-500">
            {process.createdAt && <>Created {new Date(process.createdAt).toLocaleDateString()} • </>}
            {process.rounds?.length ?? 0} round{(process.rounds?.length ?? 0) === 1 ? "" : "s"}
          </div>
          <div className="mt-2">
            <Link
              href={`/admin/processes/${processId}`}
              className="text-sm text-blue-600 hover:underline"
            >
              View process details
            </Link>
          </div>
        </div>



        {/* Errors */}
        {errorMsg && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMsg}
          </div>
        )}

        {/* Checklist */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-slate-800">Pre-publish checklist</h2>
          <ul className="mt-3 space-y-2">
            <li className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
              {checks.hasTitle ? (
                <IconCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
              ) : (
                <IconX className="mt-0.5 h-4 w-4 text-rose-600" />
              )}
              <div className="text-sm">
                <div className="font-medium text-slate-900">Title is set</div>
                {!checks.hasTitle && (
                  <div className="text-slate-600">Add a clear process title.</div>
                )}
              </div>
            </li>

            <li className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
              {checks.hasAtLeastOneRound ? (
                <IconCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
              ) : (
                <IconX className="mt-0.5 h-4 w-4 text-rose-600" />
              )}
              <div className="text-sm">
                <div className="font-medium text-slate-900">At least one round</div>
                {!checks.hasAtLeastOneRound && (
                  <div className="text-slate-600">
                    Add a round from the process page.
                  </div>
                )}
              </div>
            </li>

            {/* <li className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
              {checks.orderedAscending ? (
                <IconCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
              ) : (
                <IconX className="mt-0.5 h-4 w-4 text-rose-600" />
              )}
              <div className="text-sm">
                <div className="font-medium text-slate-900">Rounds ordered</div>
                {!checks.orderedAscending && (
                  <div className="text-slate-600">Ensure round order is 1 → n.</div>
                )}
              </div>
            </li> */}

            <li className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
              {checks.roundsHaveTitles ? (
                <IconCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
              ) : (
                <IconX className="mt-0.5 h-4 w-4 text-rose-600" />
              )}
              <div className="text-sm">
                <div className="font-medium text-slate-900">Each round named</div>
                {!checks.roundsHaveTitles && (
                  <div className="text-slate-600">Give all rounds a meaningful title.</div>
                )}
              </div>
            </li>
          </ul>
        </div>

        {/* Warning before publishing */}
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          ⚠️ Once you publish this process, it will become <span className="font-medium">read-only</span>.
          You won’t be able to make edits afterwards.
        </div>


        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push(`/admin/processes/${processId}`)}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing || !allGood}
            className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {publishing ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                  <path fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4A4 4 0 0 0 8 12H4z" />
                </svg>
                Publishing…
              </>
            ) : (
              <>
                <IconPublish className="h-4 w-4" />
                Publish
              </>
            )}
          </button>
        </div>

        {!allGood && (
          <p className="mt-2 text-xs text-slate-500">
            Complete all checklist items to enable publishing.
          </p>
        )}
      </div>
    </div>
  );
}
