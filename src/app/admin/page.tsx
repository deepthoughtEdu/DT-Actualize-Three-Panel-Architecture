import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
          Welcome to the Admin Panel
        </h1>
        <p className="mt-3 text-slate-600">
          Use the sidebar to navigate. You can manage processes, create new ones,
          and invite admins.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/admin/processes"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            Go to Processes
          </Link>
          <Link
            href="/admin/processes/create"
            className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Create Process
          </Link>
          <Link
            href="/admin/register"
            className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Create Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
