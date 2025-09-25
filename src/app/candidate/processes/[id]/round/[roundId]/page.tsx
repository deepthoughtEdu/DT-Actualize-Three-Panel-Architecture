"use client";


import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import TiptapEditor from "@/components/tiptap/TiptapEditor";


interface Field {
  _id: string;
  question: string;
  subType: "shortText" | "fileUpload" | "number";
}


interface Upload {
  url: string;
  type: "image" | "audio";
}


interface Round {
  _id: string;
  order: number;
  title: string;
  type: "form" | "instruction";
  fields?: Field[];
  instruction?: string;
  uploads?: Upload[];
}


export default function RoundSubmissionPage() {
  const { id, roundId } = useParams<{ id: string; roundId: string }>();
  const router = useRouter();


  const [rounds, setRounds] = useState<Round[]>([]);
  const [round, setRound] = useState<Round | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  console.log(saving);

  // ✅ Mark round in-progress
  useEffect(() => {
    const markInProgress = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;


      await fetch(`/api/candidate/applications/${id}/round/${roundId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: [] }),
      });
    };


    markInProgress();
  }, [id, roundId]);


  // ✅ Fetch process + application answers
  useEffect(() => {
    const fetchProcessAndAnswers = async () => {
      try {
        const token = localStorage.getItem("token");


        // fetch process
        const res = await fetch(`/api/candidate/processes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch process");
        const process = await res.json();


        const sortedRounds = [...process.rounds].sort(
          (a: Round, b: Round) => Number(a.order) - Number(b.order)
        );
        setRounds(sortedRounds);


        const selected = sortedRounds.find((r) => r._id === roundId);
        setRound(selected || null);


        // fetch application answers
        const appRes = await fetch(`/api/candidate/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (appRes.ok) {
          const apps = await appRes.json();
          const app = apps.find((a: any) => a.process._id === id);
          if (app) {
            const roundProgress = app.rounds.find(
              (r: any) => r.roundId === roundId
            );
            if (roundProgress && roundProgress.answers) {
              const prefilled: Record<string, string> = {};
              roundProgress.answers.forEach((ans: any) => {
                prefilled[ans.fieldId] = ans.answer;
              });
              setAnswers(prefilled);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };


    if (id && roundId) fetchProcessAndAnswers();
  }, [id, roundId]);


  // ✅ Autosave handler
  const handleChange = async (fieldId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));


    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await fetch(`/api/candidate/applications/${id}/round/${roundId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: [{ fieldId, answer: value }],
        }),
      });
    } catch (err) {
      console.error("Autosave failed:", err);
    } finally {
      setSaving(false);
    }
  };


  // ✅ Full round submit
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload =
        round?.type === "form"
          ? {
            answers: Object.entries(answers).map(([fieldId, answer]) => ({
              fieldId,
              answer,
            })),
          }
          : {};


      const res = await fetch(
        `/api/candidate/applications/${id}/round/${roundId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );


      if (!res.ok) throw new Error("Submission failed");


      const currentIndex = rounds.findIndex((r) => r._id === roundId);
      if (currentIndex !== -1 && currentIndex < rounds.length - 1) {
        const nextRoundId = rounds[currentIndex + 1]._id;
        router.push(`/candidate/processes/${id}/round/${nextRoundId}`);
      } else {
        router.push(`/candidate/dashboard`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Loading round...</p>
      </div>
    );
  }


  if (!round) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">Round not found</p>
      </div>
    );
  }


  const currentRoundIndex = rounds.findIndex((r) => r._id === roundId) + 1;


  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-500 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Progress tracker */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-4">
            <div
              className="bg-blue-600 h-2 transition-all"
              style={{
                width: `${(currentRoundIndex / rounds.length) * 100}%`,
              }}
            />
          </div>
          <p className="text-sm text-white font-medium">
            Round {currentRoundIndex} of {rounds.length}
          </p>
        </motion.div>


        {/* Main card */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center justify-center min-h-[calc(100vh-200px)]"
        >
          {/* ✅ Instruction Round */}
          {round.type === "instruction" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-fit  mx-auto bg-white rounded-xl shadow-lg p-8"
            >
              <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                {round.title}
              </h1>
              <p className="text-lg text-gray-600 text-center mb-6">
                Please review the following instructions before proceeding.
              </p>


              {round.instruction && (
                <div className="mb-6">
                  <TiptapEditor editable={false} content={round.instruction} />
                </div>
              )}


              {round.uploads && round.uploads.length > 0 && (
                <div className="space-y-4 mb-6">
                  {round.uploads.map((u, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-gray-200 p-3 bg-gray-50 shadow-sm"
                    >
                      {u.type === "image" && (
                        <img
                          src={u.url}
                          alt="Instruction upload"
                          className="max-w-sm rounded-lg h-[200px] mx-auto"
                        />
                      )}
                      {u.type === "audio" && (
                        <audio controls className="w-full mt-2">
                          <source src={u.url} type="audio/mp3" />
                          Your browser does not support the audio element.
                        </audio>
                      )}
                    </div>
                  ))}
                </div>
              )}


              <div className="flex justify-between gap-4 mt-8">
                <button
                  onClick={() => router.push("/candidate/dashboard")}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Dashboard
                </button>


                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md hover:scale-105 transition disabled:opacity-50"
                >
                  {submitting ? "Proceeding..." : "Proceed to Next Round"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}


          {/* ✅ Form Round */}
          {round.type === "form" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    {round.title}
                  </h1>
                  <p className="text-lg text-gray-600">
                    Please fill out the form below.
                  </p>
                </div>


                <div className="space-y-6 h-[510px] overflow-x">
                  {round.fields?.map((field, index) => (
                    <motion.div
                      key={field._id}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        delay: 0.3 + index * 0.1,
                        duration: 0.4,
                      }}
                      className="space-y-2"
                    >
                      <label
                        htmlFor={field._id}
                        className="text-sm font-medium text-gray-800"
                      >
                        {field.question}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      {field.subType === "fileUpload" ? (
                        <div className="space-y-2">
                          {!answers[field._id] ? (
                            <>
                              <input
                                type="file"
                                id={field._id}
                                required
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  const formData = new FormData();
                                  formData.append("file", file);
                                  formData.append("type", "file");

                                  try {
                                    setSaving(true);
                                    const token = localStorage.getItem("token");
                                    const res = await fetch("/api/admin/upload", {
                                      method: "POST",
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                      },
                                      body: formData,
                                    });

                                    if (!res.ok) throw new Error("Upload failed");
                                    const data = await res.json();

                                    // save the uploaded file URL as the answer
                                    handleChange(field._id, data.url);
                                  } catch (err) {
                                    console.error("File upload failed:", err);
                                  }
                                  setSaving(false);;
                                }}
                                className="w-full border rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </>
                          ) : (
                            <div className="flex items-center justify-between border p-3 rounded-lg">
                              <a
                                href={answers[field._id]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                View Uploaded File
                              </a>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    // const token = localStorage.getItem("token");
                                    // const res = await fetch(`/api/admin/process/${id}/round/${roundId}/upload?url=${encodeURIComponent(answers[field._id])}`, {
                                    //   method: "DELETE",
                                    //   headers: {
                                    //     Authorization: `Bearer ${token}`,
                                    //   },
                                    // });

                                    // if (!res.ok) throw new Error("Delete failed");
                                    handleChange(field._id, ""); // clear answer
                                  } catch (err) {
                                    console.error("Delete failed:", err);
                                  }
                                }}
                                className="text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <input
                          type={field.subType === "number" ? "number" : "text"}
                          id={field._id}
                          value={answers[field._id] || ""}
                          onChange={(e) => handleChange(field._id, e.target.value)}
                          className="w-full border rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      )}

                    </motion.div>
                  ))}
                </div>


                {/* {saving && (
                  <p className="text-sm text-gray-500">Saving draft...</p>
                )} */}


                <div className="flex justify-between gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => router.push("/candidate/dashboard")}
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Return to Dashboard
                  </button>


                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md hover:scale-105 transition disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Submit & Continue"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </motion.main>
      </div>
    </div>
  );
}



