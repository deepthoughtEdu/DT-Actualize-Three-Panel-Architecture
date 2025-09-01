"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CreateFieldPage() {
  const { id: processId, roundId } = useParams(); // ✅ destructured from URL
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [type, setType] = useState("shortText");
  const [token, setToken] = useState<string | null>(null);

  // ✅ Only run in browser
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);
  }, []);

  const handleCreate = async () => {
    if (!token) {
      alert("Not authenticated");
      return;
    }

    const res = await fetch(
      `/api/admin/process/${processId}/round/${roundId}/field`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ attach token
        },
        body: JSON.stringify({ question, subType: type }),
      }
    );

    if (res.ok) {
      router.push(`/admin/processes/${processId}/rounds/${roundId}`);
    } else {
      const err = await res.json();
      alert("Error: " + err.error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Create Field</h1>
      <input
        type="text"
        placeholder="Enter question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="border p-2 block mt-2 w-full"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border p-2 block mt-2"
      >
        <option value="text">Text</option>
        {/* <option value="longText">Long Text</option> */}
        {/* <option value="codeEditor">Code Editor</option> */}
        {/* <option value="singleChoice">Single Choice</option> */}
        {/* <option value="multipleChoice">Multiple Choice</option> */}
      </select>
      <button
        onClick={handleCreate}
        className="bg-green-600 text-white px-4 py-2 rounded mt-4"
      >
        Create Field
      </button>
    </div>
  );
}
