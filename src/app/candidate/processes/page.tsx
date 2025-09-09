"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Process as BackendProcess } from "@/types/process";
import { HeroSection } from "@/components/candidate/Role-Gallery/HeroSection";
import { ProcessGrid } from "@/components/candidate/Role-Gallery/ProcessGrid";

interface UIProcess {
  id: string;
  name: string;
  description: string;
  createdDate: string;
}

export default function CandidateProcessesPage() {
  const router = useRouter();
  const [processes, setProcesses] = useState<UIProcess[]>([]);
  const [filteredProcesses, setFilteredProcesses] = useState<UIProcess[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const res = await fetch("/api/candidate/processes");
        if (!res.ok) throw new Error("Failed to fetch processes");
        const data: BackendProcess[] = await res.json();

        const mapped = data.map((process) => ({
          id: process._id?.toString() || "",
          name: process.title,
          description: process.description || "",
          createdDate: new Date(process.createdAt).toLocaleDateString(),
        }));

        setProcesses(mapped);
        setFilteredProcesses(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProcesses();
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredProcesses(processes);
      return;
    }
    const lowerQuery = query.toLowerCase();
    setFilteredProcesses(
      processes.filter(
        (process) =>
          process.name.toLowerCase().includes(lowerQuery) ||
          process.description.toLowerCase().includes(lowerQuery)
      )
    );
  };

  const handleProcessClick = (process: UIProcess) => {
    router.push(`/candidate/processes/${process.id}`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Loading processes...</p>
      </div>
    );
  }

  return (
    <div>
      <HeroSection onSearch={handleSearch} />
      <ProcessGrid processes={filteredProcesses} onProcessClick={handleProcessClick} />
    </div>
  );
}
