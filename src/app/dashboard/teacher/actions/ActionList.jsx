
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
    FileUp,
    ClipboardList,
    X,
    LoaderCircle,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import useTeacherStore from "@/store/useTeacherStore";

function getApiError(error, fallback) {
    const data = error?.response?.data;

    if (typeof data === "string" && data.trim().startsWith("<")) {
        return `The API returned HTML instead of JSON (HTTP ${error.response.status
            }). Check the API route: ${error.config?.url ?? ""}`;
    }

    if (data?.error) return data.error;
    if (data?.message) return data.message;

    if (error?.response) {
        return `${fallback} (HTTP ${error.response.status})`;
    }

    if (error?.request) {
        return "Unable to reach the server. Check your connection and API route.";
    }

    return error?.message || fallback;
}

function ActionModal({ action, filters, onClose }) {
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const empId = useTeacherStore((state) => state.empId);
    if (!action) return null;

    const isTeacherSubmission = action.submitter_type === "teacher";

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isTeacherSubmission && !file) {
            setError("Please select a file to upload.");
            return;
        }

        setSubmitting(true);
        setError("");
        setMessage("");

        try {
            let response;

            if (isTeacherSubmission) {
                const formData = new FormData();

                formData.append("file", file);
                formData.append("action_id", String(action.action_id));
                formData.append("assessment", filters.assessment);
                formData.append("category", filters.category3G);
                formData.append("program", filters.program ?? "");
                formData.append("semester", filters.semester ?? "");
                formData.append("course_code", filters.courses ?? "");

                response = await axios.post(
                    `/api/teachers/actions/${action.action_id}/submit`,
                    formData
                );
            } else {
                response = await axios.post(
                    `/api/teachers/actions/${action.action_id}/assign`,
                    {
                        action_id: action.action_id,
                        target_category: action.target_category,
                        assessment_type: action.assessment_type,
                        program: filters.program ?? "",
                        semester: filters.semester ?? "",
                        course_code: filters.courses ?? "",
                        empId,
                    }
                );
            }

            setMessage(
                response.data?.message ||
                (isTeacherSubmission
                    ? "File submitted successfully."
                    : "Action assigned successfully.")
            );

            if (isTeacherSubmission) {
                setFile(null);
            }
        } catch (err) {
            setError(
                getApiError(err, "The action could not be completed.")
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !submitting) {
                    onClose();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="action-modal-title"
                className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl"
            >
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
                            {action.target_category} · {action.assessment_type}
                        </p>

                        <h2
                            id="action-modal-title"
                            className="text-lg font-semibold text-[#102746]"
                        >
                            {action.title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Close modal"
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                    >
                        <X size={19} />
                    </button>
                </div>

                <p className="mb-5 text-sm leading-6 text-slate-600">
                    {action.description}
                </p>

                {message ? (
                    <div
                        role="status"
                        className="rounded-lg border border-green-200 bg-green-50 p-4"
                    >
                        <div className="flex items-center gap-2 text-sm font-medium text-green-800">
                            <CheckCircle2 size={17} />
                            {message}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {isTeacherSubmission ? (
                            <div className="mb-5">
                                <label
                                    htmlFor="action-file"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Upload supporting document
                                </label>

                                <label
                                    htmlFor="action-file"
                                    className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-slate-300 px-4 py-7 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
                                >
                                    <FileUp
                                        size={27}
                                        className="mb-2 text-blue-600"
                                    />

                                    <span className="break-all text-sm font-medium text-slate-700">
                                        {file ? file.name : "Choose a file to upload"}
                                    </span>

                                    <span className="mt-1 text-xs text-slate-500">
                                        Select the supporting document from your device
                                    </span>

                                    <input
                                        id="action-file"
                                        type="file"
                                        className="sr-only"
                                        onChange={(event) => {
                                            setFile(event.target.files?.[0] ?? null);
                                            setError("");
                                        }}
                                        disabled={submitting}
                                    />
                                </label>
                            </div>
                        ) : (
                            <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
                                <p className="text-sm font-medium text-[#102746]">
                                    Assign to {action.target_category} students
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                    Eligible students should be determined by the server
                                    using the selected program, semester, course, and
                                    3G category.
                                </p>
                            </div>
                        )}

                        {error && (
                            <div
                                role="alert"
                                className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
                            >
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    submitting ||
                                    (isTeacherSubmission && !file)
                                }
                                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting && (
                                    <LoaderCircle
                                        size={15}
                                        className="animate-spin"
                                    />
                                )}

                                {submitting
                                    ? "Processing..."
                                    : isTeacherSubmission
                                        ? "Upload submission"
                                        : "Assign to category students"}
                            </button>
                        </div>
                    </form>
                )}
            </section>
        </div>
    );
}

export default function ActionList({ filters }) {
    const [actions, setActions] = useState([]);
    const [selectedAction, setSelectedAction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const assessment = filters?.assessment ?? "";
    const category = filters?.category3G ?? "";

    useEffect(() => {
        if (!assessment || !category) {
            setActions([]);
            setSelectedAction(null);
            setError("");
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        async function loadActions() {
            setLoading(true);
            setError("");
            setActions([]);
            setSelectedAction(null);

            try {
                const response = await axios.get("/api/teachers/actions", {
                    params: {
                        assessment,
                        category,
                    },
                    signal: controller.signal,
                });

                setActions(
                    Array.isArray(response.data?.actions)
                        ? response.data.actions
                        : []
                );
            } catch (err) {
                if (
                    controller.signal.aborted ||
                    axios.isCancel(err) ||
                    err.code === "ERR_CANCELED"
                ) {
                    return;
                }

                setError(getApiError(err, "Failed to load actions."));
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadActions();

        return () => controller.abort();
    }, [assessment, category]);

    return (
        <>
            <section className="mt-4 rounded-lg border border-[#E5EAF1] bg-white p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-sm font-semibold text-[#102746]">
                            Available Actions
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Actions for {category || "the selected category"} ·{" "}
                            {assessment || "the selected assessment"}
                        </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                        {actions.length} actions
                    </span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                        <LoaderCircle size={18} className="animate-spin" />
                        Loading actions...
                    </div>
                ) : error ? (
                    <div
                        role="alert"
                        className="flex items-start gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700"
                    >
                        <AlertCircle size={17} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                ) : actions.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 py-10 text-center">
                        <ClipboardList
                            size={28}
                            className="mx-auto mb-2 text-slate-400"
                        />

                        <p className="text-sm font-medium text-slate-700">
                            No actions available
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Try selecting another assessment or 3G category.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                        {actions.map((action) => (
                            <button
                                key={action.action_id}
                                type="button"
                                onClick={() => setSelectedAction(action)}
                                className="group rounded-lg border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <h3 className="text-sm font-semibold leading-5 text-[#102746] group-hover:text-blue-700">
                                        {action.title}
                                    </h3>

                                    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium capitalize text-slate-600">
                                        {action.submitter_type} submission
                                    </span>
                                </div>

                                <p className="line-clamp-2 text-xs leading-5 text-slate-500">
                                    {action.description}
                                </p>

                                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                                    <span className="text-[11px] text-slate-500">
                                        {action.target_category} · {action.assessment_type}
                                    </span>

                                    <span className="text-xs font-medium text-blue-600">
                                        View action →
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {selectedAction && (
                <ActionModal
                    key={selectedAction.action_id}
                    action={selectedAction}
                    filters={filters}
                    onClose={() => setSelectedAction(null)}
                />
            )}
        </>
    );
}
