"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CreateRoundPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    type: "form", // default is form
    fields: [] as string[],
    instruction: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in as admin.");
      return;
    }

    // ✅ Prepare payload based on type
    const payload =
      form.type === "form"
        ? { title: form.title, type: "form", fields: form.fields }
        : { title: form.title, type: "instruction", instruction: form.instruction };

    const res = await fetch(`/api/admin/process/${id}/round`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      alert("Round created successfully!");
      // router.push(`/admin/processes/${id}/rounds/${data.roundId}/field`);
      if (form.type === "form") {
        router.push(`/admin/processes/${id}/rounds/${data.roundId}/field`);
      } else {
        router.push(`/admin/processes/${id}/rounds`);
      }
    } else {
      const error = await res.json();
      alert(error.error || "Failed to create round");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Round</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Type (dropdown instead of free text) */}
        <div>
          <label className="block font-medium">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="form">Form</option>
            <option value="instruction">Instruction</option>
          </select>
        </div>

        {/* Conditionally render fields or instruction */}
        {form.type === "form" ? (
          <div>
            {/* <label className="block font-medium">Fields (comma-separated)</label>
            <input
              type="text"
              value={form.fields.join(",")}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  fields: e.target.value.split(",").map((f) => f.trim()),
                }))
              }
              className="w-full p-2 border rounded"
              placeholder="e.g. name,email,age"
            /> */}
          </div>
        ) : (
          <div>
            <label className="block font-medium">Instruction</label>
            <textarea
              name="instruction"
              value={form.instruction}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Enter instructions for this round..."
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Create Round
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
