// src/app/admin/processes/[id]/publish/page.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PublishProcessPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const processId = params.id;

  const [loading, setLoading] = useState(false);
  const [process, setProcess] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch process details
  useEffect(() => {
    async function fetchProcess() {
      try {
        const res = await fetch(`/api/admin/process/${processId}`);
        if (!res.ok) throw new Error("Failed to fetch process");
        const data = await res.json();
        setProcess(data);
      } catch (err: any) {
        setError(err.message);
      }
    }

    if (processId) fetchProcess();
  }, [processId]);

  // Handle publish action
  const handlePublish = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/process/${processId}/publish`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to publish process");
      router.push(`/admin/processes/${processId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!process) return <div className="p-4">Loading process...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Publish Process: {process.title}
      </h1>
      <p className="mb-4 text-gray-600">
        Are you sure you want to publish this process? Once published,
        candidates will be able to view and apply.
      </p>

      <div className="flex gap-4">
        <button
          onClick={handlePublish}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
        <button
          onClick={() => router.push(`/admin/processes/${processId}`)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
