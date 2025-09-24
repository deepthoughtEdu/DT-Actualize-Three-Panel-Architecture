"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ApplicationCard, ApplicationData } from "@/components/candidate/ApplicationCard";
import { DashboardHeader } from "@/components/candidate/DashboardHeader";
import { BrowseSection } from "@/components/candidate/BrowseSection";

interface RoundProgress {
  roundId: string;
  status: "pending" | "in-progress" | "submitted";
}

interface Application {
  _id: string;
  process: {
    _id: string;
    title: string;
    description: string;
  };
  status: "applied" | "in-progress" | "completed";
  currentRoundIndex: number | null;
  rounds: RoundProgress[];
}

export default function CandidateDashboard() {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/candidate/applications", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch applications");
        const data: Application[] = await res.json();

        // 🔄 Map backend data → UI data
        const mapped: ApplicationData[] = data.map((app) => {
          return {
            id: app._id,
            jobTitle: app.process.title,
            role: app.process.description,
            status: app.status,
            rounds: app.rounds.map((round, idx) => {
              let roundStatus: ApplicationData["rounds"][number]["status"];

              if (round.status === "submitted") {
                roundStatus = "submitted";
              } else if (round.status === "in-progress") {
                // If this is the current round, mark it as "continue"
                roundStatus =
                  app.currentRoundIndex !== null &&
                  app.currentRoundIndex === idx
                    ? "continue"
                    : "in-progress";
              } else if (round.status === "pending") {
                roundStatus = "pending";
              } else {
                // fallback (shouldn't normally hit)
                roundStatus = "pending";
              }

              return {
                name: `Round ${idx + 1}`,
                status: roundStatus,
                roundId: round.roundId,
                processId: app.process._id,
              };
            }),
          };
        });

        setApplications(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-2xl font-semibold text-gray-800">
          No Applications Found
        </h2>
        <p className="text-gray-600 mb-6">
          You haven’t applied to any process yet. Explore opportunities!
        </p>
        <BrowseSection applications={applications} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Applications Grid */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {applications.map((application, index) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ApplicationCard application={application} />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BrowseSection applications={applications} />
          </div>
        </div>
      </main>
    </div>
  );
}
