"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditFieldPage() {
  const { roundId, fieldId, id } = useParams();
  const router = useRouter();
  const [field, setField] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/admin/process/${id}/round/${roundId}/field/${fieldId}`)
      .then((res) => res.json())
      .then((data) => setField(data));
  }, [id, roundId, fieldId]);

  const handleUpdate = async () => {
    const token = localStorage.getItem("token"); // retrieve token from localStorage

    const res = await fetch(
      `/api/admin/process/${id}/round/${roundId}/field/${fieldId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔑 add this
        },
        body: JSON.stringify(field),
      }
    );

    if (res.ok) {
      alert("Changes updated successfully")
      router.push(`/admin/processes/${id}/rounds/${roundId}`);
    } else {
      const err = await res.json();
      alert("Error: " + err.error); // helpful debug
    }
  };


  if (!field) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Edit Field</h1>
      <input
        type="text"
        value={field.question}
        onChange={(e) => setField({ ...field, question: e.target.value })}
        className="border p-2 block mt-2 w-full"
      />
      <button
        onClick={handleUpdate}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
      >
        Save Changes
      </button>
    </div>
  );
}
