"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  ClipboardList,
  Clock3,
  FileCheck2,
  Filter,
  Plus,
  Search,
} from "lucide-react";
import Header from "@/components/dashboard/Header";
import UserWorkSpace from "@/components/dashboard/UserWorkSpace";

const assignments = [
  {
    id: 1,
    activity: "Mini-Q practice sheet",
    student: "Aman Kumar",
    roll: "1021",
    subject: "DBMS",
    category: "Gradual",
    due: "10 Oct 2026",
    evidence: "Answer sheet",
    progress: "3 / 4 steps",
    status: "Under Review",
  },
  {
    id: 2,
    activity: "Remedial DBMS classes",
    student: "Karan Mehta",
    roll: "1024",
    subject: "DBMS",
    category: "Gradual",
    due: "12 Oct 2026",
    evidence: "Attendance / completion proof",
    progress: "1 / 4 steps",
    status: "In Progress",
  },
  {
    id: 3,
    activity: "SQL case study",
    student: "Ravi Singh",
    roll: "1022",
    subject: "DBMS",
    category: "Growing",
    due: "14 Oct 2026",
    evidence: "Project document",
    progress: "0 / 3 steps",
    status: "Assigned",
  },
  {
    id: 4,
    activity: "Advanced database project",
    student: "Neha Sharma",
    roll: "1023",
    subject: "DBMS",
    category: "Gallant",
    due: "16 Oct 2026",
    evidence: "Project document",
    progress: "2 / 3 steps",
    status: "Evidence Submitted",
  },
  {
    id: 5,
    activity: "Seminar participation",
    student: "Aman Kumar",
    roll: "1021",
    subject: "DBMS",
    category: "Gradual",
    due: "29 Sep 2026",
    evidence: "Participation proof",
    progress: "4 / 4 steps",
    status: "Approved",
  },
  {
    id: 6,
    activity: "SQL revision worksheet",
    student: "Pooja Verma",
    roll: "1025",
    subject: "DBMS",
    category: "Growing",
    due: "03 Oct 2026",
    evidence: "Answer sheet",
    progress: "2 / 3 steps",
    status: "Rejected",
  },
  {
    id: 7,
    activity: "DAA concept recap",
    student: "Sahil Gupta",
    roll: "1048",
    subject: "DAA",
    category: "Gradual",
    due: "02 Oct 2026",
    evidence: "Faculty confirmation",
    progress: "1 / 3 steps",
    status: "Overdue",
  },
];

const statuses = [
  "All",
  "Assigned",
  "In Progress",
  "Evidence Submitted",
  "Under Review",
  "Approved",
  "Rejected",
  "Overdue",
];

const statusStyles = {
  All: { pill: "bg-blue-50 text-blue-700", dot: "bg-blue-600" },
  Assigned: { pill: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  "In Progress": { pill: "bg-blue-50 text-blue-700", dot: "bg-blue-600" },
  "Evidence Submitted": {
    pill: "bg-blue-50 text-blue-700",
    dot: "bg-blue-600",
  },
  "Under Review": { pill: "bg-blue-50 text-blue-700", dot: "bg-blue-600" },
  Approved: { pill: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  Rejected: { pill: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
  Overdue: { pill: "bg-red-50 text-red-700", dot: "bg-red-500" },
};

const fallbackStyle = {
  pill: "bg-slate-100 text-slate-600",
  dot: "bg-slate-400",
};

const statusCounts = {
  All: 84,
  Approved: 52,
  "In Progress": 18,
  "Evidence Submitted": 1,
  "Under Review": 8,
  Rejected:1,
  Overdue: 6,
};

function SelectField({ label, options }) {
  return (
    <label className="min-w-0 text-[11px] font-medium text-[#52627A]">
      <span className="mb-1 block">{label}</span>
      <span className="relative block">
        <select
          defaultValue={options[0]}
          className="h-9 w-full appearance-none rounded-md border border-[#DCE3EC] bg-white px-2.5 pr-8 text-xs text-[#253B59] outline-none focus:border-[#2563EB]"
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71809A]"
        />
      </span>
    </label>
  );
}

function Metric({ icon: Icon, label, value, note, color }) {
  return (
    <div className="rounded-lg border border-[#E5EAF1] bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#71809A]">{label}</span>
        <Icon size={17} className={color} />
      </div>
      <p className="mt-2 text-2xl font-semibold leading-none text-[#102746]">
        {value}
      </p>
      <p className="mt-2 text-[11px] text-[#71809A]">{note}</p>
    </div>
  );
}

export default function ActionsPage() {
  const [activeStatus, setActiveStatus] = useState("All");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(true);
  const filtered = useMemo(
    () =>
      assignments.filter(
        (item) =>
          (activeStatus === "All" || item.status === activeStatus) &&
          `${item.activity} ${item.student} ${item.roll}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [activeStatus, query],
  );

  return (
    <>
      <Header />
      <div className="p-5">
        <UserWorkSpace user={"Teacher"} name={"Prof. Harsh Sharma"} />
        <main className="mx-auto max-w-[1500px] space-y-4 p-4 sm:p-5 lg:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium text-[#71809A]">
                Teacher workspace
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-[#102746]">
                Activities / Actions
              </h1>
              <p className="mt-1 text-xs text-[#71809A]">
                Subject-wise support &amp; enrichment · Track assignments
                through evidence approval.
              </p>
            </div>
            <button
              onClick={() => setShowForm((open) => !open)}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[#2563EB] px-3.5 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
            >
              <Plus size={15} />
              Create / Assign Action
            </button>
          </div>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              icon={ClipboardList}
              label="Actions assigned"
              value="84"
              note="Across MCA-1A & MCA-1B"
              color="text-[#2563EB]"
            />
            <Metric
              icon={Check}
              label="Approved"
              value="52"
              note="62% completed & verified"
              color="text-[#10B981]"
            />
            <Metric
              icon={Clock3}
              label="In Progress"
              value="18"
              note="Active student work"
              color="text-[#F59E0B]"
            />
            <Metric
              icon={FileCheck2}
              label="Needs review / follow-up"
              value="14"
              note="8 under review · 6 overdue"
              color="text-[#EF4444]"
            />
          </section>
          <section className="rounded-lg border border-[#E5EAF1] bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#102746]">
              <Filter size={15} className="text-[#2563EB]" />
              Filters
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <SelectField
                label="Class / Section"
                options={["All assigned classes", "MCA-1A", "MCA-1B"]}
              />
              <SelectField
                label="Subject"
                options={["All subjects", "DBMS", "DAA", "Operating Systems"]}
              />
              <SelectField
                label="3G category"
                options={["All categories", "Gradual", "Growing", "Gallant"]}
              />
              <SelectField
                label="Status"
                options={["All statuses", ...statuses.slice(1)]}
              />
              <SelectField
                label="Due date"
                options={["All dates", "Overdue", "Due this week", "Upcoming"]}
              />
            </div>
          </section>

          {/* Status filter chips */}
          <div className="flex gap-2 overflow-x-clip font-medium pb-1 p-1">
            {statuses.map((status) => {
              const style = statusStyles[status] ?? fallbackStyle;
              const isActive = activeStatus === status;

              return (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold transition ${style.pill} ${
                    isActive
                      ? "ring-1 ring-current"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {status}
                  {statusCounts[status] !== undefined && (
                    <span className="font-medium opacity-70">
                      · {statusCounts[status]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <section className="overflow-hidden rounded-lg border border-[#E5EAF1] bg-white">
            <div className="flex flex-col justify-between gap-3 border-b border-[#EEF1F5] p-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-lg font-semibold text-[#102746]">
                  Assigned activities
                </h2>
                <p className="mt-1 text-xs text-[#71809A]">
                  Completion means approved evidence, not merely submitted
                  evidence.
                </p>
              </div>
              <label className="relative block w-full md:w-72">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A98AB]"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search activity, student name or roll number"
                  className="h-9 w-full rounded-md border border-[#DCE3EC] pl-9 pr-3 text-xs outline-none focus:border-[#2563EB]"
                />
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[940px] text-left">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    {[
                      "Activity / student",
                      "Subject / 3G",
                      "Due date",
                      "Evidence required",
                      "Progress",
                      "Status",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-xs font-medium text-[#52627A]"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const style = statusStyles[item.status] ?? fallbackStyle;

                    return (
                      <tr
                        key={item.id}
                        className="border-t border-[#EEF1F5] transition-colors hover:bg-[#F8FAFC]"
                      >
                        <td className="px-4 py-3.5">
                          <p className="text-[13px] font-medium text-[#102746]">
                            {item.activity}
                          </p>
                          <p className="mt-0.5 text-[13px] text-[#52627A]">
                            {item.student} · {item.roll}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-[13px] text-[#334155]">
                          {item.subject} · {item.category}
                        </td>
                        <td className="px-4 py-3.5 text-[13px] text-[#52627A]">
                          {item.due}
                        </td>
                        <td className="px-4 py-3.5 text-[13px] text-[#52627A]">
                          {item.evidence}
                        </td>
                        <td className="px-4 py-3.5 text-[13px] text-[#52627A]">
                          {item.progress}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${style.pill}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                            />
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <Link
                            href={`/dashboard/teacher/actions/${item.id}`}
                            className="whitespace-nowrap text-[13px] font-medium text-[#2563EB] hover:underline"
                          >
                            View Action
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="p-8 text-center text-xs text-[#71809A]"
                      >
                        No activities match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EEF1F5] px-4 py-4 text-xs text-[#71809A]">
              <span>Showing 1–{filtered.length} of 84 action assignments</span>
              <div className="flex items-center gap-2 text-[#102746]">
                <button className="h-10 rounded-lg border border-[#E5EAF1] bg-white px-4 text-xs font-medium hover:bg-[#F8FAFC]">
                  Previous
                </button>
                <button className="h-10 w-10 rounded-lg bg-[#2563EB] text-xs font-medium text-white">
                  1
                </button>
                <button className="h-10 w-10 rounded-lg border border-[#E5EAF1] bg-white text-xs font-medium hover:bg-[#F8FAFC]">
                  2
                </button>
                <button className="h-10 rounded-lg border border-[#E5EAF1] bg-white px-4 text-xs font-medium hover:bg-[#F8FAFC]">
                  Next
                </button>
              </div>
            </div>
          </section>
          <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            {showForm && (
              <div className="rounded-lg border border-[#E5EAF1] bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-[#102746]">
                      Create / assign action
                    </h2>
                    <p className="mt-1 text-[11px] text-[#71809A]">
                      Inline assignment form · No extra screen
                    </p>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-xs text-[#71809A] hover:text-[#102746]"
                  >
                    Hide
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-[11px] font-medium text-[#52627A]">
                    Student(s)
                    <select
                      defaultValue="Aman Kumar, Karan Mehta"
                      className="mt-1 h-9 w-full rounded-md border border-[#DCE3EC] bg-white px-2.5 text-xs text-[#253B59]"
                    >
                      <option>Aman Kumar, Karan Mehta</option>
                      <option>Choose students</option>
                    </select>
                  </label>
                  <label className="text-[11px] font-medium text-[#52627A]">
                    Subject
                    <select
                      defaultValue="DBMS"
                      className="mt-1 h-9 w-full rounded-md border border-[#DCE3EC] bg-white px-2.5 text-xs text-[#253B59]"
                    >
                      <option>DBMS</option>
                      <option>DAA</option>
                    </select>
                  </label>
                  <label className="text-[11px] font-medium text-[#52627A]">
                    3G category
                    <select
                      defaultValue="Gradual"
                      className="mt-1 h-9 w-full rounded-md border border-[#DCE3EC] bg-white px-2.5 text-xs text-[#253B59]"
                    >
                      <option>Gradual</option>
                      <option>Growing</option>
                      <option>Gallant</option>
                    </select>
                  </label>
                  <label className="text-[11px] font-medium text-[#52627A]">
                    Due date
                    <input
                      type="date"
                      defaultValue="2026-10-12"
                      className="mt-1 h-9 w-full rounded-md border border-[#DCE3EC] bg-white px-2.5 text-xs text-[#253B59]"
                    />
                  </label>
                  <label className="text-[11px] font-medium text-[#52627A] sm:col-span-2">
                    Activity / action
                    <input
                      defaultValue="Attend remedial DBMS classes"
                      className="mt-1 h-9 w-full rounded-md border border-[#DCE3EC] px-2.5 text-xs text-[#253B59]"
                    />
                  </label>
                  <label className="text-[11px] font-medium text-[#52627A] sm:col-span-2">
                    Evidence required
                    <input
                      defaultValue="Attendance / completion proof"
                      className="mt-1 h-9 w-full rounded-md border border-[#DCE3EC] px-2.5 text-xs text-[#253B59]"
                    />
                  </label>
                </div>
                <div className="mt-4 flex justify-start gap-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="rounded-md border border-[#DCE3EC] p-3 text-xs font-semibold text-[#52627A]"
                  >
                    Cancel
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-md bg-[#2563EB] p-3 text-xs font-semibold text-white">
                    
                    Assign to 2 students
                  </button>
                </div>
              </div>
            )}
            <div className="rounded-lg border h-fit border-[#E5EAF1] bg-white p-5">
              <h2 className="text-sm font-semibold text-[#102746]">
                Workflow &amp; completion rules
              </h2>
              <div className="mt-4 space-y-4">
                {[
                  [
                    "Assigned → In Progress",
                    "Students start the activity and complete the listed requirements.",
                  ],
                  [
                    "Evidence Submitted → Under Review",
                    "Faculty checks submitted files against the evidence requirements.",
                  ],
                  [
                    "Approved or Rejected",
                    "Approval completes the assignment. Rejection requires feedback and a revised submission.",
                  ],
                  [
                    "Overdue requires a follow-up",
                    "An incomplete action past its due date is flagged for faculty attention.",
                  ],
                ].map(([title, detail], index) => (
                  <div key={title} className="flex gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#334155]">
                        {title}
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-[#71809A]">
                        {detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-[#EEF1F5] pt-4">
                <Link
                  href="/dashboard/teacher/evidence"
                  className="inline-flex items-center gap-0.5 rounded-md text-[#2563EB] py-2 text-xs font-medium "
                >
                  Review 8 current submissions
                </Link>
                <Link
                  href="/dashboard/teacher/at-risk"
                  className="inline-flex items-center gap-0.5 rounded-md text-[#2563EB] py-2 text-xs font-medium "
                >
                  Follow up 6 overdue actions
                </Link>
              </div>
            </div>
          </section>
          <footer className="flex flex-wrap items-center justify-between gap-2 pb-2 text-[10px] text-[#8A98AB]">
            <span>3G · Academic insights updated 05 Oct 2026, 09:30 IST</span>
          </footer>
        </main>
      </div>
    </>
  );
}