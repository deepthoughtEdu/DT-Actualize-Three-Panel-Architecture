"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Round {
  _id: string;
  order: number;
  title: string;
  type: string;
  description?: string;
}

export default function EditRoundPage() {
  const { id, roundId } = useParams();
  const router = useRouter();
  const [round, setRound] = useState<Round | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRound() {
      const res = await fetch(`/api/admin/process/${id}/round/${roundId}`);
      if (res.ok) {
        const data = await res.json();
        setRound(data);
      }
      setLoading(false);
    }
    if (id && roundId) fetchRound();
  }, [id, roundId]);

  if (loading) return <p className="p-6">Loading round...</p>;
  if (!round) return <p className="p-6">Round not found.</p>;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setRound((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!round) return;

    const token = localStorage.getItem("token");

    const res = await fetch(`/api/admin/process/${id}/round/${roundId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        order: round.order,
        title: round.title,
        description: round.description,
        // 🚫 type is excluded so it won’t be updated
      }),
    });

    if (res.ok) {
      alert("Round updated successfully!");
      router.push(`/admin/processes/${id}/rounds`);
    } else {
      alert("Failed to update round");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Round</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Order</label>
          <input
            type="number"
            name="order"
            value={round.order}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={round.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Type</label>
          <select
            name="type"
            value={round.type}
            disabled // 🔒 make type non-editable
            className="w-full p-2 border rounded bg-gray-100 text-gray-600 cursor-not-allowed"
          >
            <option value="form">Form</option>
            <option value="instruction">Instruction</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            name="description"
            value={round.description || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => router.push(`/admin/processes/${id}/rounds`)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
