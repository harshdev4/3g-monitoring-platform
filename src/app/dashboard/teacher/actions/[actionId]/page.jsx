
"use client";

import { useParams } from "next/navigation";

import Header from "@/components/dashboard/Header";
import ActionStudents from "../ActionStudents";

export default function ActionDetailsPage() {
  const params = useParams();

  const actionId = Array.isArray(params.actionId)
    ? params.actionId[0]
    : params.actionId;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <ActionStudents actionId={actionId} />
        </div>
      </main>
    </>
  );
}
