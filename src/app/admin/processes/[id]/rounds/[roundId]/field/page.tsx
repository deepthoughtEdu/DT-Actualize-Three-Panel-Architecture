"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Field {
  _id: string;
  question: string;
  type: string;
  required: boolean;
}

export default function FieldsPage() {
  const { id, roundId } = useParams();
  const router = useRouter();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFields() {
      const token = localStorage.getItem("token"); // or however you store it

      const res = await fetch(`/api/admin/process/${id}/round/${roundId}/field`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setFields(data.fields ?? []);
      }
      setLoading(false);
    }
    if (id && roundId) fetchFields();
  }, [id, roundId]);

  if (loading) return <p className="p-6">Loading fields...</p>;

  const handleCreate = () => {
    router.push(`/admin/processes/${id}/rounds/${roundId}/field/create`);
  };

  const handleEdit = (fieldId: string) => {
    router.push(`/admin/processes/${id}/rounds/${roundId}/field/${fieldId}/edit`);
  };

  const handleDelete = async (fieldId: string) => {

    router.push(`/admin/processes/${id}/rounds/${roundId}/field/${fieldId}/delete`);

  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Fields</h1>

      {fields.length === 0 ? (
        <p>No fields yet. Create one below.</p>
      ) : (
        <ul className="divide-y divide-gray-200 mb-6">
          {fields.map((field) => (
            <li key={field._id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold">{field.question}</p>
                <p className="text-sm text-gray-500">{field.type}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleEdit(field._id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(field._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={handleCreate}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        + Add Field
      </button>
    </div>
  );
}
