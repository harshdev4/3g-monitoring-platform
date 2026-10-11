"use client";

import { Fragment, use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Circle, FileSearchCorner } from "lucide-react";
import Header from "@/components/dashboard/Header";

const actions = {
  1: {
    title: "Mini-Q practice sheet",
    student: "Aman Kumar",
    roll: "1021",
    className: "MCA-1A",
    subject: "DBMS",
    category: "Gradual",
    due: "10 Oct 2026",
    status: "Under Review",
    evidence: "Answer sheet",
    file: "dbms_practice_aman_v2.pdf",
    submitted: "04 Oct 2026, 14:20 IST",
    purpose: "strengthen core DBMS concepts",
    context:
      "Assigned after 32% in MSE-II and a 6-point decline from MSE-I. Focus on SQL joins, keys and normalization.",
    requirements: [
      {
        title: "Complete all 10 Mini-Q questions",
        detail:
          "Show query steps and explain the functional dependencies. Include name, roll number and date on each page.",
      },
    ],
    timeline: [
      [
        "04 Oct",
        "Revised evidence submitted",
        "dbms_practice_aman_v2.pdf · Answer sheet · Under Review",
      ],
      [
        "03 Oct",
        "First submission rejected",
        "Faculty feedback: add missing SQL query steps and rewrite normalization explanation.",
      ],
      [
        "02 Oct",
        "Activity started",
        "Aman marked the practice sheet In Progress.",
      ],
      [
        "01 Oct",
        "Action assigned",
        "Prof. Harsh Sharma assigned Mini-Q practice, due 10 Oct.",
      ],
    ],
  },
  2: {
    title: "Remedial DBMS classes",
    student: "Karan Mehta",
    roll: "1024",
    className: "MCA-1A",
    subject: "DBMS",
    category: "Gradual",
    due: "12 Oct 2026",
    status: "In Progress",
    evidence: "Attendance / completion proof",
    file: "",
    submitted: "",
    purpose: "build confidence in core DBMS topics",
    context:
      "Assigned to support foundational concepts and improve assessment performance.",
    requirements: [
      {
        title: "Attend the scheduled remedial DBMS classes",
        detail: "Submit attendance and completion proof.",
      },
    ],
    timeline: [
      [
        "02 Oct",
        "Activity started",
        "Karan started the remedial DBMS activity.",
      ],
      [
        "01 Oct",
        "Action assigned",
        "Prof. Harsh Sharma assigned the activity, due 12 Oct.",
      ],
    ],
  },
  3: {
    title: "SQL case study",
    student: "Ravi Singh",
    roll: "1022",
    className: "MCA-1A",
    subject: "DBMS",
    category: "Growing",
    due: "14 Oct 2026",
    status: "Assigned",
    evidence: "Project document",
    file: "",
    submitted: "",
    purpose: "apply SQL concepts to a practical case",
    context:
      "An enrichment activity to strengthen database design and query writing.",
    requirements: [
      {
        title: "Complete the SQL case study",
        detail: "Submit the project document with queries and outputs.",
      },
    ],
    timeline: [
      [
        "01 Oct",
        "Action assigned",
        "Prof. Harsh Sharma assigned the case study, due 14 Oct.",
      ],
    ],
  },
  4: {
    title: "Advanced database project",
    student: "Neha Sharma",
    roll: "1023",
    className: "MCA-1A",
    subject: "DBMS",
    category: "Gallant",
    due: "16 Oct 2026",
    status: "Evidence Submitted",
    evidence: "Project document",
    file: "advanced_database_project.pdf",
    submitted: "05 Oct 2026, 11:40 IST",
    purpose: "extend database design and implementation skills",
    context:
      "An advanced project exploring practical database design and implementation.",
    requirements: [
      {
        title: "Complete the advanced database project",
        detail: "Submit the project document and implementation evidence.",
      },
    ],
    timeline: [
      [
        "05 Oct",
        "Evidence submitted",
        "Project document is awaiting faculty review.",
      ],
      [
        "01 Oct",
        "Action assigned",
        "Prof. Harsh Sharma assigned the project, due 16 Oct.",
      ],
    ],
  },
  5: {
    title: "Seminar participation",
    student: "Aman Kumar",
    roll: "1021",
    className: "MCA-1A",
    subject: "DBMS",
    category: "Gradual",
    due: "29 Sep 2026",
    status: "Approved",
    evidence: "Participation proof",
    file: "seminar_participation_aman.pdf",
    submitted: "28 Sep 2026, 16:10 IST",
    purpose: "encourage active participation in subject seminars",
    context: "Participation in a DBMS seminar activity.",
    requirements: [
      { title: "Attend the seminar", detail: "Submit participation proof." },
    ],
    timeline: [
      [
        "29 Sep",
        "Evidence approved",
        "Participation evidence verified by faculty.",
      ],
      ["28 Sep", "Evidence submitted", "Aman submitted participation proof."],
      [
        "20 Sep",
        "Action assigned",
        "Prof. Harsh Sharma assigned seminar participation.",
      ],
    ],
  },
  6: {
    title: "SQL revision worksheet",
    student: "Pooja Verma",
    roll: "1025",
    className: "MCA-1A",
    subject: "DBMS",
    category: "Growing",
    due: "03 Oct 2026",
    status: "Rejected",
    evidence: "Answer sheet",
    file: "sql_revision_pooja.pdf",
    submitted: "03 Oct 2026, 13:05 IST",
    purpose: "reinforce SQL query writing",
    context: "A focused revision activity covering core SQL concepts.",
    requirements: [
      {
        title: "Complete the SQL revision worksheet",
        detail: "Show the working for each answer.",
      },
    ],
    timeline: [
      [
        "03 Oct",
        "Submission rejected",
        "Faculty requested clearer working for the query answers.",
      ],
      ["02 Oct", "Evidence submitted", "Pooja submitted the answer sheet."],
      [
        "25 Sep",
        "Action assigned",
        "Prof. Harsh Sharma assigned the revision worksheet.",
      ],
    ],
  },
  7: {
    title: "DAA concept recap",
    student: "Sahil Gupta",
    roll: "1048",
    className: "MCA-1B",
    subject: "DAA",
    category: "Gradual",
    due: "02 Oct 2026",
    status: "Overdue",
    evidence: "Faculty confirmation",
    file: "",
    submitted: "",
    purpose: "reinforce core algorithm design concepts",
    context:
      "A guided recap to support progress in Design and Analysis of Algorithms.",
    requirements: [
      {
        title: "Complete the assigned concept recap",
        detail: "Meet with faculty and confirm completion.",
      },
    ],
    timeline: [
      [
        "01 Oct",
        "Reminder due",
        "The activity has passed its due date and needs follow-up.",
      ],
      [
        "22 Sep",
        "Action assigned",
        "Prof. Harsh Sharma assigned the concept recap.",
      ],
    ],
  },
};

const statusStyles = {
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

const categoryStyles = {
  Gradual: { pill: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
  Growing: { pill: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  Gallant: { pill: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};

const fallbackStyle = {
  pill: "bg-slate-100 text-slate-600",
  dot: "bg-slate-400",
};

const LATEST_FEEDBACK =
  "Review version 2 against the requested corrections. Approve only when the query steps and normalization reasoning are complete.";

const progressGroups = [
  {
    steps: [
      { label: "Practice completed", done: true },
      { label: "Answer sheet uploaded", done: true },
    ],
    detail: "Student completed the questions and submitted version 2 for review.",
  },
  {
    steps: [
      { label: "Revised submission", done: true },
      { label: "Approval pending", done: false },
    ],
    detail:
      "Version 1 was rejected for missing query steps. Faculty must verify the revised work.",
  },
];

const cardClass = "rounded-lg border border-[#E5EAF1] bg-white p-5";
const cardTitle = "text-base font-semibold text-[#102746]";
const outlineButton =
  "inline-flex h-9 items-center justify-center rounded-md border border-[#DCE3EC] bg-white px-4 text-xs font-medium text-[#102746] hover:bg-[#F8FAFC]";

function Pill({ label, style = fallbackStyle }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${style.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {label}
    </span>
  );
}

function Notice({ notice, card }) {
  if (notice?.card !== card) return null;
  return <p className="mt-3 text-[11px] text-[#2563EB]">{notice.text}</p>;
}

export default function ActionDetailPage({ params }) {
  const { id } = use(params);
  const action = actions[id] || actions[1];
  const [notice, setNotice] = useState(null);

  const notify = (card, text) => setNotice({ card, text });
  const canReview =
    action.status === "Under Review" || action.status === "Evidence Submitted";
  const percent = canReview
    ? 75
    : action.status === "Approved"
      ? 100
      : action.status === "In Progress"
        ? 25
        : 0;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1500px] space-y-4 p-4 sm:p-5 lg:p-6">
        {/* Page header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px] text-[#71809A]">
              <Link href="/dashboard/teacher" className="hover:text-[#2563EB]">
                Teacher workspace
              </Link>
              <span>/</span>
              <Link
                href="/dashboard/teacher/actions"
                className="hover:text-[#2563EB]"
              >
                Activities / Actions
              </Link>
              <span>/</span>
              <span className="font-medium text-[#52627A]">
                ACT-2026-{String(Number(id) + 17).padStart(3, "0")}
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-[#102746]">
              {action.title}
            </h1>
            <p className="mt-1 text-xs text-[#71809A]">
              {action.subject} · {action.category} · Assigned to{" "}
              {action.student} · Due {action.due}
            </p>
          </div>
          <button className="inline-flex h-9 items-center rounded-md bg-[#2563EB] px-4 text-xs font-medium text-white hover:bg-[#1D4ED8]">
            Edit action
          </button>
        </div>

        {/* Review banner */}
        {action.status === "Under Review" && (
          <section className="mt-3 flex items-start gap-2 rounded-md border-l-2 border-[#2563EB] bg-[#EEF5FF] p-4">
            <FileSearchCorner size={16} className="mt-0.5 shrink-0 text-blue-600" />
            <div>
              <h2 className="text-[13px] font-semibold text-blue-700">
                Evidence is ready for review
              </h2>
              <p className="mt-0.5 text-xs leading-5 text-[#52627A]">
                {action.student} submitted the revised answer sheet on 04 Oct.
                Approval is required before this action is complete.
              </p>
            </div>
          </section>
        )}

        {/* Row 1: requirements + progress */}
        <section className="grid items-start gap-4 lg:grid-cols-2">
          <div className={cardClass}>
            <h2 className={cardTitle}>Action requirements</h2>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Pill label={action.status} style={statusStyles[action.status]} />
              <Pill
                label={action.category}
                style={categoryStyles[action.category]}
              />
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <h3 className="text-[15px] font-semibold text-[#102746]">
                  Purpose: {action.purpose}
                </h3>
                <p className="mt-1 text-[13px] leading-5 text-[#71809A]">
                  {action.context}
                </p>
              </div>

              {action.requirements.map(({ title, detail }) => (
                <div key={title}>
                  <h3 className="text-[15px] font-semibold text-[#102746]">
                    {title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-5 text-[#71809A]">
                    {detail}
                  </p>
                </div>
              ))}

              <div>
                <h3 className="text-[15px] font-semibold text-[#102746]">
                  Evidence required: {action.evidence.toLowerCase()}
                </h3>
                <p className="mt-1 text-[13px] leading-5 text-[#71809A]">
                  PDF or clear JPG/PNG · Up to 10 MB · All pages in order,
                  legible and complete.
                </p>
              </div>

              <p className="text-xs text-[#71809A]">
                Faculty: Prof. Harsh Sharma · Assigned 01 Oct · Due {action.due}
                , 23:59 IST
              </p>
            </div>
          </div>

          <div className={cardClass}>
            <h2 className={cardTitle}>Progress &amp; completion</h2>

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="font-semibold text-[#102746]">
                Requirements completed
              </span>
              <span className="text-[#52627A]">{percent}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EEF1F5]">
              <div
                className="h-full rounded-full bg-[#2563EB]"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-[#71809A]">
              {percent === 75
                ? "3 of 4 steps · Awaiting faculty approval"
                : percent === 100
                  ? "4 of 4 steps · Approved"
                  : `${Math.round(percent / 25)} of 4 steps · ${action.status}`}
            </p>

            <div className="mt-5 space-y-4">
              {progressGroups.map(({ steps, detail }) => (
                <div key={steps[0].label}>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-semibold text-[#102746]">
                    {steps.map((step, index) => (
                      <Fragment key={step.label}>
                        {index > 0 && (
                          <span className="text-[#8A98AB]">·</span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          {step.done ? (
                            <Check
                              size={13}
                              strokeWidth={3}
                              className="text-[#10B981]"
                            />
                          ) : (
                            <Circle size={11} className="text-[#71809A]" />
                          )}
                          {step.label}
                        </span>
                      </Fragment>
                    ))}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#71809A]">
                    {detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {canReview && (
                <Link
                  href="/dashboard/teacher/evidence"
                  className="inline-flex h-9 items-center rounded-md bg-[#2563EB] px-4 text-xs font-medium text-white hover:bg-[#1D4ED8]"
                >
                  Review Evidence
                </Link>
              )}
              <button
                onClick={() =>
                  notify("progress", `Reminder sent to ${action.student}.`)
                }
                className={outlineButton}
              >
                Send reminder
              </button>
            </div>
            <Notice notice={notice} card="progress" />
          </div>
        </section>

        {/* Row 2: assigned students */}
        <section className={cardClass}>
          <h2 className={cardTitle}>Assigned students</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-[#F8FAFC] [&>tr>th:first-child]:rounded-l-md [&>tr>th:last-child]:rounded-r-md">
                <tr>
                  {[
                    "Student",
                    "Roll",
                    "Class",
                    "Subject category",
                    "Due date",
                    "Evidence",
                    "Status",
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
                <tr className="border-b border-[#EEF1F5]">
                  <td className="px-4 py-4 text-[13px] text-[#102746]">
                    {action.student}
                  </td>
                  <td className="px-4 py-4 text-[13px] text-[#102746]">
                    {action.roll}
                  </td>
                  <td className="px-4 py-4 text-[13px] text-[#102746]">
                    {action.className}
                  </td>
                  <td className="px-4 py-4">
                    <Pill
                      label={action.category}
                      style={categoryStyles[action.category]}
                    />
                  </td>
                  <td className="px-4 py-4 text-[13px] text-[#102746]">
                    {action.due}
                  </td>
                  <td className="px-4 py-4 text-[13px] text-[#102746]">
                    {action.evidence}
                    {action.file && " · v2"}
                  </td>
                  <td className="px-4 py-4">
                    <Pill
                      label={action.status}
                      style={statusStyles[action.status]}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Row 3: timeline + evidence notes */}
        <section className="grid items-start gap-4 lg:grid-cols-2">
          <div className={cardClass}>
            <h2 className={cardTitle}>Activity timeline</h2>
            <div className="mt-4 space-y-4">
              {action.timeline.map(([date, title, detail]) => (
                <div key={`${date}-${title}`}>
                  <p className="text-[13px] font-semibold text-[#102746]">
                    {date} · {title}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-[#71809A]">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <h2 className={cardTitle}>Evidence &amp; faculty notes</h2>

            <div className="mt-4 space-y-5">
              {action.file ? (
                <div>
                  <p className="text-[13px] font-semibold text-[#102746]">
                    Current file: {action.file}
                  </p>
                  <p className="mt-0.5 text-xs text-[#71809A]">
                    1.8 MB · 4 pages · Submitted {action.submitted}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        notify(
                          "evidence",
                          "Preview is unavailable for this sample file.",
                        )
                      }
                      className={outlineButton}
                    >
                      Preview submission
                    </button>
                    <button
                      onClick={() =>
                        notify(
                          "evidence",
                          "The sample file is not attached to this workspace.",
                        )
                      }
                      className={outlineButton}
                    >
                      Download
                    </button>
                  </div>
                  <Notice notice={notice} card="evidence" />
                </div>
              ) : (
                <p className="rounded-md bg-[#F8FAFC] p-3 text-xs text-[#71809A]">
                  No evidence submitted yet.
                </p>
              )}

              <div>
                <h3 className="text-[13px] font-semibold text-[#102746]">
                  Latest feedback
                </h3>
                <p className="mt-0.5 text-xs leading-5 text-[#71809A]">
                  {LATEST_FEEDBACK}
                </p>
              </div>

              <div>
                <h3 className="text-[13px] font-semibold text-[#102746]">
                  Next academic checkpoint
                </h3>
                <p className="mt-0.5 text-xs leading-5 text-[#71809A]">
                  Target ≥ 40% DBMS marks. Record outcome after the remedial
                  assessment.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-2 pb-2 text-[10px] text-[#8A98AB]">
          <span>3G · Academic insights updated 05 Oct 2026, 09:30 IST</span>
          <Link
            href="/dashboard/teacher/actions"
            className="inline-flex items-center gap-1 hover:text-[#2563EB]"
          >
            <ArrowLeft size={12} />
            Back to Activities / Actions
          </Link>
        </footer>
      </main>
    </>
  );
}