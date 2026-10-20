"use client";

import { useEffect, useRef, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import Pill from "@/components/teacher/Pill";

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp"];
const MAX_TEXT_CHARS = 50000;

const buttonBase =
  "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
const outlineButton = `${buttonBase} border border-[#DCE3EC] bg-white text-[#102746] hover:bg-[#F8FAFC]`;
const primaryButton = `${buttonBase} bg-[#2563EB] text-white hover:bg-[#1D4ED8]`;
const dangerButton = `${buttonBase} border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100`;

/**
 * Decisions offered in the review panel. Pass your own `decisions` prop to
 * change the options. `noteRequired` forces the teacher to write feedback.
 */
export const DEFAULT_DECISIONS = [
  {
    status: "Approved",
    label: "Approve evidence",
    icon: CheckCircle2,
    className: primaryButton,
    noteRequired: false,
  },
  {
    status: "Revision Requested",
    label: "Request revision",
    icon: RotateCcw,
    className: outlineButton,
    noteRequired: true,
  },
  {
    status: "Rejected",
    label: "Reject evidence",
    icon: Ban,
    className: dangerButton,
    noteRequired: true,
  },
];

const getExtension = (name = "") =>
  name.includes(".") ? name.split(".").pop().toLowerCase() : "";

// Browsers can render these natively. Everything else (docx, pptx, xlsx...)
// falls back to a download card.
function getPreviewKind(fileName) {
  const extension = getExtension(fileName);
  if (extension === "pdf") return "pdf";
  if (IMAGE_EXTENSIONS.includes(extension)) return "image";
  if (extension === "txt") return "text";
  return "unsupported";
}

/**
 * Document preview with an optional faculty review panel.
 *
 * Props:
 *  - open: show / hide the modal
 *  - onClose(): close handler (wrap it in useCallback in the parent)
 *  - documentUrl: URL to fetch the file from (same origin, or CORS-enabled)
 *  - fileName: used for the title, download name and type detection,
 *              so it must include the extension (e.g. "answers_v2.pdf")
 *  - title: optional context line, e.g. the action title
 *  - status: optional current status, shown as a Pill in the header
 *  - canReview: show the decision panel
 *  - decisions: optional override of DEFAULT_DECISIONS
 *  - onDecision({ status, note }): called when the teacher picks a decision.
 *              The modal closes right after.
 */
export default function DocumentPreviewModal({ open, ...props }) {
  // The dialog mounts only while open, so the fetch, the object URL and the
  // feedback box all reset themselves on every open.
  if (!open) return null;
  return <PreviewDialog {...props} />;
}

function PreviewDialog({
  documentUrl,
  fileName,
  title,
  status,
  canReview = false,
  decisions = DEFAULT_DECISIONS,
  onDecision,
  onClose,
}) {
  const kind = getPreviewKind(fileName);
  const needsFetch = kind !== "unsupported" && Boolean(documentUrl);

  const [result, setResult] = useState(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const dialogRef = useRef(null);

  // Fetch the document. State is only set from the async callbacks, never
  // synchronously in the effect body, so there is no extra render on open.
  useEffect(() => {
    if (!needsFetch) return undefined;

    const controller = new AbortController();
    let objectUrl = null;

    (async () => {
      try {
        const response = await fetch(documentUrl, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`The server responded with ${response.status}.`);
        }

        if (kind === "text") {
          const text = await response.text();
          setResult({ url: documentUrl, text: text.slice(0, MAX_TEXT_CHARS) });
          return;
        }

        const blob = await response.blob();
        if (controller.signal.aborted) return;

        // Force the PDF type so the browser renders it instead of downloading.
        const typed =
          kind === "pdf" ? blob.slice(0, blob.size, "application/pdf") : blob;
        objectUrl = URL.createObjectURL(typed);
        setResult({ url: documentUrl, src: objectUrl });
      } catch (fetchError) {
        if (fetchError.name === "AbortError") return;
        setResult({
          url: documentUrl,
          error: fetchError.message || "The document could not be loaded.",
        });
      }
    })();

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [documentUrl, kind, needsFetch]);

  // Escape to close + lock page scroll while open
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  // Derived, not stored: loading until a result for this URL arrives.
  const current = result?.url === documentUrl ? result : null;
  const isLoading = needsFetch && !current;

  const decide = (decision) => {
    const trimmed = note.trim();
    if (decision.noteRequired && !trimmed) {
      setError(
        `Add feedback for the student before choosing “${decision.label}”.`,
      );
      return;
    }
    onDecision?.({ status: decision.status, note: trimmed });
    onClose();
  };

  const renderPreview = () => {
    if (!documentUrl) {
      return (
        <Message title="No document attached">
          There is nothing to preview for this item yet.
        </Message>
      );
    }

    if (kind === "unsupported") {
      return (
        <Message title={`Preview isn’t available for .${getExtension(fileName) || "this"} files`}>
          Browsers can’t display this format. Download the file to open it in
          its own application.
          <a
            href={documentUrl}
            download={fileName}
            className={`${primaryButton} mt-4`}
          >
            <Download size={14} /> Download {fileName}
          </a>
        </Message>
      );
    }

    if (isLoading) {
      return (
        <div
          role="status"
          className="flex h-full min-h-[320px] items-center justify-center gap-2 text-xs text-[#71809A]"
        >
          <Loader2 size={16} className="animate-spin" />
          Loading document…
        </div>
      );
    }

    if (current.error) {
      return (
        <Message title="The document could not be loaded">
          {current.error} You can still try downloading it.
          <a
            href={documentUrl}
            download={fileName}
            className={`${outlineButton} mt-4`}
          >
            <Download size={14} /> Download
          </a>
        </Message>
      );
    }

    if (kind === "pdf") {
      return (
        <iframe
          title={`Preview of ${fileName}`}
          src={`${current.src}#toolbar=1&navpanes=0&view=FitH`}
          className="h-[65vh] min-h-[420px] w-full rounded-md border border-slate-200 bg-white"
        />
      );
    }

    if (kind === "image") {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={current.src}
          alt={fileName}
          className="mx-auto max-h-[65vh] rounded-md border border-slate-200 bg-white object-contain"
        />
      );
    }

    return (
      <pre className="h-[65vh] min-h-[420px] overflow-auto whitespace-pre-wrap rounded-md border border-slate-200 bg-white p-4 text-xs leading-5 text-[#102746]">
        {current.text}
      </pre>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-preview-title"
        tabIndex={-1}
        className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl outline-none"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#E5EAF1] px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="document-preview-title"
                className="text-sm font-semibold text-[#102746]"
              >
                Document preview
              </h2>
              {status && <Pill label={status} />}
            </div>
            <p className="mt-1 break-all text-xs text-[#71809A]">
              {fileName}
              {title ? ` · ${title}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {documentUrl && (
              <a href={documentUrl} download={fileName} className={outlineButton}>
                <Download size={14} /> Download
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close document preview"
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
          <div className="min-h-[50vh] flex-1 overflow-auto bg-slate-100 p-2 sm:p-4">
            {renderPreview()}
          </div>

          {canReview && (
            <aside className="flex w-full shrink-0 flex-col gap-3 border-t border-[#E5EAF1] p-4 lg:w-80 lg:overflow-y-auto lg:border-l lg:border-t-0">
              <div>
                <h3 className="text-[13px] font-semibold text-[#102746]">
                  Faculty decision
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#71809A]">
                  Check the document, then record your decision. Feedback is
                  required to request a revision or reject.
                </p>
              </div>

              <label className="block text-[11px] font-medium text-[#52627A]">
                Feedback for the student
                <textarea
                  value={note}
                  onChange={(event) => {
                    setNote(event.target.value);
                    setError("");
                  }}
                  rows={5}
                  maxLength={1000}
                  placeholder="Write specific corrections or next steps…"
                  className="mt-1 w-full resize-y rounded-md border border-[#DCE3EC] px-3 py-2 text-xs leading-5 text-[#102746] outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <span className="mt-1 block text-right text-[10px] text-[#8A98AB]">
                  {note.length}/1000
                </span>
              </label>

              {error && (
                <p role="alert" className="text-xs text-rose-600">
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-2">
                {decisions.map((decision) => {
                  const Icon = decision.icon;
                  return (
                    <button
                      key={decision.status}
                      type="button"
                      onClick={() => decide(decision)}
                      className={decision.className}
                    >
                      {Icon && <Icon size={14} />}
                      {decision.label}
                    </button>
                  );
                })}
              </div>
            </aside>
          )}
        </div>
      </section>
    </div>
  );
}

function Message({ title, children }) {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#2563EB] shadow-sm">
        <FileText size={22} />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-[#102746]">{title}</h3>
      <div className="mt-1 flex max-w-sm flex-col items-center text-xs leading-5 text-[#71809A]">
        {children}
      </div>
    </div>
  );
}
