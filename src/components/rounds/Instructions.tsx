"use client";

import { motion } from "framer-motion";
import TiptapEditor from "@/components/tiptap/TiptapEditor";

interface Upload {
  url: string;
  type: "image" | "audio";
}

interface InstructionRoundProps {
  instruction?: string;
  uploads?: Upload[];
}

export default function Instructions({
  instruction,
}: InstructionRoundProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full bg-white rounded-2xl shadow-lg p-8"
    >
      {instruction && (
        <div className="mb-6">
          <TiptapEditor editable={false} content={instruction} />
        </div>
      )}
    </motion.div>
  );
}
