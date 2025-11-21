"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface OnboardingVideoProps {
  videoId: string; // YouTube video ID
  onComplete: () => void;
}

export function OnboardingVideo({ videoId, onComplete }: OnboardingVideoProps) {
  const [timeWatched, setTimeWatched] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const REQUIRED_WATCH_TIME = 120; // 2 minutes in seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeWatched((prev) => {
        const newTime = prev + 1;
        if (newTime >= REQUIRED_WATCH_TIME) {
          setCanSkip(true);
          clearInterval(interval);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    if (canSkip) {
      localStorage.setItem("hasSeenOnboarding", "true");
      onComplete();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const remainingTime = Math.max(0, REQUIRED_WATCH_TIME - timeWatched);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Welcome!</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Please go through this video before you start your process.
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={!canSkip}
                className={`p-2 rounded-lg transition-all ${
                  canSkip
                    ? "hover:bg-white/20 cursor-pointer"
                    : "opacity-40 cursor-not-allowed"
                }`}
                title={canSkip ? "Close" : "Please wait to skip"}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Video Container */}
          <div
            className="relative bg-black"
            style={{ paddingBottom: "56.25%" }}
          >
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=${
                canSkip ? 1 : 0
              }&modestbranding=1&rel=0&disablekb=${canSkip ? 0 : 1}`}
              title="Onboarding Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Progress Bar & Timer */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {canSkip
                  ? "You can now continue with your process"
                  : "Required watch time"}
              </span>
              <span className="text-sm font-bold text-blue-600">
                {canSkip ? "✓ Complete" : formatTime(remainingTime)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{
                  width: `${(timeWatched / REQUIRED_WATCH_TIME) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {!canSkip && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Please watch for {formatTime(remainingTime)} more to continue
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
