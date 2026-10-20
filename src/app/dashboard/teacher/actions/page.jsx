"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import useActivitiesStore from "@/store/useActivitiesStore";
import useTeacherStore from "@/store/useTeacherStore";

/* -------------------------------------------------------------------------- */
/*  Static UI config (labels only, no data)                                   */
/* -------------------------------------------------------------------------- */

const PAGE_SIZE = 10;

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

const VIEWS = {
  activities: {
    label: "Activities",
    title: "Activities",
    description:
      "Activities you created. Each one is assigned to every matching student.",
    search: "Search activity or subject",
  },
  submissions: {
    label: "Student submissions",
    title: "Student submissions",
    description:
      "Students do these and upload evidence. Review it, then approve or reject with feedback.",
    search: "Search activity, student, roll number or subject",
  },
  tasks: {
    label: "My tasks",
    title: "My tasks",
    description:
      "Teacher-only actions. Respond to each one and submit your evidence.",
    search: "Search activity, student, roll number or subject",
  },
};

const assignmentHeadings = [
  "Activity / student",
  "Subject / 3G",
  "Due date",
  "Evidence required",
  "Progress",
  "Status",
  "Action",
];

const activityHeadings = [
  "Activity",
  "Subject / section",
  "Target 3G",
  "Performed by",
  "Assessment",
  "Due date",
  "Evidence required",
  "Students",
  "Approved",
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
    "Teacher-only tasks",
    "You respond and submit the evidence yourself; there is no student upload.",
  ],
  [
    "Overdue requires a follow-up",
    "An incomplete action past its due date is flagged for faculty attention.",
  ],
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const unique = (values) => [...new Set(values.filter(Boolean))];

// DATE columns arrive as "YYYY-MM-DD". Parse as local time so the day never
// shifts with the viewer's timezone.
function parseDate(value) {
  if (!value) return null;
  const [y, m, d] = String(value).slice(0, 10).split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseDate(value);
  return date
    ? date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
}

// "DBMS101 · Database Management Systems"
function subjectLabel({ courseCode, courseName }) {
  return courseName && courseName !== courseCode
    ? `${courseCode} · ${courseName}`
    : courseCode;
}

function countStatuses(list) {
  const counts = Object.fromEntries(statuses.map((s) => [s, 0]));
  counts.All = list.length;
  list.forEach((a) => {
    counts[a.status] = (counts[a.status] ?? 0) + 1;
  });
  return counts;
}

/* -------------------------------------------------------------------------- */
/*  Filtering                                                                 */
/* -------------------------------------------------------------------------- */

const FILTER_DEFAULTS = {
  classSection: "All assigned classes",
  subject: "All subjects",
  category3G: "All categories",
  assessment: "All assessments",
  dueDate: "All dates",
};

// Fields each dropdown may match on. Subject matches the code or the name.
const FILTER_FIELDS = {
  classSection: ["section"],
  subject: ["courseName", "courseCode"],
  category3G: ["category"],
  assessment: ["assessment"],
};

const DAY_MS = 24 * 60 * 60 * 1000;

// Assumes the ActionFilters due-date options are "Overdue", "Due this week"
// and "Upcoming". Any other value does not filter.
function matchesDueDate(dueDate, filter) {
  if (filter === FILTER_DEFAULTS.dueDate) return true;

  const due = parseDate(dueDate);
  if (!due) return true;

  const dueTime = due.getTime();
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
    ([key, fields]) =>
      filters[key] === FILTER_DEFAULTS[key] ||
      fields.some((field) => item[field] === filters[key]),
  );
}

/* -------------------------------------------------------------------------- */
/*  Metrics                                                                   */
/* -------------------------------------------------------------------------- */

function ActionMetrics({ counts, sections }) {
  const total = counts.All;
  const approvedShare = total ? Math.round((counts.Approved / total) * 100) : 0;

  const metrics = [
    {
      label: "Actions assigned",
      value: total,
      description: sections.length
        ? `Across ${sections.join(" & ")}`
        : "No sections yet",
      icon: ClipboardList,
      iconClassName: "text-[#2563EB]",
    },
    {
      label: "Approved",
      value: counts.Approved,
      description: `${approvedShare}% completed & verified`,
      icon: Check,
      iconClassName: "text-[#10B981]",
    },
    {
      label: "In Progress",
      value: counts["In Progress"],
      description: "Active work",
      icon: Clock3,
      iconClassName: "text-[#F59E0B]",
    },
    {
      label: "Needs review / follow-up",
      value: counts["Under Review"] + counts.Overdue,
      description: `${counts["Under Review"]} under review · ${counts.Overdue} overdue`,
      icon: FileCheck2,
      iconClassName: "text-[#EF4444]",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map(
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
/*  Table rows                                                                */
/* -------------------------------------------------------------------------- */

const cell = "px-4 py-3.5 text-[13px] text-[#52627A]";
const linkClass =
  "whitespace-nowrap text-[13px] font-medium text-[#2563EB] hover:underline";

function AssignmentRow({ item }) {
  const teacherTask = item.performedBy === "Teacher";
  return (
    <tr className="border-t border-[#EEF1F5] transition-colors hover:bg-[#F8FAFC]">
      <td className="px-4 py-3.5">
        <p className="text-[13px] font-medium text-[#102746]">{item.title}</p>
        <p className="mt-0.5 text-[13px] text-[#52627A]">
          {item.studentName} · {item.roll}
        </p>
      </td>
      <td className="px-4 py-3.5 text-[13px] text-[#334155]">
        <p>{subjectLabel(item)}</p>
        <p className="mt-0.5 text-[#52627A]">
          {item.section}
          {item.category ? ` · ${item.category}` : ""}
        </p>
      </td>
      <td className={cell}>{formatDate(item.dueDate)}</td>
      <td className={cell}>
        <p>{item.evidenceRequired || "—"}</p>
        {item.submittedEvidenceUrl && (
          <a
            href={item.submittedEvidenceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-[#2563EB] hover:underline"
          >
            {teacherTask ? "View my evidence" : "View submission"}
          </a>
        )}
      </td>
      <td className={cell}>
        {item.completedSteps} / {item.totalSteps} steps
      </td>
      <td className="px-4 py-3.5">
        <Pill label={item.status} />
      </td>
      <td className="px-4 py-3.5">
        <Link
          href={`/dashboard/teacher/actions/${item.assignmentId}`}
          className={linkClass}
        >
          {teacherTask ? "Respond & submit" : "Review"}
        </Link>
      </td>
    </tr>
  );
}

function ActivityRow({ item }) {
  return (
    <tr className="border-t border-[#EEF1F5] transition-colors hover:bg-[#F8FAFC]">
      <td className="px-4 py-3.5">
        <p className="text-[13px] font-medium text-[#102746]">{item.title}</p>
        {item.description && (
          <p className="mt-0.5 line-clamp-1 text-[13px] text-[#52627A]">
            {item.description}
          </p>
        )}
      </td>
      <td className="px-4 py-3.5 text-[13px] text-[#334155]">
        <p>{subjectLabel(item)}</p>
        <p className="mt-0.5 text-[#52627A]">{item.section}</p>
      </td>
      <td className={cell}>{item.category || "All"}</td>
      <td className={cell}>{item.performedBy}</td>
      <td className={cell}>{item.assessment}</td>
      <td className={cell}>{formatDate(item.dueDate)}</td>
      <td className={cell}>{item.evidenceRequired || "—"}</td>
      <td className={cell}>{item.studentCount}</td>
      <td className={cell}>
        {item.approvedCount} / {item.studentCount}
      </td>
      <td className="px-4 py-3.5">
        <Link
          href={`/dashboard/teacher/activities/${item.activityId}`}
          className={linkClass}
        >
          View Activity
        </Link>
      </td>
    </tr>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function ActionsPage() {
  // Store data. Nothing on this page is defined locally.
  const activities = useActivitiesStore((s) => s.activities);
  const assignments = useActivitiesStore((s) => s.assignments);
  const loading = useActivitiesStore((s) => s.loading);
  const error = useActivitiesStore((s) => s.error);
  const fetchActivities = useActivitiesStore((s) => s.fetchActivities);
  const createActivity = useActivitiesStore((s) => s.createActivity);
  const empId = useTeacherStore((s) => s.empId);
  const assignedCourses = useTeacherStore((s) => s.assignedCourses);

  const [view, setView] = useState("submissions");
  const [activeStatus, setActiveStatus] = useState("All");
  const [query, setQuery] = useState("");
  const [tableFilters, setTableFilters] = useState(FILTER_DEFAULTS);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [notice, setNotice] = useState("");

  // The page number is remembered together with the filters it was chosen
  // under. If any filter changes, the key no longer matches and we fall back
  // to page 1, with no effect needed.
  const filterKey = JSON.stringify([view, activeStatus, query, tableFilters]);
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;
  const setPage = (next) => setPageState({ key: filterKey, page: next });

  // Load from the API once the teacher is known.
  useEffect(() => {
    if (empId) fetchActivities(empId);
  }, [empId, fetchActivities]);

  const closeAssign = useCallback(() => setIsAssignOpen(false), []);

  // Modal options come from the teacher's assigned courses. Field names are
  // read defensively; align them with your assignedCourses shape.
  const { teacherSections, teacherSubjects } = useMemo(() => {
    const sections = unique(
      assignedCourses.map((c) => c.section ?? c.className),
    );
    const byCode = new Map();
    assignedCourses.forEach((c) => {
      const code = c.courseCode ?? c.course_code;
      if (code && !byCode.has(code)) {
        byCode.set(code, {
          code,
          name: c.courseName ?? c.course_name ?? code,
        });
      }
    });
    return {
      teacherSections: ["All sections", ...sections],
      teacherSubjects: [...byCode.values()],
    };
  }, [assignedCourses]);

  // Student-performed work is reviewed; teacher-performed work is answered.
  const studentRows = useMemo(
    () => assignments.filter((a) => a.performedBy !== "Teacher"),
    [assignments],
  );
  const teacherRows = useMemo(
    () => assignments.filter((a) => a.performedBy === "Teacher"),
    [assignments],
  );

  // Roll the per-student rows up onto their parent activity.
  const activityRows = useMemo(() => {
    const byActivity = new Map();
    assignments.forEach((a) => {
      const entry = byActivity.get(a.activityId) ?? { total: 0, approved: 0 };
      entry.total += 1;
      if (a.status === "Approved") entry.approved += 1;
      byActivity.set(a.activityId, entry);
    });
    return activities.map((a) => ({
      ...a,
      studentCount: byActivity.get(a.activityId)?.total ?? 0,
      approvedCount: byActivity.get(a.activityId)?.approved ?? 0,
    }));
  }, [activities, assignments]);

  const allCounts = useMemo(() => countStatuses(assignments), [assignments]);

  const isActivities = view === "activities";
  const scope = view === "tasks" ? teacherRows : studentRows;
  const scopeCounts = useMemo(() => countStatuses(scope), [scope]);

  const sectionsInUse = useMemo(
    () => unique(assignments.map((a) => a.section)).sort(),
    [assignments],
  );

  const lastUpdated = useMemo(() => {
    const times = assignments
      .map((a) => new Date(a.updatedAt).getTime())
      .filter((t) => !Number.isNaN(t));
    return times.length ? new Date(Math.max(...times)) : null;
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    const search = query.trim().toLowerCase();
    return scope.filter(
      (item) =>
        (activeStatus === "All" || item.status === activeStatus) &&
        (!search ||
          `${item.title} ${item.studentName} ${item.roll} ${item.courseCode} ${item.courseName}`
            .toLowerCase()
            .includes(search)) &&
        matchesDropdowns(item, tableFilters) &&
        matchesDueDate(item.dueDate, tableFilters.dueDate),
    );
  }, [scope, activeStatus, query, tableFilters]);

  const filteredActivities = useMemo(() => {
    const search = query.trim().toLowerCase();
    return activityRows.filter(
      (item) =>
        (!search ||
          `${item.title} ${item.courseCode} ${item.courseName}`
            .toLowerCase()
            .includes(search)) &&
        matchesDropdowns(item, tableFilters) &&
        matchesDueDate(item.dueDate, tableFilters.dueDate),
    );
  }, [activityRows, query, tableFilters]);

  const rows = isActivities ? filteredActivities : filteredAssignments;
  const totalAll = isActivities ? activities.length : scope.length;
  const tabCounts = {
    activities: activities.length,
    submissions: studentRows.length,
    tasks: teacherRows.length,
  };

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);

  // Throws on failure so the modal can show the error and stay open.
  const handleAssign = async (payload) => {
    await createActivity(empId, payload);
    setIsAssignOpen(false);
    setNotice(
      `"${payload.activity}" assigned to ${payload.category} students · ${payload.section} · ${payload.courseCode}.`,
    );
  };

  const emptyMessage = loading
    ? "Loading…"
    : error
      ? `Could not load activities (${error}). Refresh the page to try again.`
      : !empId
        ? "Waiting for your teacher profile to load…"
        : totalAll === 0
          ? "Nothing here yet. Use Create / Assign Action to start."
          : "No activities match your filters.";

  const headings = isActivities ? activityHeadings : assignmentHeadings;
  const meta = VIEWS[view];

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
              Create an activity from the 3G policy, then track each student
              through evidence approval.
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

        <ActionMetrics counts={allCounts} sections={sectionsInUse} />

        <ActionFilters filters={tableFilters} setFilters={setTableFilters} />

        <div
          role="tablist"
          className="inline-flex rounded-md border border-[#DCE3EC] bg-white p-0.5"
        >
          {Object.entries(VIEWS).map(([key, { label }]) => (
            <button
              key={key}
              role="tab"
              aria-selected={view === key}
              onClick={() => setView(key)}
              className={`h-8 rounded px-3 text-xs font-medium ${
                view === key
                  ? "bg-[#2563EB] text-white"
                  : "text-[#52627A] hover:bg-[#F8FAFC]"
              }`}
            >
              {label} ({tabCounts[key]})
            </button>
          ))}
        </div>

        {/* Status chips apply to the two assignment views. p-1 keeps the ring unclipped. */}
        {!isActivities && (
          <div className="hide-scrollbar flex gap-2 overflow-x-auto p-1">
            {statuses.map((status) => (
              <Pill
                key={status}
                label={status}
                count={scopeCounts[status]}
                active={activeStatus === status}
                onClick={() => setActiveStatus(status)}
                size="md"
              />
            ))}
          </div>
        )}

        <section className="overflow-hidden rounded-lg border border-[#E5EAF1] bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-[#EEF1F5] p-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-base font-semibold text-[#102746]">
                {meta.title}
              </h2>
              <p className="mt-1 text-xs text-[#71809A]">{meta.description}</p>
            </div>
            <label className="relative block w-full md:w-80">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A98AB]"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={meta.search}
                className="h-9 w-full rounded-md border border-[#DCE3EC] pl-9 pr-3 text-xs outline-none focus:border-[#2563EB]"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  {headings.map((heading) => (
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
                {pageRows.map((item) =>
                  isActivities ? (
                    <ActivityRow key={item.activityId} item={item} />
                  ) : (
                    <AssignmentRow key={item.assignmentId} item={item} />
                  ),
                )}
                {pageRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={headings.length}
                      className="p-8 text-center text-xs text-[#71809A]"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EEF1F5] px-4 py-4 text-xs text-[#71809A]">
            <span>
              {rows.length === 0
                ? `Showing 0 of ${totalAll}`
                : `Showing ${start + 1}–${start + pageRows.length} of ${rows.length}${
                    rows.length !== totalAll ? ` (${totalAll} total)` : ""
                  }`}
            </span>
            <div className="flex items-center gap-2 text-[#102746]">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-10 rounded-lg border border-[#E5EAF1] bg-white px-4 text-xs font-medium hover:bg-[#F8FAFC] disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2">
                Page {currentPage} of {pageCount}
              </span>
              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === pageCount}
                className="h-10 rounded-lg border border-[#E5EAF1] bg-white px-4 text-xs font-medium hover:bg-[#F8FAFC] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#E5EAF1] bg-white p-5">
          <h2 className="text-base font-semibold text-[#102746]">
            Workflow &amp; completion rules
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
              Review {allCounts["Under Review"]} current submissions
            </Link>
            <Link href="/dashboard/teacher/at-risk" className="py-2">
              Follow up {allCounts.Overdue} overdue actions
            </Link>
          </div>
        </section>

        <footer className="pb-2 text-[10px] text-[#8A98AB]">
          3G ·{" "}
          {lastUpdated
            ? `Last activity update ${lastUpdated.toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : "No updates yet"}
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