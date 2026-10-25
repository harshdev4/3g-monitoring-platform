"use client";

import { useMemo, useState } from "react";
import Header from "@/components/dashboard/Header";
import { Info, Search } from "lucide-react";

const PAGE_SIZE = 5;

export default function ViewUploadHistory({
  onBackToUpload,
  historyData = [],
  loading = false,
  error = "",
}) {
  const [classFilter, setClassFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [assessmentFilter, setAssessmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [dateCutoff, setDateCutoff] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState("");

  const uniqueValues = (key) =>
    [...new Set(historyData.map((row) => row[key]).filter(Boolean))].sort();

  const filteredHistory = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return historyData.filter((row) => {
      const timestamp = new Date(row.uploadedAt).getTime();
      return (!classFilter || row.class === classFilter) &&
        (!courseFilter || row.subject === courseFilter) &&
        (!assessmentFilter || row.assessment === assessmentFilter) &&
        (!statusFilter || row.status === statusFilter) &&
        (!normalizedSearch ||
          `${row.filename} ${row.id}`.toLowerCase().includes(normalizedSearch)) &&
        (dateFilter === "all" || (Number.isFinite(timestamp) && timestamp >= dateCutoff));
    });
  }, [
    historyData,
    classFilter,
    courseFilter,
    assessmentFilter,
    statusFilter,
    dateFilter,
    dateCutoff,
    search,
  ]);

  const pageCount = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filteredHistory.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const selectedImport =
    filteredHistory.find((row) => row.id === selectedId) ?? filteredHistory[0];

  const downloadImport = async (row) => {
    try {
      const response = await fetch(row.fileUrl);
      if (!response.ok) {
        throw new Error(`Unable to download workbook (${response.status}).`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = row.filename || "marks_upload.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (downloadError) {
      console.error("Upload history download failed:", downloadError);
      window.open(row.fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 p-5 text-slate-900">
        <div className="mx-auto max-w-[1400px] space-y-5">
          <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Teacher workspace / Upload Marks / History
              </p>
              <h1 className="mt-1 text-2xl font-bold">Upload History</h1>
              <p className="mt-1 text-xs text-slate-500">
                Assessment imports submitted by your account.
              </p>
            </div>
            <button
              type="button"
              onClick={onBackToUpload}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              Upload Marks
            </button>
          </header>

          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
              <label className="text-[11px] font-semibold text-slate-600">
                Class / Section
                <select className={`${inputClass} mt-1`} value={classFilter}
                  onChange={(event) => { setClassFilter(event.target.value); setPage(1); }}>
                  <option value="">All assigned classes</option>
                  {uniqueValues("class").map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
              <label className="text-[11px] font-semibold text-slate-600">
                Course
                <select className={`${inputClass} mt-1`} value={courseFilter}
                  onChange={(event) => { setCourseFilter(event.target.value); setPage(1); }}>
                  <option value="">All courses</option>
                  {uniqueValues("subject").map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
              <label className="text-[11px] font-semibold text-slate-600">
                Assessment
                <select className={`${inputClass} mt-1`} value={assessmentFilter}
                  onChange={(event) => { setAssessmentFilter(event.target.value); setPage(1); }}>
                  <option value="">All assessments</option>
                  {uniqueValues("assessment").map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
              <label className="text-[11px] font-semibold text-slate-600">
                Status
                <select className={`${inputClass} mt-1`} value={statusFilter}
                  onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}>
                  <option value="">All statuses</option>
                  {uniqueValues("status").map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
              <label className="text-[11px] font-semibold text-slate-600">
                Date range
                <select className={`${inputClass} mt-1`} value={dateFilter}
                  onChange={(event) => {
                    const range = event.target.value;
                    setDateFilter(range);
                    setDateCutoff(range === "all"
                      ? null
                      : Date.now() - Number(range) * 24 * 60 * 60 * 1000);
                    setPage(1);
                  }}>
                  <option value="all">All dates</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </label>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                type="search"
                placeholder="Search file name or import ID"
                className={`${inputClass} pl-9`}
              />
            </div>
          </section>

          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Total imports", historyData.length],
              ["Successful", historyData.filter((row) => row.status === "Success").length],
              ["Needs correction", historyData.filter((row) => row.status === "Partial").length],
              ["Failed", historyData.filter((row) => row.status === "Failed").length],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="text-xs font-medium text-slate-500">{label}</h2>
                <p className="mt-1 text-2xl font-bold">{value}</p>
                <p className="mt-2 text-[11px] text-slate-400">All uploads in this account</p>
              </div>
            ))}
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-5">
              <h2 className="text-base font-bold">Past imports</h2>
              <p className="mt-1 text-[11px] text-slate-500">Newest first · Uploads by your account</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase text-slate-500">
                  <tr>{["Import / file", "Date / uploader", "Class", "Course", "Assessment", "Rows", "Errors", "Status", "Action"].map((label) => <th key={label} className="px-5 py-3">{label}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-500">Loading upload history...</td></tr>
                  ) : pageRows.length === 0 ? (
                    <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-500">No imports match the selected filters.</td></tr>
                  ) : pageRows.map((row) => (
                    <tr key={row.id} onClick={() => setSelectedId(row.id)}
                      className={`${selectedImport?.id === row.id ? "bg-blue-50/60" : "hover:bg-slate-50"} cursor-pointer`}>
                      <td className="px-5 py-4"><span className="font-medium">{row.id}</span><span className="mx-1 text-slate-400">·</span>{row.filename}</td>
                      <td className="px-5 py-4"><div>{row.date} {row.time}</div><div className="text-[11px] text-slate-500">{row.uploader || "Unknown uploader"}</div></td>
                      <td className="px-5 py-4">{row.class}</td><td className="px-5 py-4">{row.subject}</td>
                      <td className="px-5 py-4">{row.assessment}</td><td className="px-5 py-4">{row.rows}</td>
                      <td className="px-5 py-4">{row.errors}</td><td className="px-5 py-4">{row.status}</td>
                      <td className="px-5 py-4">
                        {row.fileUrl ? <button type="button" onClick={(event) => { event.stopPropagation(); downloadImport(row); }}
                          className="font-semibold text-blue-600 hover:text-blue-800">Download</button> : "No file"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 p-4 text-xs text-slate-500">
              <span>
                Showing {filteredHistory.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, filteredHistory.length)} of {filteredHistory.length} imports
              </span>
              <div className="flex items-center gap-2">
                <button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}
                  className="rounded border border-slate-200 px-3 py-1.5 disabled:opacity-40">Previous</button>
                <span>{currentPage} / {pageCount}</span>
                <button type="button" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}
                  className="rounded border border-slate-200 px-3 py-1.5 disabled:opacity-40">Next</button>
              </div>
            </div>
          </section>

          {selectedImport && (
            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-base font-bold">Selected import · {selectedImport.id}</h2>
                <p className="mt-3 text-sm font-semibold">{selectedImport.rows} records · {selectedImport.status}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedImport.subject} · {selectedImport.assessment} · {selectedImport.class} · {selectedImport.academicYear}
                </p>
                <p className="mt-4 text-xs text-slate-600">Uploaded by {selectedImport.uploader || "Unknown uploader"}</p>
                {selectedImport.fileUrl && (
                  <button type="button" onClick={() => downloadImport(selectedImport)}
                    className="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold hover:bg-slate-50">
                    Download original workbook
                  </button>
                )}
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-base font-bold">Import audit</h2>
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <Info className="mt-0.5 shrink-0 text-blue-600" size={18} />
                  <p className="text-xs leading-5 text-blue-800">
                    The original workbook is retained with its import record. {selectedImport.errors ?? 0} validation error(s) were recorded for this upload.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
