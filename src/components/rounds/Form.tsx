import { motion } from "framer-motion";
import { memo, useCallback, useState, useEffect } from "react";

interface Field {
  _id: string;
  question: string;
  subType: "shortText" | "fileUpload" | "number";
}

interface FormRoundProps {
  fields?: Field[];
  answers: Record<string, string>;
  isLocked: boolean;
  onChange: (fieldId: string, value: string) => void;
  saving?: boolean;
  setSaving?: (saving: boolean) => void;
}

export default function Form({
  fields = [],
  answers,
  isLocked,
  onChange,
  setSaving,
}: FormRoundProps) {
  const handleFileUpload = useCallback(
    async (fieldId: string, file: File) => {
      setSaving?.(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "file");

        const token = localStorage.getItem("token");
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        onChange(fieldId, data.url);
      } catch (err) {
        console.error(err);
      } finally {
        setSaving?.(false);
      }
    },
    [onChange, setSaving]
  );

  return (
    <motion.div className="w-full h-full bg-white rounded-2xl shadow-lg p-8 flex flex-col">
      <form className="space-y-6">
        <div className="space-y-6 h-[560px] overflow-y-auto">
          {fields.map((field) => (
            <FieldInput
              key={field._id}
              field={field}
              value={answers[field._id] || ""}
              isLocked={isLocked}
              onChange={onChange}
              onFileUpload={handleFileUpload}
            />
          ))}
        </div>
      </form>
    </motion.div>
  );
}

const FieldInput = memo(
  ({ field, value: parentValue, isLocked, onChange, onFileUpload }: any) => {
    const [value, setValue] = useState(parentValue);

    useEffect(() => {
      setValue(parentValue);
    }, [parentValue]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(e.target.value);
      onChange(field._id, e.target.value);
    };

    const commonClasses = `
      h-13 w-full border rounded-lg p-3 
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
      ${isLocked ? "cursor-not-allowed bg-gray-50" : "cursor-text"}
    `;

    return (
      <motion.div className="space-y-2">
        <label htmlFor={field._id} className="text-sm font-medium text-gray-800">
          {field.question} <span className="text-red-500 ml-1">*</span>
        </label>

        {field.subType === "fileUpload" ? (
          parentValue ? (
            <div
              className={`flex items-center justify-between border p-3 rounded-lg ${
                isLocked ? "cursor-not-allowed bg-gray-50" : ""
              }`}
            >
              <a
                href={parentValue}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Uploaded File
              </a>
              {!isLocked && (
                <button
                  type="button"
                  onClick={() => onChange(field._id, "")}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          ) : (
            <input
              type="file"
              id={field._id}
              disabled={isLocked}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileUpload(field._id, file);
              }}
              className={`
                ${commonClasses}
                ${isLocked ? "cursor-not-allowed bg-gray-100" : "cursor-pointer"}
              `}
            />
          )
        ) : (
          <textarea
            id={field._id}
            value={value}
            disabled={isLocked}
            onChange={handleInputChange}
            className={commonClasses}
            required
          />
        )}
      </motion.div>
    );
  }
);

FieldInput.displayName = "FieldInput";
