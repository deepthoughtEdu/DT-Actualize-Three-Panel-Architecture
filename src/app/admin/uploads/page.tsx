"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Upload {
  _id: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
}

export default function UploadsPage() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // 🔹 Fetch admin info from JWT session
  const fetchAdmin = async () => {
    try {
      const res = await axios.get("/api/admin/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // token stored on login
        },
      });
      setAdminId(res.data._id); // store admin id
    } catch (err) {
      console.error("Failed to fetch admin session:", err);
    }
  };

  // 🔹 Fetch uploads for this admin
  const fetchUploads = async (adminId: string) => {
    try {
      const res = await axios.get(`/api/admin/upload?uploadedBy=${adminId}`);
      setUploads(res.data);
    } catch (err) {
      console.error("Failed to fetch uploads:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 On mount, first get admin, then fetch uploads
  useEffect(() => {
    const init = async () => {
      await fetchAdmin();
    };
    init();
  }, []);

  useEffect(() => {
    if (adminId) {
      fetchUploads(adminId);
    }
  }, [adminId]);

  // 🔹 Handle file upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !adminId) {
      alert("No file or admin session found");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadedBy", adminId);

    try {
      setUploading(true);
      const res = await axios.post("/api/admin/upload", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUploads((prev) => [res.data, ...prev]); // add new upload to UI
      setFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Uploaded Files</h1>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="border p-4 rounded space-y-3 bg-gray-50"
      >
        <div>
          <label className="block text-sm font-medium">Select File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {/* Uploads Table */}
      {loading ? (
        <p className="p-4">Loading uploads...</p>
      ) : uploads.length === 0 ? (
        <p>No uploads found.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Filename</th>
              <th className="border px-4 py-2">Type</th>
              <th className="border px-4 py-2">Size (KB)</th>
              <th className="border px-4 py-2">Uploaded At</th>
              <th className="border px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {uploads.map((upload) => (
              <tr key={upload._id}>
                <td className="border px-4 py-2">{upload.filename}</td>
                <td className="border px-4 py-2">{upload.mimetype}</td>
                <td className="border px-4 py-2">
                  {(upload.size / 1024).toFixed(1)}
                </td>
                <td className="border px-4 py-2">
                  {new Date(upload.uploadedAt).toLocaleString()}
                </td>
                <td className="border px-4 py-2">
                  <a
                    href={upload.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View / Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
