"use client";

import { Fragment, use, useCallback, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Download,
  Eye,
  FileSearchCorner,
  FileText,
  MessageSquare,
} from "lucide-react";
import Header from "@/components/dashboard/Header";
import Pill from "@/components/teacher/Pill";
import DocumentPreviewModal from "@/components/teacher/DocumentPreviewModal";

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
      ["04 Oct", "Revised evidence submitted", "dbms_practice_aman_v2.pdf · Answer sheet · Under Review"],
      ["03 Oct", "First submission rejected", "Faculty feedback: add missing SQL query steps and rewrite normalization explanation."],
      ["02 Oct", "Activity started", "Aman marked the practice sheet In Progress."],
      ["01 Oct", "Action assigned", "Prof. Harsh Sharma assigned Mini-Q practice, due 10 Oct."],
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
    context: "Assigned to support foundational concepts and improve assessment performance.",
    requirements: [
      { title: "Attend the scheduled remedial DBMS classes", detail: "Submit attendance and completion proof." },
    ],
    timeline: [
      ["02 Oct", "Activity started", "Karan started the remedial DBMS activity."],
      ["01 Oct", "Action assigned", "Prof. Harsh Sharma assigned the activity, due 12 Oct."],
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
    context: "An enrichment activity to strengthen database design and query writing.",
    requirements: [
      { title: "Complete the SQL case study", detail: "Submit the project document with queries and outputs." },
    ],
    timeline: [
      ["01 Oct", "Action assigned", "Prof. Harsh Sharma assigned the case study, due 14 Oct."],
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
    context: "An advanced project exploring practical database design and implementation.",
    requirements: [
      { title: "Complete the advanced database project", detail: "Submit the project document and implementation evidence." },
    ],
    timeline: [
      ["05 Oct", "Evidence submitted", "Project document is awaiting faculty review."],
      ["01 Oct", "Action assigned", "Prof. Harsh Sharma assigned the project, due 16 Oct."],
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
    requirements: [{ title: "Attend the seminar", detail: "Submit participation proof." }],
    timeline: [
      ["29 Sep", "Evidence approved", "Participation evidence verified by faculty."],
      ["28 Sep", "Evidence submitted", "Aman submitted participation proof."],
      ["20 Sep", "Action assigned", "Prof. Harsh Sharma assigned seminar participation."],
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
    requirements: [{ title: "Complete the SQL revision worksheet", detail: "Show the working for each answer." }],
    timeline: [
      ["03 Oct", "Submission rejected", "Faculty requested clearer working for the query answers."],
      ["02 Oct", "Evidence submitted", "Pooja submitted the answer sheet."],
      ["25 Sep", "Action assigned", "Prof. Harsh Sharma assigned the revision worksheet."],
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
    context: "A guided recap to support progress in Design and Analysis of Algorithms.",
    requirements: [{ title: "Complete the assigned concept recap", detail: "Meet with faculty and confirm completion." }],
    timeline: [
      ["01 Oct", "Reminder due", "The activity has passed its due date and needs follow-up."],
      ["22 Sep", "Action assigned", "Prof. Harsh Sharma assigned the concept recap."],
    ],
  },
};

const cardClass = "rounded-lg border border-[#E5EAF1] bg-white p-5";
const cardTitle = "text-base font-semibold text-[#102746]";
const outlineButton = "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border border-[#DCE3EC] bg-white px-3.5 py-2 text-xs font-medium text-[#102746] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50";
const primaryButton = "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md bg-[#2563EB] px-3.5 py-2 text-xs font-medium text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50";

function Notice({ notice, card }) {
  if (notice?.card !== card) return null;
  return <p role="status" className="mt-3 text-xs text-[#2563EB]">{notice.text}</p>;
}

function getSeedNote(action) {
  if (action.status === "Rejected") {
    return "Please clarify the working for each SQL query and resubmit the corrected answers.";
  }
  if (action.status === "Approved") {
    return "Evidence checked and approved. Keep a copy for your academic record.";
  }
  if (action.status === "Evidence Submitted") {
    return "Evidence received. Review the project document and implementation details before approval.";
  }
  return "Review the submission against the requested corrections. Approve only when all required steps are complete.";
}

function createInitialNotes(action) {
  return [
    {
      id: "initial",
      author: "Prof. Harsh Sharma",
      timestamp: action.submitted || "01 Oct 2026",
      text: getSeedNote(action),
    },
  ];
}

const formatNow = () =>
  new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

// All page state lives here. The default export below renders this with
// key={id}, so opening a different action remounts it with fresh state.
function ActionDetail({ id, action }) {
  const [currentStatus, setCurrentStatus] = useState(action.status);
  const [notice, setNotice] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [facultyNotes, setFacultyNotes] = useState(() => createInitialNotes(action));

  const closePreview = useCallback(() => setPreviewOpen(false), []);

  const evidenceUrl = action.file
    ? `/sample-documents/${encodeURIComponent(action.file)}`
    : null;
  const canReview =
    Boolean(action.file) &&
    (currentStatus === "Under Review" || currentStatus === "Evidence Submitted");
  const percent =
    currentStatus === "Approved"
      ? 100
      : currentStatus === "Rejected" || currentStatus === "Revision Requested"
        ? 50
        : currentStatus === "Under Review" || currentStatus === "Evidence Submitted"
          ? 75
          : currentStatus === "In Progress"
            ? 25
            : 0;
  const progressText =
    currentStatus === "Approved"
      ? "4 of 4 steps · Approved"
      : currentStatus === "Revision Requested"
        ? "2 of 4 steps · Revision requested"
        : currentStatus === "Rejected"
          ? "2 of 4 steps · Rejected"
          : currentStatus === "Under Review" || currentStatus === "Evidence Submitted"
            ? "3 of 4 steps · Awaiting faculty review"
            : currentStatus === "In Progress"
              ? "1 of 4 steps · Student activity in progress"
              : `${Math.round(percent / 25)} of 4 steps · ${currentStatus}`;

  // Called by DocumentPreviewModal when the teacher picks a decision.
  const handleDecision = ({ status, note }) => {
    setCurrentStatus(status);
    setFacultyNotes((previous) => [
      {
        id: `${Date.now()}-${status}`,
        author: "Prof. Harsh Sharma",
        timestamp: formatNow(),
        text: note
          ? `${status}: ${note}`
          : `Evidence approved for ${action.title}. The submission meets the requirements.`,
      },
      ...previous,
    ]);
    setNotice({
      card: "evidence",
      text: `Demo status updated to “${status}”. Connect this handler to your API to persist the decision.`,
    });
  };

  const addFacultyNote = (event) => {
    event.preventDefault();
    const text = newNote.trim();
    if (!text) {
      setNotice({ card: "notes", text: "Enter a note before adding it." });
      return;
    }

    setFacultyNotes((previous) => [
      {
        id: `${Date.now()}-note`,
        author: "Prof. Harsh Sharma",
        timestamp: formatNow(),
        text,
      },
      ...previous,
    ]);
    setNewNote("");
    setNotice({ card: "notes", text: "Faculty note added to this demo view." });
  };

  const stageItems = [
    { label: "Action assigned", done: true },
    { label: "Student activity", done: ["In Progress", "Evidence Submitted", "Under Review", "Revision Requested", "Approved", "Rejected"].includes(currentStatus) },
    { label: "Evidence received", done: Boolean(action.file) },
    { label: "Faculty approval", done: currentStatus === "Approved" },
  ];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1500px] space-y-4 p-4 sm:p-5 lg:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px] text-[#71809A]">
              <Link href="/dashboard/teacher" className="hover:text-[#2563EB]">Teacher workspace</Link>
              <span>/</span>
              <Link href="/dashboard/teacher/actions" className="hover:text-[#2563EB]">Activities / Actions</Link>
              <span>/</span>
              <span className="font-medium text-[#52627A]">ACT-2026-{String(Number(id) + 17).padStart(3, "0")}</span>
            </div>
            <h1 className="text-2xl font-semibold text-[#102746]">{action.title}</h1>
            <p className="mt-1 text-xs text-[#71809A]">
              {action.subject} · {action.category} · Assigned to {action.student} · Due {action.due}
            </p>
          </div>
          <Link href="/dashboard/teacher/actions" className={outlineButton}>
            <ArrowLeft size={14} /> Back to actions
          </Link>
        </div>

        {canReview && (
          <section className="flex items-start gap-2 rounded-md border-l-2 border-[#2563EB] bg-[#EEF5FF] p-4">
            <FileSearchCorner size={16} className="mt-0.5 shrink-0 text-blue-600" />
            <div>
              <h2 className="text-[13px] font-semibold text-blue-700">Evidence is ready for review</h2>
              <p className="mt-0.5 text-xs leading-5 text-[#52627A]">
                {action.student} submitted {action.evidence.toLowerCase()}
                {action.submitted ? ` on ${action.submitted}` : ""}. Open the document to review it and record a faculty decision.
              </p>
            </div>
          </section>
        )}

        <section className="grid items-start gap-4 lg:grid-cols-2">
          <div className={cardClass}>
            <h2 className={cardTitle}>Action requirements</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Pill label={currentStatus} />
              <Pill label={action.category} />
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <h3 className="text-[15px] font-semibold text-[#102746]">Purpose: {action.purpose}</h3>
                <p className="mt-1 text-[13px] leading-5 text-[#71809A]">{action.context}</p>
              </div>
              {action.requirements.map(({ title, detail }) => (
                <div key={title}>
                  <h3 className="text-[15px] font-semibold text-[#102746]">{title}</h3>
                  <p className="mt-1 text-[13px] leading-5 text-[#71809A]">{detail}</p>
                </div>
              ))}
              <div>
                <h3 className="text-[15px] font-semibold text-[#102746]">Evidence required: {action.evidence.toLowerCase()}</h3>
                <p className="mt-1 text-[13px] leading-5 text-[#71809A]">
                  PDF or clear JPG/PNG · Up to 10 MB · All pages in order, legible and complete.
                </p>
              </div>
              <p className="text-xs text-[#71809A]">Faculty: Prof. Harsh Sharma · Assigned 01 Oct · Due {action.due}, 23:59 IST</p>
            </div>
          </div>

          <div className={cardClass}>
            <h2 className={cardTitle}>Progress &amp; completion</h2>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="font-semibold text-[#102746]">Requirements completed</span>
              <span className="text-[#52627A]">{percent}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EEF1F5]">
              <div className="h-full rounded-full bg-[#2563EB] transition-all duration-300" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-[#71809A]">{progressText}</p>

            <div className="mt-5 space-y-4">
              <div>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-semibold text-[#102746]">
                  {stageItems.map((step, index) => (
                    <Fragment key={step.label}>
                      {index > 0 && <span className="text-[#8A98AB]">·</span>}
                      <span className="inline-flex items-center gap-1">
                        {step.done ? <Check size={13} strokeWidth={3} className="text-emerald-500" /> : <Circle size={11} className="text-[#71809A]" />}
                        {step.label}
                      </span>
                    </Fragment>
                  ))}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#71809A]">
                  {currentStatus === "Approved"
                    ? "Faculty approval is complete."
                    : currentStatus === "Revision Requested" || currentStatus === "Rejected"
                      ? "The student needs to review the faculty feedback and provide an updated submission."
                      : canReview
                        ? "Evidence is available for faculty review."
                        : "Progress updates appear here as this action moves through its workflow."}
                </p>
              </div>
            </div>
            {canReview && (
              <div className="mt-5">
                <button type="button" onClick={() => setPreviewOpen(true)} className={primaryButton}>
                  Review evidence <Eye size={14} />
                </button>
              </div>
            )}
          </div>
        </section>

        <section className={cardClass}>
          <h2 className={cardTitle}>Assigned student</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-[#F8FAFC] [&>tr>th:first-child]:rounded-l-md [&>tr>th:last-child]:rounded-r-md">
                <tr>
                  {["Student", "Roll", "Class", "Subject / category", "Due date", "Evidence", "Status"].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-xs font-medium text-[#52627A]">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#EEF1F5]">
                  <td className="px-4 py-4 text-[13px] text-[#102746]">{action.student}</td>
                  <td className="px-4 py-4 text-[13px] text-[#102746]">{action.roll}</td>
                  <td className="px-4 py-4 text-[13px] text-[#102746]">{action.className}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[13px] text-[#102746]">{action.subject}&nbsp;&nbsp;<Pill label={action.category} /></span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[13px] text-[#102746]">{action.due}</td>
                  <td className="px-4 py-4 text-[13px] text-[#102746]">{action.file ? action.evidence : "Not submitted"}</td>
                  <td className="px-4 py-4"><Pill label={currentStatus} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid items-start gap-4 lg:grid-cols-2">
          <div className={cardClass}>
            <h2 className={cardTitle}>Activity timeline</h2>
            <div className="mt-4 space-y-4">
              {action.timeline.map(([date, title, detail]) => (
                <div key={`${date}-${title}`} className="border-l-2 border-[#E5EAF1] pl-3">
                  <p className="text-[13px] font-semibold text-[#102746]">{date} · {title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-[#71809A]">{detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className={cardTitle}>Evidence &amp; faculty notes</h2>
                <p className="mt-1 text-xs text-[#71809A]">Review the uploaded sample file and record the decision or feedback.</p>
              </div>
              {action.file && <Pill label="Sample document" showDot={false} shape="md" />}
            </div>

            <div className="mt-4 space-y-5">
              {action.file && evidenceUrl ? (
                <div className="rounded-lg border border-[#E5EAF1] p-3.5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700"><FileText size={18} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="break-all text-[13px] font-semibold text-[#102746]">{action.file}</p>
                      <p className="mt-1 text-xs leading-5 text-[#71809A]">
                        {action.evidence} · {action.submitted ? `Submitted ${action.submitted}` : "Sample evidence"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => setPreviewOpen(true)} className={primaryButton}>
                          <Eye size={14} /> {canReview ? "Review & decide" : "Preview document"}
                        </button>
                        <a href={evidenceUrl} download={action.file} className={outlineButton}>
                          <Download size={14} /> Download
                        </a>
                      </div>
                      <Notice notice={notice} card="evidence" />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="rounded-md bg-[#F8FAFC] p-3 text-xs leading-5 text-[#71809A]">No evidence submitted yet. Preview, download, and review controls will become available when a document is attached.</p>
              )}

              {!canReview && (currentStatus === "Approved" || currentStatus === "Rejected" || currentStatus === "Revision Requested") && (
                <div className="flex items-start gap-2 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
                  {currentStatus === "Approved" ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" /> : <MessageSquare size={15} className="mt-0.5 shrink-0 text-amber-600" />}
                  <p>{currentStatus === "Approved" ? "This evidence has been marked as approved in the current demo session." : `This item is marked “${currentStatus}”. Add faculty notes below to document the next steps.`}</p>
                </div>
              )}

              <div className="border-t border-[#EEF1F5] pt-4">
                <h3 className="text-[13px] font-semibold text-[#102746]">Add faculty note</h3>
                <form onSubmit={addFacultyNote} className="mt-2 space-y-2">
                  <textarea
                    value={newNote}
                    onChange={(event) => setNewNote(event.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Write specific feedback, corrections, or next steps..."
                    className="w-full resize-y rounded-md border border-[#DCE3EC] px-3 py-2 text-xs leading-5 text-[#102746] outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] text-[#8A98AB]">{newNote.length}/1000 characters</span>
                    <button type="submit" className={outlineButton}><MessageSquare size={14} /> Add note</button>
                  </div>
                </form>
                <Notice notice={notice} card="notes" />
              </div>

              <div>
                <h3 className="text-[13px] font-semibold text-[#102746]">Faculty note history</h3>
                <div className="mt-3 space-y-3">
                  {facultyNotes.map((note) => (
                    <article key={note.id} className="rounded-md bg-[#F8FAFC] p-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <p className="text-xs font-semibold text-[#102746]">{note.author}</p>
                        <time className="text-[10px] text-[#8A98AB]">{note.timestamp}</time>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-[#52627A]">{note.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-2 pb-2 text-[10px] text-[#8A98AB]">
          <span>3G · Academic insights updated 05 Oct 2026, 09:30 IST</span>
          <Link href="/dashboard/teacher/actions" className="inline-flex items-center gap-1 hover:text-[#2563EB]">
            <ArrowLeft size={12} /> Back to Activities / Actions
          </Link>
        </footer>
      </main>

      <DocumentPreviewModal
        open={previewOpen}
        onClose={closePreview}
        documentUrl={evidenceUrl}
        fileName={action.file}
        title={action.title}
        status={currentStatus}
        canReview={canReview}
        onDecision={handleDecision}
      />
    </>
  );
}

export default function ActionDetailPage({ params }) {
  const { id } = use(params);
  const action = actions[id] || actions[1];

  return <ActionDetail key={id} id={id} action={action} />;
}