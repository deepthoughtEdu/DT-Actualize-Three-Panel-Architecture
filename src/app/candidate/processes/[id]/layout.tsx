"use client";

import React, { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileCheck2, ArrowLeft, Lock, CircleCheck } from "lucide-react";
import TimerModal from "@/components/candidate/TimeModal";
import { IsLockedProvider, CertificateUnlockedProvider } from "./Context";

interface Round {
  _id: string;
  order: number;
  title: string;
  type: "form" | "instruction";
}

export default function RoundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id, roundId } = useParams<{ id: string; roundId: string }>();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [completedRounds, setCompletedRounds] = useState<{ roundId: string; status: string }[]>([]);
  const [timeline, setTimeline] = useState<any>(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPercentage, setShowPercentage] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // ✅ Fetch process and sort rounds
        const res = await fetch(`/api/candidate/processes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const process = await res.json();
        const sortedRounds = [...process.rounds].sort(
          (a: Round, b: Round) => a.order - b.order
        );
        setRounds(sortedRounds);

        // ✅ Fetch completed round + timeline data
        const appRes = await fetch(`/api/candidate/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const apps = await appRes.json();
        const currentApp = apps.find((a: any) => a.process._id === id);

        if (currentApp) {
          const completed = currentApp.rounds
            .filter((r: any) => r.status === "submitted" || r.status === "in-progress" || r.completed)
            .map((r: any) => ({ roundId: r.roundId, status: r.status }));
          setCompletedRounds(completed);


          if (currentApp.timeline) setTimeline(currentApp.timeline);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRounds();
  }, [pathname]);

  useEffect(() => {
    if (!loading && rounds.length && roundId === rounds[0]._id && !timeline && !localStorage.getItem('selfDefinedTimeline')) {
      setShowTimelineModal(true);
    } else {
      setTimeline(localStorage.getItem('selfDefinedTimeline'))
    }
  }, [loading, rounds, roundId]);

  const handleRoundClick = (index: number, _id: string) => {
    if (index > unlockedUpTo) {
      setShowLockedModal(true);
      return;
    }
    router.push(`/candidate/processes/${id}/round/${_id}`);
  };

  const handleBackToProcess = () => {
    const latestUnlockedIndex = Math.min(unlockedUpTo, rounds.length - 1);
    const latestUnlockedRound = rounds[latestUnlockedIndex];
    if (latestUnlockedRound)
      router.push(`/candidate/processes/${id}/round/${latestUnlockedRound._id}`);
  };

  const saveTimeline = async (data: string) => {
    const token = localStorage.getItem("token");
    await fetch(`/api/candidate/applications/${id}/timeline`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ timeline: data }),
    });
    localStorage.setItem('selfDefinedTimeline', data);
    setTimeline(data);
    setShowTimelineModal(false);
  };


  // Find the current round status
  const currentRoundStatus = completedRounds.find(
    (r) => r.roundId === roundId
  )?.status;
  console.log(currentRoundStatus);

  // ✅ Determine visible rounds (can’t see next rounds)
  const currentIndex = rounds.findIndex((r) => r._id === roundId);
  const unlockedUpTo = Math.max(completedRounds.length - 1, currentIndex);

  let isCertificateUnlocked = false;
  if (completedRounds.length === rounds.length) {
    // find the last round in sorted order
    const lastRound = rounds[rounds.length - 1];
    const lastRoundStatus = completedRounds.find(
      (r) => r.roundId === lastRound._id
    )?.status;
    isCertificateUnlocked = lastRoundStatus === "submitted";
  }

  const totalRounds = rounds.length;
  const completedRoundsCount = completedRounds.filter(
    (r) => r.status === "submitted"
  ).length;

  const completionPercentage = totalRounds > 0 ? Math.round((completedRoundsCount / totalRounds) * 100) : 0;


  // Determine if current round is locked
  const isLocked =
    currentIndex < unlockedUpTo ||
    currentRoundStatus === "submitted"

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading process...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gradient-to-b from-sky-100 to-blue-50">
      {/* Sidebar */}
      <aside className="w-[15vw] border-r bg-white/90 backdrop-blur-sm shadow-lg flex flex-col justify-between">
        <div className="p-4">
          {/* 🧭 Self-defined timeline at top */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-blue-800 mb-2">
              Self-Defined Timeline
            </h2>
            {timeline ? (
              <div className="bg-blue-100 text-blue-800 rounded-md text-md font-bold text-center py-2">
                {timeline}
              </div>
            ) : (
              <div className="bg-gray-50 text-gray-500 rounded-md text-sm font-medium text-center py-2">
                Not Set
              </div>
            )}
          </div>

          {/* 🧩 Round Progression */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-blue-800">Your Progress</h2>
            <button
              onClick={() => setShowPercentage((prev) => !prev)}
              className="text-md font-bold cursor-pointer text-green-700 transition mr-1"
            >
              {showPercentage
                ? `${completionPercentage}%`
                : `${completedRoundsCount} / ${totalRounds}`}
            </button>
          </div>


          <div className="h-[68vh] space-y-2 overflow-x-auto">
            {rounds.map((round, index) => {
              const isActive = round._id === roundId;
              const isCompleted = completedRounds.some(
                (r) => r.roundId === round._id && r.status === "submitted"
              );

              return (
                <motion.div
                  key={round._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {index <= unlockedUpTo ? (
                    <button
                      onClick={() => handleRoundClick(index, round._id)}
                      className={`cursor-pointer w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition ${isActive
                        ? "bg-blue-100 text-blue-800"
                        : "hover:bg-blue-50 text-gray-700"
                        }`}
                    >
                      <span>{round.title}</span>
                      <span>{isCompleted && <CircleCheck className="w-4 h-4 text-green-600" />}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowLockedModal(true)}
                      className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed"
                    >
                      <span>{round.title}</span>
                      <span><Lock className="w-4 h-4" /></span>
                    </button>
                  )}

                </motion.div>
              );
            })}

            {/* Certificate tab */}
            <div className="mt-3 border-t pt-3">
              <Link
                href={`/candidate/processes/${id}/certificate`}
                className={`flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition ${pathname.includes("certificate")
                  ? "bg-green-100 text-green-700"
                  : "hover:bg-green-50 text-gray-700"
                  }`}
              >
                <span>Certificate</span>
                <FileCheck2 className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Back to Process */}
        <div className="p-4 border-t">
          <button
            onClick={handleBackToProcess}
            className="w-full cursor-pointer flex items-center justify-center gap-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Process
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <IsLockedProvider value={isLocked}>
          <CertificateUnlockedProvider value={isCertificateUnlocked}>
            {children}
          </CertificateUnlockedProvider>
        </IsLockedProvider>
      </main>

      {/* 🔒 Locked Round Modal */}
      {showLockedModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[320px] text-center">
            <p className="text-gray-700 font-medium">
              Please complete previous rounds to unlock this round.
            </p>
            <button
              onClick={() => setShowLockedModal(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* 🧭 Timeline Modal */}
      {showTimelineModal && (
        <TimerModal isOpen={showTimelineModal} onTimelineSet={saveTimeline} />
      )}
    </div>
  );
}
