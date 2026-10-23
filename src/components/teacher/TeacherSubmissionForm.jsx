
"use client";

import { useState } from "react";
import axios from "axios";
import {
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    LoaderCircle,
    X,
} from "lucide-react";

import useTeacherStore from "@/store/useTeacherStore";

const ACCEPTED_FILES =
    ".pdf,.doc,.docx,.xlsx,.jpg,.jpeg,.png,.webp";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function TeacherSubmissionForm({
    action,
    filters = {},
    onSubmitted,
}) {
    const empId = useTeacherStore((state) => state.empId);

    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [submission, setSubmission] = useState(null);

    const selectFile = (event) => {
        const selectedFile = event.target.files?.[0] ?? null;

        setError("");
        setSubmission(null);

        if (!selectedFile) {
            setFile(null);
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setFile(null);
            event.target.value = "";
            setError("The maximum allowed file size is 10 MB.");
            return;
        }

        setFile(selectedFile);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSubmission(null);

        if (!empId) {
            setError("Teacher information is unavailable. Please sign in again.");
            return;
        }

        if (!file) {
            setError("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("empId", String(empId));
        formData.append("program", filters.program || "");
        formData.append("semester", filters.semester || "");
        formData.append("course_code", filters.courses || "");
        formData.append("assessment", filters.assessment || "");
        formData.append("category", filters.category3G || "");

        setUploading(true);


        const formElement = event.currentTarget;

        try {
            const response = await axios.post(
                `/api/teachers/actions/${encodeURIComponent(action.action_id)}/submit`,
                formData
            );

            if (response.data?.success === false) {
                throw new Error(
                    response.data.message || "Upload failed."
                );
            }

            const saved = response.data?.submission ?? {};

            setSubmission({
                message:
                    response.data?.message ||
                    "Submission uploaded successfully.",
                fileUrl:
                    saved.file_url || saved.cloudinary_url || "",
                fileName:
                    saved.file_name ||
                    saved.original_filename ||
                    file.name,
            });

            setFile(null);

            // Reset the form after a successful upload.
            formElement?.reset();

            onSubmitted?.(saved);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Unable to upload your submission."
            );
        } finally {
            setUploading(false);
        }

    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <h3 className="text-sm font-semibold text-slate-800">
                    Upload supporting document
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                    Submit evidence for {action.title}.
                </p>
            </div>

            <label
                htmlFor="teacher-action-file"
                className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-slate-300 px-4 py-7 text-center hover:border-blue-400 hover:bg-blue-50/40"
            >
                <Upload size={27} className="mb-2 text-blue-600" />
                <span className="break-all text-sm font-medium text-slate-700">
                    {file ? file.name : "Choose a file to upload"}
                </span>
                <span className="mt-1 text-xs text-slate-500">
                    PDF, DOC, DOCX, XLSX, JPG, PNG or WebP · Maximum 10 MB
                </span>
                <input
                    id="teacher-action-file"
                    type="file"
                    accept={ACCEPTED_FILES}
                    className="sr-only"
                    disabled={uploading}
                    onChange={selectFile}
                />
            </label>

            {file && (
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                    <FileText size={22} className="shrink-0 text-blue-600" />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-slate-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                    </div>
                    <button
                        type="button"
                        disabled={uploading}
                        onClick={() => {
                            setFile(null);
                            const input = document.getElementById("teacher-action-file");
                            if (input) input.value = "";
                        }}
                        aria-label="Remove selected file"
                        className="text-slate-500 hover:text-red-600"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {error && (
                <div role="alert" className="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle size={17} className="shrink-0" />
                    {error}
                </div>
            )}

            {submission && (
                <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-3">
                    <div className="flex gap-2 text-sm font-medium text-green-800">
                        <CheckCircle2 size={17} />
                        {submission.message}
                    </div>
                    <p className="mt-2 break-all text-xs text-green-800">
                        {submission.fileName}
                    </p>
                    {submission.fileUrl && (
                        <a
                            href={submission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
                        >
                            View submission <ExternalLink size={14} />
                        </a>
                    )}
                </div>
            )}

            <button
                type="submit"
                disabled={uploading || !file}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
                {uploading ? (
                    <>
                        <LoaderCircle size={16} className="animate-spin" />
                        Uploading...
                    </>
                ) : (
                    <>
                        <Upload size={16} />
                        Upload submission
                    </>
                )}
            </button>
        </form>
    );
}
