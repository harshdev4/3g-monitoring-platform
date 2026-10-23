
"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import Header from "@/components/dashboard/Header";
import ActionStudents from "../ActionStudents";

export default function ActionDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const actionId = Array.isArray(params.actionId)
    ? params.actionId[0]
    : params.actionId;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <button
            type="button"
            onClick={() => router.push("/dashboard/teacher/actions")}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to actions
          </button>

          <ActionStudents actionId={actionId} />
        </div>
      </main>
    </>
  );
}
