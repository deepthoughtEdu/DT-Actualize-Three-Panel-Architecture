"use client";

import { useWhatsAppGroup } from "../Context";
import { MessageCircle, Lock } from "lucide-react";

export default function WhatsAppGroupCard() {
  const { isUnlocked, groupLink } = useWhatsAppGroup();

  const handleJoinGroup = () => {
    if (isUnlocked && groupLink) {
      window.open(groupLink, "_blank");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-green-100 rounded-full">
          <MessageCircle className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          Join Our WhatsApp Community
        </h3>
      </div>

      {isUnlocked ? (
        <>
          <p className="text-gray-600 mb-4">
            Congratulations for completing all{" "}
            <b>3 rounds of our recruitment process</b> we hope that you enjoyed
            our process. We are thrilled to invite you to our virtual tour.
            Please join below whatsapp group for further steps.
          </p>
          <button
            onClick={handleJoinGroup}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Join WhatsApp Group
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-600 mb-4">
            Complete all rounds to unlock access to our exclusive community.
          </p>
          <div className="bg-gray-100 border-2 border-gray-200 rounded-lg p-4 flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-400" />
            <span className="text-gray-500 font-medium">Group Locked</span>
          </div>
        </>
      )}
    </div>
  );
}
