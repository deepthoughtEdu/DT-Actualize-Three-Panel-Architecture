"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Field {
  _id: string;
  question: string;
  subType: string; // shortText, longText, codeEditor, etc.
}

interface Uploads {
  url: string;
  type: "image" | "audio";
}

interface Round {
  _id: string;
  title: string;
  description?: string;
  type: string; // e.g., "mcq", "coding", "interview"
  instruction?: string;
  uploads?: Uploads[];
  createdAt: string;
  fields?: Field[];
}

export default function RoundDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string; roundId: string }>();
  const { id: processId, roundId } = params;

  const [round, setRound] = useState<Round | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch round data
  useEffect(() => {
    async function fetchRound() {
      try {
        const res = await fetch(
          `/api/admin/process/${processId}/round/${roundId}`
        );
        if (!res.ok) throw new Error("Failed to fetch round");
        const data = await res.json();
        setRound(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (processId && roundId) fetchRound();
  }, [processId, roundId]);

  if (loading) return <div className="p-4">Loading round details...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!round) return <div className="p-4">Round not found.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{round.title}</h1>
      <p className="mb-2 text-gray-600">
        <strong>Type:</strong> {round.type}
      </p>
      {round.description && (
        <p className="mb-4 text-gray-700">{round.description}</p>
      )}
      {round.instruction && (
        <div className="mb-4 p-3 border border-gray-200 rounded bg-gray-50">
          <strong>Instructions:</strong>
          <p>{round.instruction}</p>
          {/* <p>{round.uploads}</p> */}
          {/* ✅ Show uploaded files */}
          <div className="flex ">

            {round.uploads && round.uploads.length > 0 && (
              <div className="flex gap-2 space-y-3 justify-around ">
                {round.uploads.map((u, idx) => (
                  <div key={idx} className="border border-gray-300 rounded p-2 bg-white">
                    {u.type === "image" ? (
                      <img
                        src={u.url}
                        alt="instruction upload"
                        className="max-w-xs rounded h-[300px]"
                       
                      />
                    ) : (
                      <audio controls className="outline-none">
                        <source src={u.url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ Fields section - only show if NOT instruction type */}
      {round.type !== "instruction" && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Fields</h2>
          {round.fields && round.fields.length > 0 ? (
            <ul className="space-y-3">
              {round.fields.map((field) => (
                <li
                  key={field._id}
                  className="p-3 rounded bg-white shadow-sm"
                >
                  <p className="font-medium mb-2">{field.question}</p>

                  {/* 🔹 Conditional rendering based on field type */}
                  {field.subType === "shortText" || field.subType === "longText" ? (
                    <textarea
                      className="w-full border border-gray-200 rounded p-2 text-sm focus:outline-none"
                      placeholder="Enter your answer"
                      rows={field.subType === "longText" ? 4 : 2}
                    />
                  ) : field.subType === "multipleChoice" ? (
                    <div className="space-y-2">
                      {Array.isArray((field as any).options) &&
                        (field as any).options.map((opt: string, idx: number) => (
                          <label key={idx} className="flex items-center gap-2">
                            <input type="radio" name={field._id} value={opt} />
                            {opt}
                          </label>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Unsupported field type</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No fields added yet.</p>
          )}

          <div className="flex justify-start gap-3 mx-3">

            <button
              onClick={() =>
                router.push(
                  `/admin/processes/${processId}/rounds/${roundId}/field/create`
                )
              }
              className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-full hover:bg-blue-800"
            >
              + Add Field
            </button>


            <button
              onClick={() =>
                router.push(
                  `/admin/processes/${processId}/rounds/${roundId}/field`
                )
              }
              className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-full hover:bg-blue-800"
            >
              + Edit Field
            </button>
          </div>
          {/* ➕ Add field button */}

        </div>
      )}


      <div className="flex gap-4 mt-8">
        <button
          onClick={() =>
            router.push(`/admin/processes/${processId}/rounds/${roundId}/edit`)
          }
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Edit Round
        </button>
        <button
          onClick={() => router.push(`/admin/processes/${processId}`)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Back to Process
        </button>
      </div>
    </div>
  );
}
