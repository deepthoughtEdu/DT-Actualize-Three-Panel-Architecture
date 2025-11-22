"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface AdminContact {
  name: string;
  email: string;
  phone?: string;
}

export default function WhatsAppGroupAdmin() {
  const [groupLink, setGroupLink] = useState("");
  const [admins, setAdmins] = useState<AdminContact[]>([
    { name: "", email: "", phone: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGroup();
  }, []);

  async function fetchGroup() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/whatsapp-group", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroupLink(res.data.groupLink || "");
      setAdmins(
        res.data.admins.length
          ? res.data.admins
          : [{ name: "", email: "", phone: "" }]
      );
    } catch (err) {
      setError("Failed to load WhatsApp group data");
    } finally {
      setLoading(false);
    }
  }

  const handleAdminChange = (
    idx: number,
    field: keyof AdminContact,
    value: string
  ) => {
    const updated = [...admins];
    updated[idx] = { ...updated[idx], [field]: value };
    setAdmins(updated);
  };

  const addAdmin = () => {
    setAdmins([...admins, { name: "", email: "", phone: "" }]);
  };

  const removeAdmin = (idx: number) => {
    setAdmins(admins.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!groupLink.includes("chat.whatsapp.com")) {
        setError("Please enter a valid WhatsApp group link");
        setSaving(false);
        return;
      }
      await axios.post(
        "/api/admin/whatsapp-group",
        {
          groupLink,
          admins: admins.filter((a) => a.name && a.email),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("WhatsApp group info saved successfully!");
    } catch (err) {
      setError("Failed to save WhatsApp group info");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Manage WhatsApp Group</h1>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {error && (
            <p className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</p>
          )}

          <label className="block mb-2 font-semibold">
            WhatsApp Group Link
          </label>
          <input
            type="url"
            className="w-full p-2 border rounded mb-4"
            placeholder="https://chat.whatsapp.com/..."
            value={groupLink}
            onChange={(e) => setGroupLink(e.target.value)}
            disabled={saving}
          />

          <label className="block mb-2 font-semibold">Admin Contacts</label>
          {admins.map((admin, idx) => (
            <div key={idx} className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Name"
                className="flex-1 p-2 border rounded"
                value={admin.name}
                onChange={(e) => handleAdminChange(idx, "name", e.target.value)}
                disabled={saving}
              />
              <input
                type="email"
                placeholder="Email"
                className="flex-1 p-2 border rounded"
                value={admin.email}
                onChange={(e) =>
                  handleAdminChange(idx, "email", e.target.value)
                }
                disabled={saving}
              />
              <input
                type="tel"
                placeholder="Phone (optional)"
                className="flex-1 p-2 border rounded"
                value={admin.phone || ""}
                onChange={(e) =>
                  handleAdminChange(idx, "phone", e.target.value)
                }
                disabled={saving}
              />
              <button
                className="px-3 bg-red-600 text-white rounded cursor-pointer"
                onClick={() => removeAdmin(idx)}
                disabled={saving}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            className="mb-6 px-4 py-2 bg-blue-600 text-white cursor-pointer rounded"
            onClick={addAdmin}
            disabled={saving}
          >
            + Add Admin
          </button>

          <br />

          <button
            className="px-6 py-2 bg-green-600 text-white cursor-pointer rounded disabled:opacity-50"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save WhatsApp Group"}
          </button>
        </>
      )}
    </div>
  );
}
