"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";

export default function FileUploader({ type }: { type: "image" | "audio" }) {
  const [url, setUrl] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("type", type);

    const res = await axios.post("/api/admin/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setUrl(res.data.url);
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} accept={type === "image" ? "image/*" : "audio/*"} />
      {url && (
        type === "image" ? (
          <Image src={url} alt="Uploaded" className="mt-2 w-48" />
        ) : (
          <audio controls className="mt-2">
            <source src={url} type="audio/mpeg" />
          </audio>
        )
      )}
    </div>
  );
}
