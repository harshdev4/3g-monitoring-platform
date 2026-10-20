"use client";

import { useState } from "react";
import { FileSpreadsheet, AlertCircle, Save, X, Edit3, Trash2 } from "lucide-react";
import useTeacherStore from "@/store/useTeacherStore";
import { Toaster,toast } from "sonner";
export default function ValidationTable({
  file,
  setFile,
  parsedData,
  setParsedData,
  errorCount,
  setCurrentPhase,
  runValidation,
  maxMarks,
  onConfirm,
  isSubmitting
}) {
  const [editingRowIdx, setEditingRowIdx] = useState(null);
  const [editForm, setEditForm] = useState({});

  // --- NEW: Column Width State for Resizing ---
  const [colWidths, setColWidths] = useState({
    name: 200,
    roll: 120,
    maxMarks: 100,
    marks: 120,
    attendance: 120,
    validation: 180,
    observation: 160,
    actions: 100,
  });

  // --- NEW: Handle Drag to Resize ---
  const startResize = (e, colKey) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = colWidths[colKey];

    const onMouseMove = (moveEvent) => {
      const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX)); // 50px minimum width
      setColWidths((prev) => ({ ...prev, [colKey]: newWidth }));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const startEdit = (index, row) => {
    setEditingRowIdx(index);
    setEditForm({ ...row });
  };

  const cancelEdit = () => {
    setEditingRowIdx(null);
    setEditForm({});
  };

  const saveEdit = (index) => {
    const newData = [...parsedData];
    newData[index] = { ...newData[index], ...editForm };
    runValidation(newData, maxMarks);
    setEditingRowIdx(null);
  };

  const deleteRow = (index) => {
    const newData = [...parsedData];
    newData.splice(index, 1);
    runValidation(newData, maxMarks);
  };

const handleReupload = () => {
  toast.warning("Do you want to reupload?", {
    description: "Any unsaved edits will be lost.",
    duration: 60000,
    action: {
      label: "Yes, Reupload",
      onClick: () => {
        setFile(null);
        setParsedData([]);
        setCurrentPhase(1);
      },
    },
    cancel: {
      label: "Cancel",
    },
  });
};

  const filters = useTeacherStore((state) => state.filters);

  return (
    <div className="space-y-6">
      {/* File Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h3 className="text-[12px] font-semibold text-slate-800">{file?.name}</h3>
            <p className="text-[11px] font-normal text-slate-500 mt-0.5">
              {file ? (file.size / 1024).toFixed(1) : "0"} KB · {parsedData.length} rows · Validation complete
            </p>
          </div>
        </div>
        <button
          onClick={handleReupload}
          className="bg-white border border-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg text-[12px] shadow-sm hover:bg-slate-50"
        >
          Replace file
        </button>
      </div>

      {/* ERROR BANNER */}
      {errorCount > 0 && (
        <div className="bg-red-50/80 border-l-4 border-red-500 rounded-r-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[13px] font-semibold text-red-600">{errorCount} row(s) need correction before submission</h3>
            <p className="text-[12px] font-medium text-slate-700 mt-1">Double-click any row to edit values directly, or use the trash icon to remove duplicates.</p>
          </div>
        </div>
      )}

      {/* Table Data */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-[17px] font-semibold text-slate-800">Preview & validate marks</h2>
          <p className="text-[11px] font-normal text-[#66758D]">Sem-{filters.semester} . {filters.className} . {filters.courseName}</p>
        </div>

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          {/* Changed w-full to min-w-full so the table can expand horizontally when columns are resized wider */}
          <table className="min-w-full text-left text-[12px] whitespace-nowrap table-fixed">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-semibold border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th style={{ width: colWidths.name }} className="px-4 py-4 relative group">
                  Student Name
                  <div onMouseDown={(e) => startResize(e, "name")} className="absolute right-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400 z-20" />
                </th>
                <th style={{ width: colWidths.roll }} className="px-4 py-4 relative group">
                  Roll no.
                  <div onMouseDown={(e) => startResize(e, "roll")} className="absolute right-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400 z-20" />
                </th>
                <th style={{ width: colWidths.maxMarks }} className="px-4 py-4 relative group">
                  Max Marks
                  <div onMouseDown={(e) => startResize(e, "maxMarks")} className="absolute right-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400 z-20" />
                </th>
                <th style={{ width: colWidths.marks }} className="px-4 py-4 relative group">
                  Marks Obtained
                  <div onMouseDown={(e) => startResize(e, "marks")} className="absolute right-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400 z-20" />
                </th>
                <th style={{ width: colWidths.attendance }} className="px-4 py-4 relative group">
                  Attendance %
                  <div onMouseDown={(e) => startResize(e, "attendance")} className="absolute right-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400 z-20" />
                </th>
                <th style={{ width: colWidths.validation }} className="px-4 py-4 relative group">
                  Validation Status
                  <div onMouseDown={(e) => startResize(e, "validation")} className="absolute right-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400 z-20" />
                </th>
                <th style={{ width: colWidths.observation }} className="px-4 py-4 relative group">
                  Faculty Observation
                  <div onMouseDown={(e) => startResize(e, "observation")} className="absolute right-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400 z-20" />
                </th>
                <th style={{ width: colWidths.actions }} className="px-4 py-4 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
              {parsedData.map((row, idx) => {
                const isEditing = editingRowIdx === idx;
                const hasError = row.validationStatus === 'error' || row.validationStatus === 'corrected';

                return (
                  <tr
                    key={idx}
                    onDoubleClick={() => !isEditing && startEdit(idx, row)}
                    className={`${hasError ? 'bg-red-50/40' : 'hover:bg-slate-50/50'} transition group cursor-pointer`}
                    title="Double click to edit"
                  >
                    <td className="px-4 py-4 text-slate-800 font-medium truncate">
                      {isEditing ? (
                        <input className="border border-blue-400 rounded px-2 py-1 w-full text-[13px] font-normal outline-none bg-white" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} autoFocus />
                      ) : row.name}
                    </td>

                    <td className={`px-4 py-4 truncate ${hasError && row.validationText.includes('Duplicate') ? 'text-red-600 font-semibold' : ''}`}>
                      {isEditing ? (
                        <input className="border border-blue-400 rounded px-2 py-1 w-full text-[13px] font-normal outline-none bg-white" value={editForm.roll} onChange={(e) => setEditForm({ ...editForm, roll: e.target.value })} />
                      ) : row.roll}
                    </td>

                    <td className="px-4 py-4 truncate">
                      {isEditing ? (
                        <input type="number" className="border border-blue-400 rounded px-2 py-1 w-full text-[13px] font-normal outline-none bg-white" value={editForm.maxMarks} onChange={(e) => setEditForm({ ...editForm, maxMarks: e.target.value })} />
                      ) : row.maxMarks}
                    </td>

                    <td className="px-4 py-4 truncate">
                      {isEditing ? (
                        <input type="number" className="border border-blue-400 rounded px-2 py-1 w-full text-[13px] font-normal outline-none bg-white" value={editForm.marks} onChange={(e) => setEditForm({ ...editForm, marks: e.target.value })} />
                      ) : row.validationStatus === 'corrected' ? (
                        <><span className="text-red-500 line-through mr-1.5">{row.marks}</span> → <span className="font-semibold">{row.correctedMarks}</span></>
                      ) : row.validationStatus === 'absent' ? (
                        <span className="text-slate-400">—</span>
                      ) : row.marks}
                    </td>

                    <td className={`px-4 py-4 truncate ${hasError && row.validationText.includes('Attendance') ? 'text-red-600 font-semibold' : ''}`}>
                      {isEditing ? (
                        <input type="number" className="border border-blue-400 rounded px-2 py-1 w-full text-[13px] font-normal outline-none bg-white" value={editForm.attendance} onChange={(e) => setEditForm({ ...editForm, attendance: e.target.value })} />
                      ) : `${row.attendance}%`}
                    </td>

                    <td className="px-4 py-4 truncate">
                      {row.validationStatus === 'valid' || row.validationStatus === 'absent' ? (
                        <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md font-medium text-[12px] flex items-center gap-1.5 w-max">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>{row.validationText}
                        </span>
                      ) : (
                        <span className="text-red-600 text-[12px] font-semibold flex items-center gap-1">
                          <AlertCircle size={14} /> {row.validationText}
                        </span>
                      )}
                    </td>

                 {/* NEW: Faculty Observation Column */}
<td className="px-4 py-4 truncate">
  {isEditing ? (
    <input
      type="text"
      className="border border-blue-400 rounded px-2 py-1.5 w-full text-[12px] font-normal outline-none bg-white transition"
      placeholder="Observation..."
      value={editForm.facultyObservation || ""}
      onChange={(e) => setEditForm({ ...editForm, facultyObservation: e.target.value })}
    />
  ) : (
    <input
      type="text"
      className="border border-slate-200 bg-transparent hover:bg-slate-50 focus:bg-white rounded px-2 py-1.5 w-full text-[12px] outline-none focus:border-blue-400 transition"
      placeholder="Add observation..."
      value={row.facultyObservation || ""}
      onChange={(e) => {
        const newData = [...parsedData];
        newData[idx] = { ...newData[idx], facultyObservation: e.target.value };
        setParsedData(newData);
      }}
    />
  )}
</td>

                    <td className="px-4 py-4 text-center">
                      {isEditing ? (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => saveEdit(idx)} className="p-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition"><Save size={16} /></button>
                          <button onClick={cancelEdit} className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded transition"><X size={16} /></button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2  group-hover: transition">
                          <button onClick={() => startEdit(idx, row)} className="p-1.5 text-slate-400 hover:text-blue-600 transition"><Edit3 size={16} /></button>
                          <button onClick={() => deleteRow(idx)} className="p-1.5 text-slate-400 hover:text-red-600 transition"><Trash2 size={16} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-[12px] font-normal text-slate-500">Final import: {parsedData.length} records parsed.</p>
          <div className="flex gap-3">
            <button
              onClick={handleReupload}
              className="bg-white border border-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg text-[13px] shadow-sm hover:bg-slate-50 transition"
            >
              Reupload file
            </button>
            <button disabled={errorCount > 0 || isSubmitting} onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-[13px] shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? "Submitting..." : "Submit Marks"}
            </button>
          </div>
        </div>
      </div>

      {/* Submission Confirmation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center">
        <div>
          <h2 className="text-[17px] font-semibold text-slate-800 mb-1">Submission confirmation</h2>
          <p className="text-[12px] font-normal text-slate-500">Publish {parsedData.length} records? This will update performance and subject-wise 3G categories.</p>
        </div>
        <button
          disabled={errorCount > 0 || isSubmitting}
          onClick={onConfirm}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-[12px] shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Confirm & submit"}
        </button>
      </div>
    </div>
  );
}