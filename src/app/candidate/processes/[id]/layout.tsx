"use client";

import React, { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, ArrowLeft, Lock, CircleCheck } from "lucide-react";
import TimerModal from "@/components/candidate/TimeModal";
import { IsLockedProvider, WhatsAppGroupProvider } from "./Context";

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
  const [completedRounds, setCompletedRounds] = useState<
    { roundId: string; status: string }[]
  >([]);
  // Per-round timeline map
  const [roundTimelines, setRoundTimelines] = useState<
    Record<string, string | null>
  >({});
  const [timeline, setTimeline] = useState<string | null>(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [whatsAppGroupLink, setWhatsAppGroupLink] = useState<string | null>(
    null
  );
  const [isWhatsAppGroupUnlocked, setIsWhatsAppGroupUnlocked] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchRoundsAndTimeline = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch process and rounds
        const resProcess = await fetch(`/api/candidate/processes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const process = await resProcess.json();
        setRounds(process.rounds.sort((a: any, b: any) => a.order - b.order));

        // Fetch applications for candidate
        const resApps = await fetch(`/api/candidate/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const apps = await resApps.json();
        const currentApp = apps.find((a: any) => a.process._id === id);

        if (currentApp) {
          const completed = currentApp.rounds
            .filter(
              (r: any) =>
                r.status === "submitted" ||
                r.status === "in-progress" ||
                r.completed
            )
            .map((r: any) => ({ roundId: r.roundId, status: r.status }));
          setCompletedRounds(completed);

          // Build timeline map
          const timelinesMap: Record<string, string | null> = {};
          currentApp.rounds.forEach((r: any) => {
            timelinesMap[r.roundId] = r.timeline || null;
          });
          setRoundTimelines(timelinesMap);

          // Set timeline of current round if available
          setTimeline(timelinesMap[roundId] || null);

          // WhatsApp Group Link fetch only if all rounds completed
          if (
            currentApp.rounds.length === process.rounds.length &&
            currentApp.rounds.every(
              (r: any) => r.status === "submitted" || r.status === "completed"
            )
          ) {
            const resGroupLink = await fetch(
              `/api/candidate/applications/${currentApp._id}/whatsapp-link`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (resGroupLink.ok) {
              const data = await resGroupLink.json();
              setWhatsAppGroupLink(data.groupLink || null);
              setIsWhatsAppGroupUnlocked(true);
            } else {
              setWhatsAppGroupLink(null);
              setIsWhatsAppGroupUnlocked(false);
            }
          } else {
            setWhatsAppGroupLink(null);
            setIsWhatsAppGroupUnlocked(false);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoundsAndTimeline();
  }, [id, roundId, pathname]);

  // Show timeline modal if timeline for current round is empty
  useEffect(() => {
    if (!loading && rounds.length && !timeline) {
      setShowTimelineModal(true);
    } else {
      setShowTimelineModal(false);
    }
  }, [loading, rounds, roundId, timeline, id]);

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
    if (latestUnlockedRound) router.push(`/candidate/processes`);
  };

  // Save timeline for specific round and update state map
  const saveTimeline = async (data: string) => {
    const token = localStorage.getItem("token");
    await fetch(`/api/candidate/applications/${id}/round/${roundId}/timeline`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ timeline: data }),
    });

    setRoundTimelines((prev) => ({
      ...prev,
      [roundId]: data,
    }));
    setTimeline(data);
    setShowTimelineModal(false);
  };

  const currentRoundStatus = completedRounds.find(
    (r) => r.roundId === roundId
  )?.status;

  const currentIndex = rounds.findIndex((r) => r._id === roundId);
  const unlockedUpTo = Math.max(completedRounds.length - 1, currentIndex);

  const totalRounds = rounds.length;
  const completedRoundsCount = completedRounds.filter(
    (r) => r.status === "submitted"
  ).length;

  const isLocked =
    currentIndex < unlockedUpTo || currentRoundStatus === "submitted";

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
            <div className="text-md font-bold text-green-700 transition mr-1">
              {completedRoundsCount} / {totalRounds}
            </div>
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
                      className={`cursor-pointer w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition ${
                        isActive
                          ? "bg-blue-100 text-blue-800"
                          : "hover:bg-blue-50 text-gray-700"
                      }`}
                    >
                      <span>{round.title}</span>
                      <span>
                        {isCompleted && (
                          <CircleCheck className="w-4 h-4 text-green-600" />
                        )}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowLockedModal(true)}
                      className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed"
                    >
                      <span>{round.title}</span>
                      <span>
                        <Lock className="w-4 h-4" />
                      </span>
                    </button>
                  )}
                </motion.div>
              );
            })}

            <div className="mt-3 border-t pt-3">
              {isWhatsAppGroupUnlocked && whatsAppGroupLink ? (
                <Link
                  href={whatsAppGroupLink}
                  className={`flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition ${
                    pathname.includes("whatsapp-group")
                      ? "bg-green-100 text-green-700"
                      : "hover:bg-green-50 text-gray-700"
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>WhatsApp Group</span>
                  <MessageCircle className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={() => setShowLockedModal(true)}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed"
                >
                  <span>WhatsApp Group</span>
                  <Lock className="w-4 h-4" />
                </button>
              )}
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
          <WhatsAppGroupProvider
            isUnlocked={isWhatsAppGroupUnlocked}
            groupLink={whatsAppGroupLink}
          >
            {children}
          </WhatsAppGroupProvider>
        </IsLockedProvider>
      </main>

      {/* Locked Round Modal */}
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

      {/* Timeline Modal */}
      {showTimelineModal && (
        <TimerModal isOpen={showTimelineModal} onTimelineSet={saveTimeline} />
      )}
    </div>
  );
}
