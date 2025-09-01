"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Round {
  _id: string;
  order: number;
  title: string;
  type: string;
}

export default function RoundsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRounds() {
      const res = await fetch(`/api/admin/process/${id}/round`);
      if (res.ok) {
        const data = await res.json();
        setRounds(data);
      }
      setLoading(false);
    }
    if (id) fetchRounds();
  }, [id]);

  if (loading) return <p className="p-6">Loading rounds...</p>;

  const handleView = (roundId: string) => {
    router.push(`/admin/processes/${id}/rounds/${roundId}`);
  };

  const handleEdit = (roundId: string) => {
    router.push(`/admin/processes/${id}/rounds/${roundId}/edit`);
  };

  // 👇 Now handles both fields and instruction
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
  const token = localStorage.getItem("token");

  const handleDelete = async (roundId: string) => {
    if (!confirm("Are you sure you want to delete this round?")) return;
    const res = await fetch(`/api/admin/process/${id}/round/${roundId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      setRounds((prev) => prev.filter((r) => r._id !== roundId));
    } else {
      alert("Failed to delete round");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Rounds</h1>

      {rounds.length === 0 ? (
        <p>No rounds yet. Create one below.</p>
      ) : (
        <ul className="divide-y divide-gray-200 mb-6">
          {rounds.map((round) => (
            <li
              key={round._id}
              className="flex items-center justify-between py-3"
            >
              <div>
                <p className="font-semibold">
                  {round.order}. {round.title}
                </p>
                <p className="text-sm text-gray-500">{round.type}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleView(round._id)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  View
                </button>
                <button
                  onClick={() => handleEdit(round._id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>

                {/* ✅ Show either Fields or Instruction button */}
                <button
                  onClick={() => handleManage(round._id, round.type)}
                  className={`px-3 py-1 text-white rounded ${
                    round.type === "instruction"
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {round.type === "instruction" ? "Instruction" : "Fields"}
                </button>

                <button
                  onClick={() => handleDelete(round._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={handleCreate}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        + Create New Round
      </button>
    </div>
  );
}
