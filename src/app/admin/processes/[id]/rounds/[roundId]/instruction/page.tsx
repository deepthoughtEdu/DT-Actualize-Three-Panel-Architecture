// src/app/admin/processes/[id]/rounds/[roundId]/instruction/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TiptapEditor from "@/components/tiptap/TiptapEditor";
import { Open_Sans } from "next/font/google";
import Image from "next/image";

const openSans = Open_Sans({ subsets: ["latin"] });

type UploadType = "image" | "audio";
interface UploadItem {
  url: string;
  type: UploadType;
}

export default function InstructionPage() {
  const params = useParams<{ id: string; roundId: string }>();
  const id = useMemo(() => String(params?.id ?? ""), [params]);
  const roundId = useMemo(() => String(params?.roundId ?? ""), [params]);
  const router = useRouter();

  const [instruction, setInstruction] = useState<string>("");
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    async function fetchInstruction() {
      setErrorMsg(null);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch(`/api/admin/process/${id}/round/${roundId}/instruction`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        if (!res.ok) throw new Error("Failed to load instruction");
        const data = await res.json();
        setInstruction(data.instruction ?? "");
        setUploads(data.uploads ?? []);
        console.log(data.uploads);
        
      } catch (e: any) {
        setErrorMsg(e?.message || "Failed to load instruction");
      } finally {
        setLoading(false);
      }
    }
    if (id && roundId) fetchInstruction();
  }, [id, roundId]);

  async function handleSave() {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSaving(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("You are not logged in.");

      const res = await fetch(`/api/admin/process/${id}/round/${roundId}/instruction`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ instruction, uploads }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save instruction");
      }
      setSuccessMsg("Instruction saved successfully.");
      // optional: router.push(`/admin/processes/${id}/rounds`);
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to save instruction");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete the instruction content and uploads for this round?")) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setSaving(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("You are not logged in.");
      const res = await fetch(`/api/admin/process/${id}/round/${roundId}/instruction`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to delete instruction");
      }
      setInstruction("");
      setUploads([]);
      setSuccessMsg("Instruction deleted.");
      router.push(`/admin/processes/${id}`);
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to delete instruction");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(file: File, type: UploadType) {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("You are not logged in.");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch(`/api/admin/process/${id}/round/${roundId}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Upload failed");
      }
      const data = await res.json();
      setUploads((prev) => [...prev, { url: data.url, type }]);
      setSuccessMsg("File uploaded.");
    } catch (e: any) {
      setErrorMsg(e?.message || "Upload failed");
    }
  }

async function removeUpload(url: string) {
  try {

    const apiUrl = `/api/admin/process/${id}/round/${roundId}/upload?url=${encodeURIComponent(url)}`;

    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to delete upload:", data.error);
      return;
    }

    console.log(data.message);

    // If successful, remove from local state
    setUploads((prev) => prev.filter((u) => u.url !== url));

  } catch (error) {
    console.error("Error deleting upload:", error);
  }
}
  // Recording
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([audioBlob], "recording.webm", { type: "audio/webm" });
        await handleUpload(file, "audio");
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setErrorMsg("Microphone access denied.");
    }
  }
  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  if (loading) {
    return (
      <div className={`${openSans.className} mx-auto max-w-4xl p-6`}>
        <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-28 w-full animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-64 w-full animate-pulse rounded bg-slate-200" />
      </div>
    );
  }

  return (
    <div className={`${openSans.className} mx-auto max-w-[54vw] p-4 md:p-8`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Manage Instruction</h1>
          <p className="text-sm text-slate-600">Add guidance, images, or audio for this round.</p>
        </div>
        {isRecording && (
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-rose-600" /> Recording…
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMsg}
        </div>
      )}

      {/* Editor card */}
      <div className="rounded-xl w-fit border border-slate-200 bg-white p-4 shadow-sm">
        <TiptapEditor editable={true} content={instruction} onContentUpdate={setInstruction} />
      </div>

      {/* Uploads card */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-800">Attachments</h2>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && handleUpload(e.target.files[0], "image")}
              />
              Upload Image
            </label>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => e.target.files && handleUpload(e.target.files[0], "audio")}
              />
              Upload Audio
            </label>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white ${
                isRecording ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </button>
          </div>
        </div>

        {/* Previews */}
        {uploads.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {uploads.map((u, i) => (
              <div key={`${u.url}-${i}`} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {u.type === "image" ? (
                  <Image src={u.url} alt="upload" className="h-64 w-full bg-white object-contain" />
                ) : (
                  <div className="p-3">
                    <audio controls className="w-full">
                      <source src={u.url} type="audio/webm" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
                <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-3 py-2">
                  <a href={u.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                    Open
                  </a>
                  <button
                    type="button"
                    onClick={() => removeUpload(u.url)}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No attachments yet.</p>
        )}
      </div>

      {/* Footer actions */}
      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          onClick={() => router.push(`/admin/processes/${id}`)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                <path fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4A4 4 0 0 0 8 12H4z" />
              </svg>
              Saving…
            </>
          ) : (
            "Save"
          )}
        </button>
        {(instruction || uploads.length > 0) && (
          <button
            onClick={handleDelete}
            disabled={saving}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
