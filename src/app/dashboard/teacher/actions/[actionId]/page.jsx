
"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Header from "@/components/dashboard/Header";
import ActionStudents from "../ActionStudents";

export default function ActionDetailsPage() {
  const params = useParams();

  const actionId = Array.isArray(params.actionId)
    ? params.actionId[0]
    : params.actionId;
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const backHref = `/dashboard/teacher/actions${query ? `?${query}` : ""}`;
  const filters = {
    program: searchParams.get("program") || "",
    semester: searchParams.get("semester") || "",
    courses: searchParams.get("courses") || "",
    section: searchParams.get("section") || "",
    assessment: searchParams.get("assessment") || "",
    category3G: searchParams.get("category3G") || "",
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back to actions
          </Link>
          <ActionStudents actionId={actionId} filters={filters} />
        </div>
      </main>
    </>
  );
}
