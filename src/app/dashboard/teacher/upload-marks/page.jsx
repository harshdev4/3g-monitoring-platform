"use client";

import { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  CloudUpload,
  ArrowDown,
  Trash2,
  Save,
  X,
  Edit3
} from "lucide-react";
import DashboardFilters from "@/components/teacher/DashboardFilters";

const UploadMarks = () => {
  // --- States ---
  const [file, setFile] = useState(null);
  
  // Phase 1 = Uploading, Phase 2 = Validation (Table shows), Phase 3 = Success
  const [currentPhase, setCurrentPhase] = useState(1);
  
  // Table Data States
  const [parsedData, setParsedData] = useState([]);
  const [errorCount, setErrorCount] = useState(0);

  // Editing States
  const [editingRowIdx, setEditingRowIdx] = useState(null);
  const [editForm, setEditForm] = useState({});

  // --- Handlers ---
  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith(".csv")) {
      alert("Please upload a .csv file for this implementation.");
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const downloadTemplate = () => {
    const csv = [
      "Roll_Number,Student_Name,Marks_Obtained,Attendance_Percentage,Max_Marks",
      "1021,Aman Kumar,32,92,50",
      "1022,Ravi Singh,65,85,100",
      "1023,Neha Sharma,105,110,100", 
      "1024,Karan Mehta,,0,100",      
      "1021,Duplicate Aman,20,90,50"  
    ].join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "marks_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- Core Validation Engine ---
  const runValidation = (rows) => {
    let errors = 0;

    const rollCounts = {};
    rows.forEach(r => {
      if(r.roll) {
        rollCounts[r.roll] = (rollCounts[r.roll] || 0) + 1;
      }
    });

    const validatedRows = rows.map((row) => {
      const max = Number(row.maxMarks) || 0; 
      const numericMarks = Number(row.marks);
      const numericAtt = Number(row.attendance);
      
      let absent = row.marks === '' || String(row.marks).toLowerCase() === 'absent' || row.attendance === '0' || row.attendance === '' ? 'Yes' : 'No';
      
      let status = 'valid';
      let statusText = 'Valid';
      let correctedMarks = null;

      if (rollCounts[row.roll] > 1) {
        status = 'error';
        statusText = 'Duplicate roll · Remove/Edit';
        errors++;
      } else if (absent === 'No' && (isNaN(numericAtt) || numericAtt < 0 || numericAtt > 100)) {
        status = 'error';
        statusText = 'Attendance must be 0-100%';
        errors++;
      } else if (absent === 'No' && numericMarks > max) {
        status = 'corrected';
        statusText = `Exceeds max (${max}) · Corrected to ${max}`;
        correctedMarks = max.toString();
        errors++; 
      } else if (absent === 'Yes') {
        status = 'absent';
        statusText = 'Valid · Absent';
        correctedMarks = '—';
      }

      return {
        ...row,
        absent,
        validationStatus: status,
        validationText: statusText,
        correctedMarks
      };
    });

    setParsedData(validatedRows);
    setErrorCount(errors);
  };

  // --- Process CSV Initial ---
  const processCSV = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      if (!text) return;

      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) return alert("The CSV file is empty or missing data rows.");

      const rawRows = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        if (cols.length < 5) continue; 

        rawRows.push({
          roll: cols[0],
          name: cols[1],
          marks: cols[2],
          attendance: cols[3],
          maxMarks: cols[4], 
          class: 'MCA', 
        });
      }

      runValidation(rawRows);
      setCurrentPhase(2); 
    };
    reader.readAsText(file);
  };

  // --- Row Action Handlers ---
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
    runValidation(newData); 
    setEditingRowIdx(null);
  };

  const deleteRow = (index) => {
    const newData = [...parsedData];
    newData.splice(index, 1);
    runValidation(newData); 
  };

  const filtersOption = [
    { label: "Class / Section", value: "MCA-1A & MCA-1B", options: ["MCA-1A & MCA-1B", "MCA-2A"] },
    { label: "Subject", value: "DBMS", options: ["DBMS", "Operating Systems", "Computer Networks"] },
    { label: "Semester", value: "Semester I", options: ["Semester I", "Semester II"] },
    { label: "Assessment", value: "MSE-II", options: ["MSE-I", "MSE-II", "ESE"] },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] pb-12" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <main className="mx-auto max-w-[1400px] p-5 md:p-8 space-y-6">

        {/* 1. HEADER AREA */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Teacher workspace</p>
            <h1 className="text-2xl font-bold text-slate-800 mt-1">Upload Marks</h1>
            <p className="text-[13px] font-normal text-slate-500 mt-1">
              Import assessment marks, validate student records and publish a checkpoint.
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-[13px] transition shadow-sm">
            View Upload History
          </button>
        </div>

        {/* 2. STEPPER */}
        <div className="flex flex-col sm:flex-row gap-3">
          {['1 Select assessment', '2 Upload file', '3 Validate & preview', '4 Confirm submission'].map((step, idx) => (
            <div 
              key={idx} 
              className={`flex-1 border rounded-lg p-3 text-[13px] transition-colors ${
                (currentPhase === 1 && idx === 1) || (currentPhase === 2 && idx === 2) || (currentPhase === 3 && idx === 3)
                  ? 'border-blue-500 text-blue-700 bg-blue-50/50 font-semibold' 
                  : 'bg-white border-slate-200 text-slate-500 font-medium'
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        {/* 3. FILTERS CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <DashboardFilters filters={filtersOption} />
        </div>

        {/* 4. UPLOAD & RULES GRID (Phase 1) */}
        {currentPhase === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Upload Box */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <h2 className="text-[16px] font-semibold text-slate-800 mb-4">Import CSV</h2>
              <label 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="flex-1 border-2 border-dashed border-blue-400 bg-blue-50/40 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50/70 transition"
              >
                <input
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={(event) => handleFile(event.target.files?.[0])}
                />
                <CloudUpload className="w-10 h-10 text-blue-500 mb-4" />
                
                {file ? (
                  <>
                    <p className="font-semibold text-slate-800 text-[13px]">{file.name}</p>
                    <p className="text-[12px] font-normal text-slate-500 mt-1 mb-4">File selected successfully.</p>
                    <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md text-[12px] font-semibold">
                      <FileSpreadsheet size={14} />
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-slate-800 text-[13px]">Drag & drop your marks file here</p>
                    <p className="text-[12px] font-normal text-slate-500 mt-1 mb-5">CSV only · up to 10 MB · one student per row</p>
                    <div className="bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg text-[13px] shadow-sm hover:bg-slate-50">
                      Browse files
                    </div>
                  </>
                )}
              </label>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  disabled={!file}
                  onClick={processCSV} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-[13px] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Validate & preview
                </button>
              </div>
            </div>

            {/* Template & Import Rules Box */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-[16px] font-semibold text-[#0f172a] mb-5">Template & import rules</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-[13px] font-semibold text-[#0f172a]">Required columns: Roll_Number, Student_Name, Marks_Obtained, Attendance_Percentage, Max_Marks</h3>
                  <p className="text-[13px] font-normal text-slate-500 mt-1">Marks obtained must not exceed the row's Max_Marks. Use Yes / No for absence; leave marks empty when absent.</p>
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-[#0f172a]">Match enrolled student rolls</h3>
                  <p className="text-[13px] font-normal text-slate-500 mt-1">Duplicate or unknown rolls cannot be submitted. Category updates use validated marks only.</p>
                </div>
              </div>
              <button onClick={downloadTemplate} className="mt-6 flex items-center gap-2 bg-white border border-slate-200 text-[#0f172a] font-semibold px-4 py-2.5 rounded-lg text-[13px] shadow-sm hover:bg-slate-50 transition">
                <ArrowDown size={16} strokeWidth={2.5} className="text-[#0f172a]" />
                Download sample template
              </button>
            </div>

          </div>
        )}

        {/* 5. VALIDATION PHASE (Phase 2) */}
        {currentPhase === 2 && (
          <div className="space-y-6">
            
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
                onClick={() => { setFile(null); setParsedData([]); setCurrentPhase(1); }}
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

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-[16px] font-semibold text-slate-800">Preview & validate marks</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px] whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 text-[12px] font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Roll no.</th>
                      <th className="px-4 py-3">Max Marks</th>
                      <th className="px-4 py-3">Marks Obtained</th>
                      <th className="px-4 py-3">Attendance %</th>
                      <th className="px-4 py-3">Validation Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
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
                          <td className="px-4 py-3 text-slate-800 font-medium">
                            {isEditing ? (
                              <input className="border border-blue-400 rounded px-2 py-1 w-full text-[13px] font-normal outline-none bg-white" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} autoFocus/>
                            ) : (
                              row.name
                            )}
                          </td>
                          
                          <td className={`px-4 py-3 ${hasError && row.validationText.includes('Duplicate') ? 'text-red-600 font-semibold' : ''}`}>
                            {isEditing ? (
                              <input className="border border-blue-400 rounded px-2 py-1 w-24 text-[13px] font-normal outline-none bg-white" value={editForm.roll} onChange={(e) => setEditForm({...editForm, roll: e.target.value})}/>
                            ) : (
                              row.roll
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {isEditing ? (
                              <input type="number" className="border border-blue-400 rounded px-2 py-1 w-20 text-[13px] font-normal outline-none bg-white" value={editForm.maxMarks} onChange={(e) => setEditForm({...editForm, maxMarks: e.target.value})}/>
                            ) : (
                              row.maxMarks
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {isEditing ? (
                              <input type="number" className="border border-blue-400 rounded px-2 py-1 w-20 text-[13px] font-normal outline-none bg-white" value={editForm.marks} onChange={(e) => setEditForm({...editForm, marks: e.target.value})}/>
                            ) : row.validationStatus === 'corrected' ? (
                              <><span className="text-red-500 line-through mr-1.5">{row.marks}</span> → <span className="font-semibold">{row.correctedMarks}</span></>
                            ) : row.validationStatus === 'absent' ? (
                              <span className="text-slate-400">—</span>
                            ) : (
                              row.marks
                            )}
                          </td>

                          <td className={`px-4 py-3 ${hasError && row.validationText.includes('Attendance') ? 'text-red-600 font-semibold' : ''}`}>
                            {isEditing ? (
                              <input type="number" className="border border-blue-400 rounded px-2 py-1 w-20 text-[13px] font-normal outline-none bg-white" value={editForm.attendance} onChange={(e) => setEditForm({...editForm, attendance: e.target.value})}/>
                            ) : (
                              `${row.attendance}%`
                            )}
                          </td>

                          <td className="px-4 py-3">
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

                          <td className="px-4 py-3 text-right">
                            {isEditing ? (
                              <div className="flex justify-end gap-2">
                                <button onClick={() => saveEdit(idx)} className="p-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition" title="Save"><Save size={16} /></button>
                                <button onClick={cancelEdit} className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded transition" title="Cancel"><X size={16} /></button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                                <button onClick={() => startEdit(idx, row)} className="p-1.5 text-slate-400 hover:text-blue-600 transition" title="Edit Row"><Edit3 size={16} /></button>
                                <button onClick={() => deleteRow(idx)} className="p-1.5 text-slate-400 hover:text-red-600 transition" title="Delete Row"><Trash2 size={16} /></button>
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
                  <button className="bg-white border border-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg text-[13px] shadow-sm hover:bg-slate-50">
                    Revalidate file
                  </button>
                  <button 
                    disabled={errorCount > 0}
                    onClick={() => setCurrentPhase(3)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-[13px] shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Marks
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-[16px] font-semibold text-slate-800 mb-1">Submission confirmation</h2>
                <p className="text-[13px] font-normal text-slate-500">Publish {parsedData.length} records? This will update performance and subject-wise 3G categories.</p>
              </div>
              <button 
                disabled={errorCount > 0} 
                onClick={() => setCurrentPhase(3)} 
                className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-[13px] shadow-sm transition disabled:opacity-50"
              >
                Confirm & submit
              </button>
            </div>
          </div>
        )}

        {/* 6. SUCCESS PHASE (Phase 3) */}
        {currentPhase === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-slate-800 mb-1">Successful upload</h2>
              <p className="text-[13px] font-normal text-slate-500 mb-4">Confirmation after submission</p>
              
              <div className="bg-[#f0fdf4] border-l-4 border-[#22c55e] p-4 rounded-r-lg mb-6 flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-[13px] font-semibold text-[#15803d]">Marks uploaded successfully</h3>
                  <p className="text-[12px] font-normal text-slate-600 mt-1">{parsedData.length} student records saved to the database.</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => { setFile(null); setParsedData([]); setCurrentPhase(1); }} 
              className="w-fit bg-white border border-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg text-[13px] shadow-sm hover:bg-slate-50"
            >
              Upload Another Assessment
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default UploadMarks;