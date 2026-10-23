
"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";

import Header from "@/components/dashboard/Header";
import ActionFilters from "@/components/teacher/ActionFilters";
import ActionList from "./ActionList";
import AssignedActions from "./AssignedActions";
import TeacherSubmissions from "@/components/teacher/TeacherSubmissions";

export default function ActionsPage() {
  const [filters, setFilters] = useState({
    program: "",
    semester: "",
    courses: "",
    courseName: "",
    assessment: "",
    category3G: "",
  });

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Student Actions
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Browse action templates and track the actions assigned to
              your students.
            </p>
          </div>

          <ActionFilters
            filters={filters}
            setFilters={setFilters}
          />

          <section className="rounded-xl border border-slate-200 bg-white p-4 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <ClipboardList size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Available Actions
                </h2>
                <p className="text-sm text-slate-500">
                  Select an action to assign it to eligible students.
                </p>
              </div>
            </div>

            <ActionList filters={filters} />
          </section>

          <section>
            <AssignedActions filters={filters} />
          </section>
          <section>
            <TeacherSubmissions filters={filters} />
          </section>
        </div>
      </main>
    </>
  );
}
