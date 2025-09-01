"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function CreateProcessPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      alert("Title is required");
      return;
    }

    try {
      setLoading(true);

      // ✅ Get token from localStorage (stored at login)
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in.");
        return;
      }

      const res = await axios.post(
        "/api/admin/process",
        { title, description },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ attach token
          },
        }
      );

      // Redirect to edit page
      router.push(`/admin/processes/${res.data._id}`);
    } catch (err) {
      console.error("Failed to create process:", err);
      alert("Failed to create process");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Create New Recruitment Process</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 border p-4 rounded bg-gray-50"
      >
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            placeholder="e.g. Software Engineer Hiring"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border px-3 py-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            placeholder="Brief description of the recruitment process"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="border px-3 py-2 w-full rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Creating..." : "Create Process"}
        </button>
      </form>
    </div>
  );
}
