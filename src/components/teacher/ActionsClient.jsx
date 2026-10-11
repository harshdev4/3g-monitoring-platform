"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  Clock3,
  FileCheck2,
  Filter,
  Plus,
  Search,
  Users,
} from "lucide-react";

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
  Assigned: "bg-slate-100 text-slate-600",
  "In Progress": "bg-blue-50 text-blue-700",
  "Evidence Submitted": "bg-violet-50 text-violet-700",
  "Under Review": "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-rose-50 text-rose-700",
  Overdue: "bg-red-50 text-red-700",
};

function SelectField({ label, options }) {
  return (
    <label className="min-w-0 text-[11px] font-medium text-[#52627A]">
      <span className="mb-1 block">{label}</span>
      <span className="relative block">
        <select
          defaultValue={options[0]}
          className="h-9 w-full appearance-none rounded-md border border-[#DCE3EC] bg-white px-2.5 pr-8 text-xs outline-none focus:border-[#2563EB]"
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
        />
      </span>
    </label>
  );
}

function Metric({ icon: Icon, label, value, note, color }) {
  return (
    <div className="rounded-lg border border-[#E5EAF1] bg-white p-4">
      <div className="flex items-center justify-between text-xs text-[#71809A]">
        {label}
        <Icon size={17} className={color} />
      </div>
      <p className="mt-2 text-2xl font-semibold text-[#102746]">{value}</p>
      <p className="mt-1 text-[11px] text-[#71809A]">{note}</p>
    </div>
  );
}

export default function ActionsClient({ assignedCourses }) {
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
  const classes = [
    ...new Set(assignedCourses.map((course) => course.className)),
  ];

  return (
    <main className="mx-auto max-w-[1500px] space-y-4 p-4 sm:p-5 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-[#71809A]">
            Teacher workspace
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#102746]">
            Assigned actions
          </h2>
          <p className="mt-1 text-xs text-[#71809A]">
            Subject-wise support &amp; enrichment · Track assignments through
            evidence approval.
          </p>
        </div>
        <button
          onClick={() => setShowForm((open) => !open)}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-[#2563EB] px-3.5 text-xs font-medium text-white"
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
          note="Across assigned classes"
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
            options={["All assigned classes", ...classes]}
          />
          <SelectField
            label="Subject"
            options={[
              "All subjects",
              ...new Set(assignedCourses.map((course) => course.course)),
            ]}
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
      <section className="overflow-hidden rounded-lg border border-[#E5EAF1] bg-white">
        <div className="space-y-3 border-b border-[#EEF1F5] p-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h3 className="text-sm font-semibold text-[#102746]">
                Assigned activities
              </h3>
              <p className="mt-1 text-[11px] text-[#71809A]">
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
          <div className="flex gap-1.5 overflow-x-auto">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`shrink-0 rounded-md px-2.5 py-1.5 text-[11px] ${activeStatus === status ? "bg-[#EAF1FB] text-[#102746]" : "text-[#71809A]"}`}
              >
                {status}
              </button>
            ))}
          </div>
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
                ].map((label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-[10px] font-semibold uppercase text-[#71809A]"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-[#EEF1F5]">
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-[#253B59]">
                      {item.activity}
                    </p>
                    <p className="mt-1 text-[11px] text-[#71809A]">
                      {item.student} · {item.roll}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#52627A]">
                    {item.subject} · {item.category}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#52627A]">
                    <CalendarDays size={13} className="mr-1 inline" />
                    {item.due}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#52627A]">
                    {item.evidence}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#52627A]">
                    {item.progress}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] ${statusStyles[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/teacher/actions/${item.id}`}
                      className="whitespace-nowrap text-xs font-medium text-[#2563EB]"
                    >
                      View Action <ArrowRight size={12} className="inline" />
                    </Link>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
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
        <div className="border-t border-[#EEF1F5] px-4 py-3 text-[11px] text-[#71809A]">
          Showing {filtered.length} of 84 action assignments
        </div>
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        {showForm && (
          <div className="rounded-lg border border-[#E5EAF1] bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#102746]">
                  Create / assign action
                </h3>
                <p className="mt-1 text-[11px] text-[#71809A]">
                  Inline assignment form
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-xs text-[#71809A]"
              >
                Hide
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                label="Student(s)"
                options={["Choose students", "Aman Kumar", "Karan Mehta"]}
              />
              <SelectField
                label="Subject"
                options={[
                  "Choose subject",
                  ...new Set(assignedCourses.map((course) => course.course)),
                ]}
              />
              <SelectField
                label="3G category"
                options={["Gradual", "Growing", "Gallant"]}
              />
              <label className="text-[11px] text-[#52627A]">
                Due date
                <input
                  type="date"
                  className="mt-1 h-9 w-full rounded-md border border-[#DCE3EC] px-2.5 text-xs"
                />
              </label>
              <label className="text-[11px] text-[#52627A] sm:col-span-2">
                Activity / action
                <input className="mt-1 h-9 w-full rounded-md border border-[#DCE3EC] px-2.5 text-xs" />
              </label>
              <label className="text-[11px] text-[#52627A] sm:col-span-2">
                Evidence required
                <input className="mt-1 h-9 w-full rounded-md border border-[#DCE3EC] px-2.5 text-xs" />
              </label>
            </div>
            <button className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#2563EB] px-3 py-2 text-xs text-white">
              <Users size={13} />
              Assign action
            </button>
          </div>
        )}
        <div className="rounded-lg border border-[#E5EAF1] bg-white p-4">
          <h3 className="text-sm font-semibold text-[#102746]">
            Workflow &amp; completion rules
          </h3>
          <div className="mt-4 space-y-4">
            {[
              [
                "Assigned → In Progress",
                "Students complete the listed requirements.",
              ],
              [
                "Evidence Submitted → Under Review",
                "Faculty checks submissions against requirements.",
              ],
              [
                "Approved or Rejected",
                "Rejection requires feedback and a revised submission.",
              ],
              [
                "Overdue follow-up",
                "Incomplete actions past their due date need faculty attention.",
              ],
            ].map(([title, detail], index) => (
              <div key={title} className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF1FB] text-[10px] text-[#2563EB]">
                  {index + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold text-[#334155]">
                    {title}
                  </p>
                  <p className="mt-1 text-[11px] text-[#71809A]">{detail}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/teacher/evidence"
            className="mt-5 inline-flex items-center gap-1.5 border-t border-[#EEF1F5] pt-4 text-xs font-medium text-[#2563EB]"
          >
            <FileCheck2 size={14} />
            Review submissions
          </Link>
        </div>
      </section>
    </main>
  );
}
