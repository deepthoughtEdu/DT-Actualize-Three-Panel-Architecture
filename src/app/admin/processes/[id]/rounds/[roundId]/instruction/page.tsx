"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import TiptapEditor from "@/components/tiptap/TiptapEditor";

export default function InstructionPage() {
  const { id, roundId } = useParams();
  const router = useRouter();
  const [instruction, setInstruction] = useState<string>("");
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🎙️ Recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    async function fetchInstruction() {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `/api/admin/process/${id}/round/${roundId}/instruction`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setInstruction(data.instruction ?? "");
        setUploads(data.uploads ?? []); // fetch stored uploads
      }
      setLoading(false);
    }

    if (id && roundId) fetchInstruction();
  }, [id, roundId]);

  if (loading) return <p className="p-6">Loading instruction...</p>;

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `/api/admin/process/${id}/round/${roundId}/instruction`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ instruction, uploads }),
      }
    );

    if (res.ok) {
      alert("Instruction saved!");
      router.push(`/admin/processes/${id}/rounds`);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `/api/admin/process/${id}/round/${roundId}/instruction`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      alert("Instruction deleted!");
      router.push(`/admin/processes/${id}/rounds/${roundId}`);
      setInstruction("");
      setUploads([]);
    }
  };

  const handleUpload = async (
    file: File,
    type: "image" | "audio"
  ) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const res = await fetch(
      `/api/admin/process/${id}/round/${roundId}/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (res.ok) {
      const data = await res.json();
      setUploads((prev) => [...prev, { url: data.url, type }]);
    }
  };

  // 🎙️ Start Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const file = new File([audioBlob], "recording.webm", {
          type: "audio/webm",
        });

        await handleUpload(file, "audio");
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      alert("Microphone access denied!");
    }
  };

  // 🎙️ Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Instruction</h1>

      {/* <textarea
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder="Enter instruction here..."
        className="w-full border p-3 rounded mb-4"
        rows={5}
      /> */}

       <TiptapEditor
          editable={true}
          content={instruction}
          onContentUpdate={setInstruction}
        />

      {/* Upload Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Upload Files</h2>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            e.target.files && handleUpload(e.target.files[0], "image")
          }
          className="mb-2"
        />
        <input
          type="file"
          accept="audio/*"
          onChange={(e) =>
            e.target.files && handleUpload(e.target.files[0], "audio")
          }
        />

        {/* 🎙️ Record Audio Section */}
        <div className="mt-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-4 py-2 rounded text-white ${
              isRecording ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {uploads.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Uploaded Files</h3>
          <div className="grid gap-4">
            {uploads.map((u, i) => (
              <div key={i} className="border p-2 rounded">
                {u.type === "image" ? (
                  <img src={u.url} alt="upload" className="w-40" />
                ) : (
                  <audio controls>
                    <source src={u.url} type="audio/webm" />
                  </audio>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save
        </button>
        {(instruction || uploads.length > 0) && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
