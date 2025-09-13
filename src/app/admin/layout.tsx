"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/components/ui/Header";
import { useState } from "react";

const nav = [
    { href: "/admin/processes", label: "Processes", icon: "📂" },
    { href: "/admin/register", label: "Create Admin", icon: "🛡️" },
];

function NavLink({
    href,
    label,
    icon,
    onClick,
}: {
    href: string;
    label: string;
    icon?: string;
    onClick?: () => void;
}) {
    const pathname = usePathname();
    const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));

    const base =
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition";
    const activeClasses =
        "bg-blue-50 text-blue-700 font-medium";
    const inactiveClasses =
        "text-slate-600 hover:bg-slate-100 hover:text-slate-900";

    return (
        <Link
            href={href}
            onClick={onClick}
            className={`${base} ${active ? activeClasses : inactiveClasses}`}
        >
            <span className="text-base">{icon}</span>
            <span>{label}</span>
        </Link>
    );
}


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top bar */}
            <div className="mx-auto grid grid-cols-1 md:grid-cols-[260px_1fr] gap-0">
                {/* Sidebar */}
                <aside
                    className={`border-r bg-white md:static md:translate-x-0 md:block ${open
                            ? "absolute inset-y-0 left-0 z-40 w-64 translate-x-0"
                            : "absolute -translate-x-full md:relative md:translate-x-0"
                        }`}
                >

                    <div className="flex h-[calc(100vh-57px)] flex-col p-3 md:h-[calc(100vh-61px)]">

                        <nav className="space-y-1">
                            {nav.map((item) => (
                                <NavLink
                                    key={item.href}
                                    {...item}
                                    onClick={() => setOpen(false)}
                                />
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main content */}
                <main className="min-h-[calc(100vh-61px)] bg-slate-50 p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
