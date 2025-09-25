"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Clock, Play, Trophy, Users, Code } from "lucide-react";

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

const RecruitmentScreen = () => {
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
        const res = await fetch(`/api/candidate/processes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch process");
        const data = await res.json();
        setProcess(data);

        const appRes = await fetch(`/api/candidate/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (appRes.ok) {
          const apps: ApplicationWithProcess[] = await appRes.json();
          const app = apps.find((a) => a.process._id === id);
          if (app) {
            setApplication(app);
          }
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

      // Refetch application
      const appRes = await fetch(`/api/candidate/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (appRes.ok) {
        const apps: ApplicationWithProcess[] = await appRes.json();
        const app = apps.find((a) => a.process._id === id);
        // if (app) {
        //   setApplication(app);
        //   if (app.status === "in-progress") {
        //     const firstRound = process?.rounds.sort((a, b) => a.order - b.order)[0];
        //     if (firstRound) {
        //       router.push(`/candidate/processes/${id}/round/${firstRound._id}`);
        //     }
        //   }

        // }
        if (app) {
          setApplication(app);

          // 🔹 Redirect always, regardless of status
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

  const handleCompleteRound = async (roundId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/candidate/applications/${application?._id}/round/${roundId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to submit round");

      // Refetch application
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
      alert("Failed to submit round. Try again.");
    }
  };

  const handleContinue = () => {
    if (!process || !application) return;
    if (application.currentRoundIndex !== null) {
      const round = process.rounds.sort((a, b) => a.order - b.order)[application.currentRoundIndex];
      if (round) {
        router.push(`/candidate/processes/${id}/round/${round._id}`);
      }
    }
  };

  const sortedRounds = process?.rounds.sort((a, b) => a.order - b.order) || [];

  const rounds = sortedRounds.map((round, index) => {
    const progress = application?.rounds.find((r) => r.roundId === round._id);
    let status: "completed" | "current" | "pending" = "pending";

    if (progress?.status === "submitted") status = "completed";
    else if (application?.currentRoundIndex === index) status = "current";
    else status = "pending";

    return {
      id: index + 1,
      title: round.title,
      description: round.description,
      status,
      roundId: round._id,
    };
  });

  const allRoundsCompleted = application?.status === "completed";
  const hasApplied = !!application;

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "current":
        return <Play className="w-5 h-5 text-blue-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "current":
        return "In Progress";
      case "pending":
        return "Pending";
      default:
        return "";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-600 border-green-200";
      case "current":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "pending":
        return "bg-gray-100 text-gray-400 border-gray-200";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Code className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-blue-800">{process.title}</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{process.description}</p>
        </motion.div>

        {/* Process Completed */}
        {allRoundsCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-green-100 rounded-xl p-6 mb-8 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-10 h-10 text-green-600" />
              <h2 className="text-2xl font-bold text-green-700">Process Completed!</h2>
            </div>
            <p className="text-green-600">Congratulations! You{"'"}ve successfully completed all rounds.</p>
          </motion.div>
        )}

        {/* Rounds Overview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-blue-800">Rounds Overview</h2>
          </div>
          <div className="grid gap-6">
            {rounds.map((round) => (
              <motion.div
                key={round.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className={`p-5 hover:shadow-lg transition-shadow ${round.status === "current" ? "ring-2 ring-blue-200" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Round {round.id}: {round.title}
                      </h3>
                      <p className="text-gray-500 text-sm">{round.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={` flex gap-3 px-5 py-1 rounded-full text-sm font-medium border ${getStatusStyle(round.status)}`}>
                        {getStatusIcon(round.status)}
                        {getStatusText(round.status)}
                      </div>
                      {round.status === "current" && hasApplied && (
                        <Button variant="outline" size="sm" onClick={() => handleCompleteRound(round.roundId)}>
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        {!hasApplied && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Button variant="continue" size="lg" onClick={handleApply} disabled={applying}>
              {applying ? "Applying..." : "Apply Now"}
            </Button>
          </motion.div>
        )}
        {((hasApplied && application?.status === "applied")||(hasApplied &&application?.status === "in-progress")) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Button variant="secondary" size="lg" onClick={handleContinue}>
              Continue Application
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RecruitmentScreen;
