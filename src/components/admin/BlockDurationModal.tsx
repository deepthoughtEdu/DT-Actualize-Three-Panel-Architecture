"use client";

import { useState } from "react";
import { Ban, X, Clock } from "lucide-react";

interface BlockDurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (durationHours: number) => void;
  candidateName: string;
  loading?: boolean;
}

export default function BlockDurationModal({
  isOpen,
  onClose,
  onConfirm,
  candidateName,
  loading = false,
}: BlockDurationModalProps) {
  const [blockDuration, setBlockDuration] = useState(24); // default 24 hours
  const [customHours, setCustomHours] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    const duration =
      blockDuration === 0 ? parseInt(customHours) : blockDuration;

    if (!duration || duration <= 0) {
      alert("Please enter a valid duration");
      return;
    }

    if (duration > 720) {
      alert("Maximum block duration is 720 hours (30 days)");
      return;
    }

    onConfirm(duration);
  };

  const selectedDuration =
    blockDuration === 0 ? parseInt(customHours || "0") : blockDuration;
  const blockExpiryDate = new Date(
    Date.now() + selectedDuration * 60 * 60 * 1000
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Ban className="w-2 h-5 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Block Candidate</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Candidate Info */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Ban className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-orange-900 font-semibold">
                  {candidateName}
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Reason: Missed self-defined timeline deadline
                </p>
              </div>
            </div>
          </div>

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Block Duration
            </label>
            <div>
              {/* 12 Hours */}
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                <input
                  type="radio"
                  name="duration"
                  value="12"
                  checked={blockDuration === 12}
                  onChange={() => setBlockDuration(12)}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                  disabled={loading}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">12 Hours</span>
                  <p className="text-xs text-gray-500">Half-day block</p>
                </div>
              </label>

              {/* 24 Hours */}
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                <input
                  type="radio"
                  name="duration"
                  value="24"
                  checked={blockDuration === 24}
                  onChange={() => setBlockDuration(24)}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                  disabled={loading}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">24 Hours</span>
                  <p className="text-xs text-gray-500">Recommended (1 Day)</p>
                </div>
              </label>

              {/* 48 Hours */}
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                <input
                  type="radio"
                  name="duration"
                  value="48"
                  checked={blockDuration === 48}
                  onChange={() => setBlockDuration(48)}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                  disabled={loading}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">48 Hours</span>
                  <p className="text-xs text-gray-500">2 Days</p>
                </div>
              </label>

              {/* Custom */}
              <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                <input
                  type="radio"
                  name="duration"
                  value="0"
                  checked={blockDuration === 0}
                  onChange={() => setBlockDuration(0)}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500 mt-1"
                  disabled={loading}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium block mb-2">
                    Custom Duration
                  </span>
                  <input
                    type="number"
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value)}
                    placeholder="Enter hours (1-720)"
                    min="1"
                    max="720"
                    disabled={blockDuration !== 0 || loading}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum: 720 hours (30 days)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Preview */}
          {selectedDuration > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-700 mb-1">
                    Block Expiry Date
                  </p>
                  <p className="text-sm font-mono text-gray-900">
                    {blockExpiryDate.toLocaleString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Duration:{" "}
                    {selectedDuration >= 24
                      ? `${Math.floor(selectedDuration / 24)} day(s) ${
                          selectedDuration % 24
                        }h`
                      : `${selectedDuration} hour(s)`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || selectedDuration <= 0}
            className="px-6 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Blocking...
              </>
            ) : (
              <>
                <Ban className="w-4 h-4" />
                Block Candidate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
