"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Round {
  _id: string;
  order: number;
  title: string;
  type: string;
}

interface Process {
  _id: string;
  title: string;
  description: string;
  status: string;
  rounds: Round[];
}

export default function ProcessDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [process, setProcess] = useState<Process | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProcess() {
      const res = await fetch(`/api/admin/process/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProcess(data);
      }
      setLoading(false);
    }
    if (id) fetchProcess();
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!process) return <p className="p-6">Process not found.</p>;

  const goToRounds = () => {
    router.push(`/admin/processes/${id}/rounds`);
  };

  const goToPublish = () => {
    router.push(`/admin/processes/${id}/publish`);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{process.title}</h1>
      <p className="mb-4">{process.description}</p>
      <p className="mb-4">
        <span className="font-semibold">Status:</span> {process.status}
      </p>

      <h2 className="text-xl font-semibold mb-2">Rounds</h2>
      <ul className="list-disc pl-6 mb-6">
        {process.rounds.map((round) => (
          <li key={round._id}>
            {round.order}. {round.title} ({round.type})
          </li>
        ))}
      </ul>

      <div className="flex space-x-4">
        <button
          onClick={goToRounds}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Manage Rounds
        </button>
        <button
          onClick={goToPublish}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Publish
        </button>
      </div>
    </div>
  );
}
