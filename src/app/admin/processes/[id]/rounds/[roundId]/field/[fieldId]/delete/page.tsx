"use client";
import { useParams, useRouter } from "next/navigation";

export default function DeleteFieldPage() {
  const { id, roundId, fieldId } = useParams(); // ✅ use `id`, not `processId`
  const router = useRouter();

  const handleDelete = async () => {
    const res = await fetch(`/api/admin/process/${id}/round/${roundId}/field/${fieldId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (res.ok) {
      router.push(`/admin/processes/${id}/rounds/${roundId}`); // ✅ fixed path
    } else {
      const err = await res.json();
      alert("Delete failed: " + err.error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-red-600">Delete Field</h1>
      <p>Are you sure you want to delete this field?</p>
      <button
        onClick={handleDelete}
        className="bg-red-600 text-white px-4 py-2 rounded mt-4"
      >
        Yes, Delete
      </button>
    </div>
  );
}
