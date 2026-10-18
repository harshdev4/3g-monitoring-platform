
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  X,
  Paperclip,
  Eye,
  FileText,
  Download,
  Upload,
  Trash2,
  Plus,
} from "lucide-react";

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function TextFilePreview({ attachment }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    attachment.file
      .text()
      .then((text) => {
        if (active) setContent(text);
      })
      .catch(() => {
        if (active) setError("Unable to read this file.");
      });

    return () => {
      active = false;
    };
  }, [attachment]);

  if (error) {
    return <p className="p-4 text-sm text-red-600">{error}</p>;
  }

  return (
    <pre className="whitespace-pre-wrap break-words rounded-md bg-white p-4 text-sm text-slate-700">
      {content}
    </pre>
  );
}

function AttachmentPreviewModal({ attachment, onClose }) {
  if (!attachment) return null;

  const { file, url } = attachment;

  const isImage = file.type.startsWith("image/");
  const isPdf =
    file.type === "application/pdf" || /\.pdf$/i.test(file.name);

  const isWord =
    file.type === "application/msword" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    /\.(doc|docx)$/i.test(file.name);

  const isText =
    file.type.startsWith("text/") ||
    /\.(txt|csv|json|md|log|xml)$/i.test(file.name);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-3 sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Preview ${file.name}`}
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >
        {/* Preview header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#E5EAF1] p-4">
          <div className="flex min-w-0 items-center gap-3">
            <FileText
              size={21}
              className="shrink-0 text-[#60708A]"
            />

            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-[#20375D]">
                {file.name}
              </h3>

              <p className="text-xs text-[#7183A3]">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={url}
              download={file.name}
              aria-label="Download file"
              title="Download file"
              className="rounded-md border border-[#E1E7F0] p-2 text-[#20375D] hover:bg-[#F7F9FC]"
            >
              <Download size={17} />
            </a>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="rounded-md p-2 text-[#7183A3] hover:bg-[#F1F5F9]"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Preview content */}
        <div className="min-h-[250px] flex-1 overflow-auto bg-[#F1F3F5] p-3 sm:p-4">
          {isImage ? (
            <div className="relative mx-auto min-h-[250px] w-full">
              <Image
                src={url}
                alt={file.name}
                width={1200}
                height={900}
                unoptimized
                className="mx-auto max-h-[70vh] w-auto max-w-full rounded-md object-contain"
                style={{ height: "auto" }}
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={url}
              title={`PDF preview: ${file.name}`}
              className="h-[70vh] w-full rounded-md border border-[#DCE3ED] bg-white"
            />
          ) : isText ? (
            <TextFilePreview attachment={attachment} />
          ) : isWord ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-lg bg-white p-6 text-center">
              <FileText size={44} className="text-[#2563EB]" />

              <h4 className="text-sm font-semibold text-[#20375D]">
                Word document selected
              </h4>

              <p className="max-w-md text-xs leading-5 text-[#7183A3]">
                Word documents cannot be displayed directly by the browser
                from a local file URL. Download the document to open it in
                Microsoft Word or another compatible application.
              </p>

              <a
                href={url}
                download={file.name}
                className="inline-flex items-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
              >
                <Download size={16} />
                Download document
              </a>
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-lg bg-white p-6 text-center">
              <FileText size={44} className="text-[#60708A]" />

              <h4 className="text-sm font-semibold text-[#20375D]">
                Preview unavailable
              </h4>

              <p className="max-w-md text-xs leading-5 text-[#7183A3]">
                This file type is not supported for direct browser preview.
                You can download the file to open it with a compatible
                application.
              </p>

              <a
                href={url}
                download={file.name}
                className="inline-flex items-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
              >
                <Download size={16} />
                Download file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const TeacherObservations = ({
  lastUpdated,
  observationTitle,
  description,
  onAddObservation,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);

  const objectUrlsRef = useRef(new Set());

  const [observations, setObservations] = useState(() => [
    {
      id: 1,
      title: observationTitle,
      description: description || "",
      date: lastUpdated,
      attachments: [],
    },
  ]);

  // Revoke object URLs only when this component unmounts.
  // Do not revoke them whenever the attachment list changes.
  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
  }, []);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    const newAttachments = selectedFiles.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.add(url);

      return {
        id: crypto.randomUUID(),
        file,
        url,
      };
    });

    setAttachments((previous) => [...previous, ...newAttachments]);

    // Allows selecting the same file again.
    event.target.value = "";
  };

  const removeAttachment = (id) => {
    setAttachments((previous) => {
      const attachment = previous.find((item) => item.id === id);

      if (attachment) {
        URL.revokeObjectURL(attachment.url);
        objectUrlsRef.current.delete(attachment.url);
      }

      return previous.filter((item) => item.id !== id);
    });

    setPreviewFile((previous) => (previous?.id === id ? null : previous));
  };

  const resetForm = () => {
    // Revoke URLs for files that have not been saved.
    attachments.forEach((attachment) => {
      URL.revokeObjectURL(attachment.url);
      objectUrlsRef.current.delete(attachment.url);
    });

    setTitle("");
    setDetails("");
    setAttachments([]);
    setIsModalOpen(false);
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (!title.trim() || !details.trim()) return;

    const newObservation = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: details.trim(),
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      attachments: [...attachments],
    };

    setObservations((previous) => [...previous, newObservation]);

    onAddObservation?.(newObservation);

    // Keep attachment URLs valid after saving.
    // The saved observation now owns these attachment references.
    setTitle("");
    setDetails("");
    setAttachments([]);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Observations list */}
      <section className="rounded-lg border border-[#E5EAF1] bg-white p-4">
        <h2 className="text-base font-semibold text-[#20375D]">
          Teacher observations
        </h2>

        <div className="mt-3 space-y-4">
          {observations.map((item) => (
            <article
              key={item.id}
              className="border-b border-[#EEF1F5] pb-4 last:border-0 last:pb-0"
            >
              <h3 className="text-sm font-semibold text-[#20375D]">
                {item.title}
              </h3>

              <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-[#7183A3]">
                {item.description}
              </p>

              {item.date && (
                <p className="mt-1 text-[10px] text-[#94A3B8]">
                  {item.date}
                </p>
              )}

              {item.attachments?.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-[11px] font-semibold text-[#60708A]">
                    Attachments ({item.attachments.length})
                  </p>

                  {item.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-2 rounded-md border border-[#E5EAF1] p-2"
                    >
                      <Paperclip
                        size={15}
                        className="shrink-0 text-[#60708A]"
                      />

                      <button
                        type="button"
                        onClick={() => setPreviewFile(attachment)}
                        title={`Preview ${attachment.file.name}`}
                        className="min-w-0 flex-1 truncate text-left text-xs font-medium text-[#2563EB] hover:underline"
                      >
                        {attachment.file.name}
                      </button>

                      <span className="hidden text-[10px] text-[#94A3B8] sm:inline">
                        {formatFileSize(attachment.file.size)}
                      </span>

                      <button
                        type="button"
                        onClick={() => setPreviewFile(attachment)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#E1E7F0] px-2 py-1.5 text-[11px] font-medium text-[#20375D] hover:bg-[#F7F9FC]"
                      >
                        <Eye size={13} />
                        Preview
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-md border border-[#E1E7F0] flex
            flex-row gap-2 bg-white px-3 py-2 text-xs font-semibold text-[#20375D] hover:bg-[#F7F9FC]"
          >
              <Plus size={15} />
             Add observation
          </button>
        </div>
      </section>

      {/* Add observation modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) resetForm();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="observation-modal-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[#E5EAF1] bg-white p-5 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <h2
                id="observation-modal-title"
                className="text-lg font-semibold text-[#20375D]"
              >
                Add observation
              </h2>

              <button
                type="button"
                onClick={resetForm}
                aria-label="Close modal"
                className="rounded-md p-2 text-[#7183A3] hover:bg-[#F1F5F9]"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-1 text-xs text-[#7183A3]">
              Record an academic observation and attach supporting files.
            </p>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="observation-title"
                  className="mb-1.5 block text-xs font-medium text-[#20375D]"
                >
                  Observation title
                </label>

                <input
                  id="observation-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Focus on SQL joins"
                  maxLength={120}
                  required
                  className="w-full rounded-md border border-[#DCE3ED] px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="observation-details"
                  className="mb-1.5 block text-xs font-medium text-[#20375D]"
                >
                  Observation details
                </label>

                <textarea
                  id="observation-details"
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder="Describe progress, concerns, or recommended support..."
                  rows={4}
                  maxLength={1000}
                  required
                  className="w-full resize-y rounded-md border border-[#DCE3ED] px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                />
              </div>

              {/* File upload */}
              <div>
                <p className="mb-2 text-xs font-medium text-[#20375D]">
                  Attach files
                </p>

                <label
                  htmlFor="observation-files"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#C9D4E3] bg-[#F8FAFC] px-4 py-5 text-center transition hover:border-[#2563EB] hover:bg-[#F3F7FF]"
                >
                  <Upload size={22} className="mb-2 text-[#60708A]" />

                  <span className="text-xs font-semibold text-[#20375D]">
                    Choose files to upload
                  </span>

                  <span className="mt-1 text-[11px] text-[#7183A3]">
                    Any file type · Select multiple files
                  </span>
                </label>

                <input
                  id="observation-files"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Preview selected files before saving */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#20375D]">
                    Selected files ({attachments.length})
                  </p>

                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-2 rounded-lg border border-[#E5EAF1] p-3"
                    >
                      <FileText
                        size={18}
                        className="shrink-0 text-[#60708A]"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-[#20375D]">
                          {attachment.file.name}
                        </p>

                        <p className="text-[10px] text-[#7183A3]">
                          {formatFileSize(attachment.file.size)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPreviewFile(attachment)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#E1E7F0] px-2 py-1.5 text-xs text-[#20375D] hover:bg-[#F7F9FC]"
                      >
                        <Eye size={14} />
                        Preview
                      </button>

                      <button
                        type="button"
                        onClick={() => removeAttachment(attachment.id)}
                        aria-label={`Remove ${attachment.file.name}`}
                        className="shrink-0 rounded-md p-1.5 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-[#EEF1F5] pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-md border border-[#E1E7F0] px-4 py-2 text-xs font-semibold text-[#20375D] hover:bg-[#F7F9FC]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-md bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
                >
                  Save observation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shared preview modal */}
      {previewFile && (
        <AttachmentPreviewModal
          attachment={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  );
};

export default TeacherObservations;
