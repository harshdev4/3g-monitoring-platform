"use client";

import { useState } from "react";
import { FileSpreadsheet, AlertCircle, Save, X, Edit3, Trash2 } from "lucide-react";

export default function ValidationTable({
  file,
  setFile,
  parsedData,
  setParsedData,
  errorCount,
  setCurrentPhase,
  runValidation,
  maxMarks,
  onConfirm
}) {
  const [editingRowIdx, setEditingRowIdx] = useState(null);
  const [editForm, setEditForm] = useState({});

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

  // --- NEW: Reupload Handler with Confirmation ---
  const handleReupload = () => {
    const confirmReupload = window.confirm("Do you want to reupload? Any unsaved edits will be lost.");
    if (confirmReupload) {
      setFile(null);
      setParsedData([]);
      setCurrentPhase(1); // Returns to UploadSection
    }
  };

  return (
    <div className="space-y-6">
      
      {/* File Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-slate-800">{file?.name}</h3>
            <p className="text-[12px] font-normal text-slate-500 mt-0.5">
              {file ? (file.size / 1024).toFixed(1) : "0"} KB · {parsedData.length} rows · Validation complete
            </p>
          </div>
        </div>
        <button 
          onClick={handleReupload}
          className="bg-white border border-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg text-[13px] shadow-sm hover:bg-slate-50"
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
          <h2 className="text-[16px] font-semibold text-slate-800">Preview & validate marks</h2>
        </div>
        
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap table-fixed">
            <thead className="bg-slate-50 text-slate-500 text-[12px] font-semibold border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-4 w-[20%]">Student Name</th>
                <th className="px-4 py-4 w-[12%]">Roll no.</th>
                <th className="px-4 py-4 w-[12%]">Max Marks</th>
                <th className="px-4 py-4 w-[14%]">Marks Obtained</th>
                <th className="px-4 py-4 w-[14%]">Attendance %</th>
                <th className="px-4 py-4 w-[18%]">Validation Status</th>
                <th className="px-4 py-4 w-[10%] text-center">Actions</th>
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
                        <input className="border border-blue-400 rounded px-2 py-1 w-full text-[13px] font-normal outline-none bg-white" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} autoFocus/>
                      ) : row.name}
                    </td>
                    
                    <td className={`px-4 py-4 truncate ${hasError && row.validationText.includes('Duplicate') ? 'text-red-600 font-semibold' : ''}`}>
                      {isEditing ? (
                        <input className="border border-blue-400 rounded px-2 py-1 w-full text-[13px] font-normal outline-none bg-white" value={editForm.roll} onChange={(e) => setEditForm({...editForm, roll: e.target.value})}/>
                      ) : row.roll}
                    </td>

                    <td className="px-4 py-4 truncate">
                      {isEditing ? (
                        <input type="number" className="border border-blue-400 rounded px-2 py-1 w-full text-[13px] font-normal outline-none bg-white" value={editForm.maxMarks} onChange={(e) => setEditForm({...editForm, maxMarks: e.target.value})}/>
                      ) : row.maxMarks}
                    </td>

                    <td className="px-4 py-4 truncate">
                      {isEditing ? (
                        <input type="number" className="border border-blue-400 rounded px-2 py-1 w-full text-[13px] font-normal outline-none bg-white" value={editForm.marks} onChange={(e) => setEditForm({...editForm, marks: e.target.value})}/>
                      ) : row.validationStatus === 'corrected' ? (
                        <><span className="text-red-500 line-through mr-1.5">{row.marks}</span> → <span className="font-semibold">{row.correctedMarks}</span></>
                      ) : row.validationStatus === 'absent' ? (
                        <span className="text-slate-400">—</span>
                      ) : row.marks}
                    </td>

                    <td className={`px-4 py-4 truncate ${hasError && row.validationText.includes('Attendance') ? 'text-red-600 font-semibold' : ''}`}>
                      {isEditing ? (
                        <input type="number" className="border border-blue-400 rounded px-2 py-1 w-full text-[13px] font-normal outline-none bg-white" value={editForm.attendance} onChange={(e) => setEditForm({...editForm, attendance: e.target.value})}/>
                      ) : `${row.attendance}%`}
                    </td>

                    <td className="px-4 py-4 truncate">
                      {row.validationStatus === 'valid' || row.validationStatus === 'absent' ? (
                        <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md font-medium text-[12px] flex items-center gap-1.5 w-max">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>{row.validationText}
                        </span>
                      ) : (
                        <span className="text-red-600 text-[12px] font-semibold flex items-center gap-1">
                          <AlertCircle size={14}/> {row.validationText}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-center">
                      {isEditing ? (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => saveEdit(idx)} className="p-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition"><Save size={16} /></button>
                          <button onClick={cancelEdit} className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded transition"><X size={16} /></button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
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
            {/* Reupload Button with Confirmation */}
            <button 
              onClick={handleReupload}
              className="bg-white border border-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg text-[13px] shadow-sm hover:bg-slate-50 transition"
            >
              Reupload file
            </button>
            <button 
              disabled={errorCount > 0}
              // onClick={() => setCurrentPhase(3)}
              onClick={onConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-[13px] shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Marks
            </button>
          </div>
        </div>
      </div>

      {/* Submission Confirmation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-800 mb-1">Submission confirmation</h2>
          <p className="text-[13px] font-normal text-slate-500">Publish {parsedData.length} records? This will update performance and subject-wise 3G categories.</p>
        </div>
        <button 
          disabled={errorCount > 0} 
          // onClick={() => setCurrentPhase(3)} 
          onClick={onConfirm}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-[13px] shadow-sm transition disabled:opacity-50"
        >
          Confirm & submit
        </button>
      </div>
    </div>
  );
}