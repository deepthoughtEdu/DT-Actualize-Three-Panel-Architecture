"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Round {
  _id: string;
  title: string;
  description: string;
  order: number;
}

interface Process {
  _id: string;
  title: string;
  description: string;
  rounds: Round[];
  createdAt: string;
}

interface RoundProgress {
  roundId: string;
  status: "pending" | "in-progress" | "submitted";
}

interface ApplicationWithProcess {
  _id: string;
  status: "applied" | "in-progress" | "completed";
  currentRoundIndex: number | null;
  rounds: RoundProgress[];
  process: {
    _id: string;
    title: string;
    description: string;
  };
}

export default function ProcessDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [process, setProcess] = useState<Process | null>(null);
  const [application, setApplication] = useState<ApplicationWithProcess | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchProcessAndApp = async () => {
      try {
        // 1️⃣ Fetch process details
        const res = await fetch(`/api/candidate/processes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch process");
        const data = await res.json();
        setProcess(data);

        // 2️⃣ Fetch candidate applications for this process
        const appRes = await fetch(`/api/candidate/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (appRes.ok) {
          const apps: ApplicationWithProcess[] = await appRes.json();
          const app = apps.find((a) => a.process._id === id);
          if (app) setApplication(app);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProcessAndApp();
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/candidate/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ processId: id }),
      });

      if (!res.ok) throw new Error("Failed to apply");
      await res.json();

      // ✅ Refetch application after applying
      const appRes = await fetch(`/api/candidate/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (appRes.ok) {
        const apps: ApplicationWithProcess[] = await appRes.json();
        const app = apps.find((a) => a.process._id === id);
        if (app) setApplication(app);

        // ✅ If status is still 'applied', don't auto-redirect
        if (app && app.status === "in-progress") {
          const firstRound = process?.rounds.sort((a, b) => a.order - b.order)[0];
          if (firstRound) {
            router.push(`/candidate/processes/${id}/round/${firstRound._id}`);
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to apply. Try again.");
    } finally {
      setApplying(false);
    }
  };

  const handleContinue = () => {
    if (!process || !application) return;

    if (application.currentRoundIndex !== null) {
      const round = process.rounds.sort((a, b) => a.order - b.order)[
        application.currentRoundIndex
      ];
      if (round) {
        router.push(`/candidate/processes/${id}/round/${round._id}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Loading process...</p>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">Process not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="mb-4 text-3xl font-bold text-gray-800">{process.title}</h1>
      <p className="mb-6 text-gray-700">{process.description}</p>

      <h2 className="mb-3 text-xl font-semibold text-gray-800">
        Rounds Overview
      </h2>
      <ul className="mb-6 space-y-3">
        {process.rounds
          .sort((a, b) => a.order - b.order)
          .map((round) => {
            const roundStatus = application?.rounds.find(
              (r) => r.roundId === round._id
            )?.status;

            return (
              <li
                key={round._id}
                className="rounded-xl bg-white p-4 shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    Round {round.order}: {round.title}
                  </p>
                  <p className="text-sm text-gray-600">{round.description}</p>
                </div>
                {roundStatus === "submitted" && (
                  <span className="text-green-600 font-medium">Submitted</span>
                )}
              </li>
            );
          })}
      </ul>

      {/* ✅ Conditional actions */}
      {!application ? (
        <button
          onClick={handleApply}
          disabled={applying}
          className="rounded-xl bg-blue-600 px-6 py-3 text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
        >
          {applying ? "Applying..." : "Apply Now"}
        </button>
      ) 
       : application.status === "applied" ? (
        <button
          onClick={handleContinue}
          className="rounded-xl bg-yellow-500 px-6 py-3 text-white shadow-md transition hover:bg-yellow-600"
        >
          Continue Application
        </button>
      ) : application.status === "completed" ? (
        <p className="text-green-600 font-semibold">✅ Process Completed</p>
      ) : null}

    </div>
  );
}
