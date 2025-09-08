'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

const PURPLE = '#3E00FF'; // close to the screenshot’s header color
const LIGHT_PURPLE = '#EFE9FF';

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'completed':
            return (
                <span
                    className="inline-flex items-center bg-green-500 rounded-full px-8 py-1 text-s font-medium text-white"
                >
                    Completed
                </span>
            );
        case 'in-progress':
            return (
                <span
                    className="inline-flex items-center rounded-full px-8 py-1 text-xs font-medium text-white"
                    style={{ backgroundColor: PURPLE }}
                >
                    In Process
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center rounded-full border px-10 py-1 text-xs font-medium text-gray-700 border-gray-300 bg-white">
                    Applied
                </span>
            );
    }
}

function ViewButton() {
    return (
        <button
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition"
            style={{
                borderColor: PURPLE,
                color: PURPLE,
                backgroundColor: '#FFF',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = LIGHT_PURPLE;
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFF';
            }}
        >
            {/* Eye icon (SVG) */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
            View Application
        </button>
    );
}

export default function ApplicantsPage() {
    const [applicants, setApplicants] = useState([]);
    const [processHeading, setProcesseHeading] = useState('');
    const [loading, setLoading] = useState(true);
    const { id } = useParams();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            const token = localStorage.getItem('token');

            const response = await axios({
                url: `/api/admin/process/applications/${id}`,
                method: 'GET',
                headers: {
                    'Content-Type': "application/json",
                    'Authorization': `Bearer ${token}`
                }
            });

            const processedApplicants = response.data.applications.map((applicant: any) => {
                return {
                    id: applicant.candidateId,
                    email: applicant.candidate.email,
                    status: applicant.status,
                    name: applicant.candidate.name,
                    round: applicant.currentRoundIndex,
                }
            });

            setProcesseHeading(response.data.process.title);
            setApplicants(processedApplicants);
            setLoading(false);
        }

        fetchData();
    }, []);


    if (loading) return <div>Loading Applicants...</div>

    return (
        <div className="min-h-screen bg-white">
            {/* Page header */}
            <header className="mx-auto w-full max-w-6xl px-6 pt-14 text-center">
                <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
                    {processHeading}
                </h1>
                <p className="mt-3 text-lg font-medium text-gray-400">Applicants</p>
            </header>

            {/* Table card */}
            <main className="mx-auto mt-10 w-full max-w-6xl px-6 pb-20">
                <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                    {/* Table header */}
                    <div
                        className="px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white"
                        style={{ backgroundColor: PURPLE }}
                    >
                        <div className="grid grid-cols-12 items-center">
                            <div className="col-span-4 pl-2">Name</div>
                            <div className="col-span-3 text-center">Status</div>
                            <div className="col-span-3 text-center">Round</div>
                            <div className="col-span-2 text-right pr-2">Actions</div>
                        </div>
                    </div>

                    {/* Rows */}
                    <ul className="divide-y divide-gray-200 bg-white">
                        {applicants.map((a: any) => (
                            <li key={a.id} className="px-4 py-5">
                                <div className="grid grid-cols-12 items-center">
                                    {/* Name */}
                                    <div className="col-span-4 pl-2">
                                        <p className="text-sm font-medium text-gray-800">{a.name}</p>
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-3 text-center">
                                        <StatusBadge status={a.status} />
                                    </div>

                                    {/* Round */}
                                    <div className="col-span-3 text-center">
                                        <p className="text-sm text-gray-600">{a.round}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-2 flex justify-end pr-2">
                                        <ViewButton />
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    );
}
