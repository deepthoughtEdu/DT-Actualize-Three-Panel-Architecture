// src/app/candidate/processes/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Open_Sans } from "next/font/google";
import axios from "axios";

const openSans = Open_Sans({ subsets: ["latin"] });

interface Field {
  questionText: string;
  answer: string;
  fieldType: string;
}

interface Round {
  roundId: string;
  roundName: string;
  roundStatus: string;
  fields: Field[];
}

export default function RoundSummaryPage() {
  const { id } = useParams<{ id: string }>(); // Accessing roundId from URL
  const [roundData, setRoundData] = useState<Round[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching the data
    async function fetchRoundData() {
      try {
        const res = await axios({
          url: `/api/admin/process/applications/application/${id}`,
          method: 'GET',
          headers: {
            'Content-Type': "application/json",
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (res.status != 200) throw new Error("Failed to fetch round data");
        setRoundData(res.data); // Assuming response contains a single round object
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchRoundData();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!roundData) return <div className="p-6">Round not found.</div>;

  console.log(roundData);
  return (
    <div className={`${openSans.className} p-6 max-w-4xl mx-auto`}>
      {roundData.map((round) => {
        return <div key={round.roundId}>
          <h1 className="mt-5 text-2xl font-semibold text-slate-900">{round.roundName}</h1>
          <p className="mt-2 text-sm text-slate-600">Status: {round.roundStatus}</p>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {round.fields.map((field, idx) => (
              <div key={idx} className="mb-4">
                <p className="font-medium text-slate-800">{field.questionText}</p>
                <div className="mt-1 text-slate-600">
                  {field.answer ? (
                    field.fieldType === "fileUpload" ? (
                      <button
                        className="p-[7px] my-1 rounded-md px-4 text-white bg-blue-600"
                        onClick={() => window.open(field.answer, "_blank")}
                      >
                        View Uploaded
                      </button>
                    ) : (
                      <div>{field.answer}</div>
                    )
                  ) : (
                    "N/A"
                  )}

                </div>
              </div>
            ))}
          </div>
        </div>
      })}
    </div>
  );
}
