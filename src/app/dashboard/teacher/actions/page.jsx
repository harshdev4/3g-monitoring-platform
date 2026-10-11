"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  ClipboardList,
  Clock3,
  FileCheck2,
  Plus,
  Search,
} from "lucide-react";
import Header from "@/components/dashboard/Header";
import Pill from "@/components/teacher/Pill";
import ActionFilters from "@/components/teacher/ActionFilters";
import AssignActionModal from "@/components/teacher/AssignActionModal";

/* -------------------------------------------------------------------------- */
/*  Static data                                                               */
/* -------------------------------------------------------------------------- */

const assignments = [
  {
    id: 1,
    activity: "Mini-Q practice sheet",
    student: "Aman Kumar",
    roll: "1021",
    class: "MCA-1A",
    subject: "DBMS",
    assessment: "MSE-1",
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
    class: "MCA-1B",
    subject: "DBMS",
    assessment: "Pre-MSE",
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
    class: "MCA-1A",
    subject: "DBMS",
    assessment: "MSE-1",
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
    class: "MCA-1A",
    subject: "DBMS",
    assessment: "ESE",
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
    class: "MCA-1A",
    subject: "DBMS",
    assessment: "MSE-2",
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
    class: "MCA-1B",
    subject: "DBMS",
    assessment: "MSE-1",
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
    class: "MCA-1A",
    subject: "DAA",
    assessment: "MSE-1",
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

const statusCounts = {
  All: 84,
  Approved: 52,
  "In Progress": 18,
  "Evidence Submitted": 1,
  "Under Review": 8,
  Rejected: 1,
  Overdue: 6,
};

// Sections and subjects taught by the logged-in teacher.
// Replace with the teacher's assigned courses from your API / store.
const teacherSections = ["All sections", "MCA-1A", "MCA-1B"];
const teacherSubjects = ["DBMS", "DAA"];

const tableHeadings = [
  "Activity / student",
  "Subject / 3G",
  "Due date",
  "Evidence required",
  "Progress",
  "Status",
  "Action",
];

const workflowRules = [
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
];

/* -------------------------------------------------------------------------- */
/*  Metrics                                                                   */
/* -------------------------------------------------------------------------- */

// Derived from statusCounts so each number is defined in one place only.
const actionMetrics = [
  {
    label: "Actions assigned",
    value: statusCounts.All,
    description: "Across MCA-1A & MCA-1B",
    icon: ClipboardList,
    iconClassName: "text-[#2563EB]",
  },
  {
    label: "Approved",
    value: statusCounts.Approved,
    description: `${Math.round(
      (statusCounts.Approved / statusCounts.All) * 100,
    )}% completed & verified`,
    icon: Check,
    iconClassName: "text-[#10B981]",
  },
  {
    label: "In Progress",
    value: statusCounts["In Progress"],
    description: "Active student work",
    icon: Clock3,
    iconClassName: "text-[#F59E0B]",
  },
  {
    label: "Needs review / follow-up",
    value: statusCounts["Under Review"] + statusCounts.Overdue,
    description: `${statusCounts["Under Review"]} under review · ${statusCounts.Overdue} overdue`,
    icon: FileCheck2,
    iconClassName: "text-[#EF4444]",
  },
];

function ActionMetrics() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {actionMetrics.map(
        ({ label, value, description, icon: Icon, iconClassName }) => (
          <div
            key={label}
            className="rounded-lg border border-[#E5EAF1] bg-white p-4"
          >
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-[#60708A]">{label}</p>
              <Icon size={16} strokeWidth={1.8} className={iconClassName} />
            </div>
            <p className="mt-2 text-2xl font-semibold leading-none text-[#102746]">
              {value}
            </p>
            <p className="mt-2 text-xs text-[#71809A]">{description}</p>
          </div>
        ),
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Filtering                                                                 */
/* -------------------------------------------------------------------------- */

// "Show everything" value of each dropdown. Used for the initial state and
// for the comparison, so the strings live in one place.
const FILTER_DEFAULTS = {
  classSection: "All assigned classes",
  subject: "All subjects",
  category3G: "All categories",
  assessment: "All assessments",
  dueDate: "All dates",
};

// Which field of an assignment each dropdown filters on.
const FILTER_FIELDS = {
  classSection: "class",
  subject: "subject",
  category3G: "category",
  assessment: "assessment",
};

const DAY_MS = 24 * 60 * 60 * 1000;

// Assumes the ActionFilters due-date options are "Overdue", "Due this week"
// and "Upcoming". Any other value falls through and does not filter.
function matchesDueDate(due, filter) {
  if (filter === FILTER_DEFAULTS.dueDate) return true;

  const dueTime = new Date(due).getTime();
  if (Number.isNaN(dueTime)) return true;

  const today = new Date().setHours(0, 0, 0, 0);

  switch (filter) {
    case "Overdue":
      return dueTime < today;
    case "Due this week":
      return dueTime >= today && dueTime <= today + 7 * DAY_MS;
    case "Upcoming":
      return dueTime > today + 7 * DAY_MS;
    default:
      return true;
  }
}

function matchesDropdowns(item, filters) {
  return Object.entries(FILTER_FIELDS).every(
    ([key, field]) =>
      filters[key] === FILTER_DEFAULTS[key] || item[field] === filters[key],
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function ActionsPage() {
  const [activeStatus, setActiveStatus] = useState("All");
  const [query, setQuery] = useState("");
  const [tableFilters, setTableFilters] = useState(FILTER_DEFAULTS);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const closeAssign = useCallback(() => setIsAssignOpen(false), []);

  const handleAssign = (payload) => {
    // TODO: send `payload` to the assign-action API. The backend should
    // resolve the matching students (same 3G category, section and subject).
    setIsAssignOpen(false);
    setNotice(
      `"${payload.activity}" assigned to ${payload.category} students · ${payload.section} · ${payload.subject}.`,
    );
  };

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return assignments.filter(
      (item) =>
        (activeStatus === "All" || item.status === activeStatus) &&
        (!search ||
          `${item.activity} ${item.student} ${item.roll}`
            .toLowerCase()
            .includes(search)) &&
        matchesDropdowns(item, tableFilters) &&
        matchesDueDate(item.due, tableFilters.dueDate),
    );
  }, [activeStatus, query, tableFilters]);

  return (
    <>
      <Header />
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
              Subject-wise support &amp; enrichment · Track assignments through
              evidence approval.
            </p>
          </div>
          <button
            onClick={() => setIsAssignOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-[#2563EB] px-3.5 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
          >
            <Plus size={15} />
            Create / Assign Action
          </button>
        </div>

        {notice && (
          <div
            role="status"
            className="flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700"
          >
            <span>{notice}</span>
            <button
              onClick={() => setNotice("")}
              className="shrink-0 font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <ActionMetrics />

        <ActionFilters filters={tableFilters} setFilters={setTableFilters} />

        {/* Status chips. p-1 keeps the active ring from being clipped. */}
        <div className="hide-scrollbar flex gap-2 overflow-x-auto p-1">
          {statuses.map((status) => (
            <Pill
              key={status}
              label={status}
              count={statusCounts[status]}
              active={activeStatus === status}
              onClick={() => setActiveStatus(status)}
              size="md"
            />
          ))}
        </div>

        <section className="overflow-hidden rounded-lg border border-[#E5EAF1] bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-[#EEF1F5] p-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-base font-semibold text-[#102746]">
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
                  {tableHeadings.map((heading) => (
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
                {filtered.map((item) => (
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
                      <Pill label={item.status} />
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
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={tableHeadings.length}
                      className="p-8 text-center text-xs text-[#71809A]"
                    >
                      No activities match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EEF1F5] px-4 py-4 text-xs text-[#71809A]">
            <span>
              Showing 1–{filtered.length} of {statusCounts.All} action
              assignments
            </span>
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

        <section className="rounded-lg border border-[#E5EAF1] bg-white p-5">
          <h2 className="text-base font-semibold text-[#102746]">
            Workflow &amp; completion rules
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {workflowRules.map(([title, detail]) => (
              <div key={title}>
                <p className="text-xs font-semibold text-[#334155]">{title}</p>
                <p className="mt-1 text-[11px] leading-5 text-[#71809A]">
                  {detail}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 border-t border-[#EEF1F5] pt-4 text-xs font-medium text-[#2563EB]">
            <Link href="/dashboard/teacher/evidence" className="py-2">
              Review {statusCounts["Under Review"]} current submissions
            </Link>
            <Link href="/dashboard/teacher/at-risk" className="py-2">
              Follow up {statusCounts.Overdue} overdue actions
            </Link>
          </div>
        </section>

        <footer className="pb-2 text-[10px] text-[#8A98AB]">
          3G · Academic insights updated 05 Oct 2026, 09:30 IST
        </footer>
      </main>

      <AssignActionModal
        isOpen={isAssignOpen}
        sections={teacherSections}
        subjects={teacherSubjects}
        onSubmit={handleAssign}
        onClose={closeAssign}
      />
    </>
  );
}
