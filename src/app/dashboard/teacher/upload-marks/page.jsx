// "use client";

// import { useState } from "react";
// import {
//   Bell,
//   Upload,
//   FileSpreadsheet,
//   Download,
//   CheckCircle2,
// } from "lucide-react";
// import DashboardFilters fr om "@/components/teacher/DashboardFilters";
// import Header from "@/components/dashboard/Header";

// const UploadMarks = () => {
//   const [file, setFile] = useState(null);

//   const [assessment, setAssessment] = useState("MSE-2");
//   const [maxMarks, setMaxMarks] = useState("30");

//   const passingMarks = (Number(maxMarks || 0) * 0.4).toFixed(1);

//   const handleFile = (selectedFile) => {
//     if (!selectedFile) return;

//     const validTypes = [
//       "text/csv",
//       "application/vnd.ms-excel",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     ];

//     const isValid =
//       validTypes.includes(selectedFile.type) ||
//       selectedFile.name.endsWith(".csv") ||
//       selectedFile.name.endsWith(".xlsx") ||
//       selectedFile.name.endsWith(".xls");

//     if (!isValid) {
//       alert("Please upload a CSV or Excel file.");
//       return;
//     }

//     setFile(selectedFile);
//   };

//   const handleDrop = (event) => {
//     event.preventDefault();

//     const droppedFile = event.dataTransfer.files?.[0];

//     if (droppedFile) {
//       handleFile(droppedFile);
//     }
//   };


//   const filtersOption = [
//     {
//       label: "Program",
//       value: "MCA",
//       options: ["MCA"],
//     },
//     {
//       label: "Semester",
//       value: "Semester 1",
//       options: ["Semester 1", "Semester 2", "Semester 3", "Semester 4"],
//     },
//     {
//       label: "Class",
//       value: "MCA-A",
//       options: ["MCA-A", "MCA-B"],
//     },
//     {
//       label: "Subject",
//       value: "DBMS",
//       options: ["DBMS", "Operating Systems", "Computer Networks"],
//     },
//     {
//       label: "Assessment",
//       value: "MSE-1",
//       options: ["MSE-1", "MSE-2", "End Semester (Current evaluation)"],
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-[#f6f8fb] text-[#12233f]">

//       {/* =====================================================
//           TOP HEADER
//       ===================================================== */}



//       {/* =====================================================
//           FILTER BAR
//       ===================================================== */}

//         <DashboardFilters filters={filtersOption}/>

//       {/* =====================================================
//           MAIN CONTENT
//       ===================================================== */}

//       <main className="mx-auto grid max-w-[1500px] gap-6 p-5 md:p-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] lg:p-10">

//         {/* ===================================================
//             LEFT: UPLOAD CARD
//         =================================================== */}

//         <section className="rounded-xl border border-[#dfe5ee] bg-white p-5 shadow-sm md:p-6">

//           {/* Card Header */}

//           <div className="flex flex-col justify-between gap-3 border-b border-[#e5eaf1] pb-4 sm:flex-row sm:items-start">

//             <div>
//               <h2 className="text-base font-semibold md:text-lg">
//                 Upload Examination Marks
//               </h2>

//               <p className="mt-1 text-xs text-[#60718c] md:text-sm">
//                 Upload CSV / Excel spreadsheets containing
//                 internal or external examination scores
//               </p>
//             </div>

//             <span className="w-fit rounded-md border border-[#bfd4ff] bg-[#f2f6ff] px-3 py-1.5 text-xs font-semibold text-[#2864d6]">
//               Step 1 of 3
//             </span>

//           </div>


//           {/* Assessment Details */}

//           <div className="mt-5 grid gap-4 md:grid-cols-3">

//             {/* Assessment */}

//             <div>
//               <label className="mb-1.5 block text-xs font-semibold text-[#344560]">
//                 Assessment Round
//               </label>

//               <select
//                 value={assessment}
//                 onChange={(e) => setAssessment(e.target.value)}
//                 className="h-11 w-full rounded-lg border border-[#cbd7e8] bg-white px-3 text-sm text-[#152844] outline-none focus:border-[#2864d6]"
//               >
//                 <option value="MSE-1">
//                   Mid-Semester Exam 1 (MSE-1)
//                 </option>

//                 <option value="MSE-2">
//                   Mid-Semester Exam 2 (MSE-2)
//                 </option>

//                 <option value="ESE">
//                   End Semester Examination (ESE)
//                 </option>
//               </select>
//             </div>


//             {/* Maximum Marks */}

//             <div>
//               <label className="mb-1.5 block text-xs font-semibold text-[#344560]">
//                 Maximum Marks
//               </label>

//               <input
//                 type="number"
//                 value={maxMarks}
//                 onChange={(e) => setMaxMarks(e.target.value)}
//                 className="h-11 w-full rounded-lg border border-[#cbd7e8] px-3 text-sm text-[#152844] outline-none focus:border-[#2864d6]"
//               />
//             </div>


//             {/* Passing */}

//             <div>
//               <label className="mb-1.5 block text-xs font-semibold text-[#344560]">
//                 Passing Cut-off (40%)
//               </label>

//               <div className="flex h-11 items-center rounded-lg border border-[#d8e0eb] bg-[#f0f4f8] px-3 text-sm text-[#52627b]">
//                 {passingMarks} Marks
//               </div>
//             </div>

//           </div>


//           {/* =================================================
//               DROP ZONE
//           ================================================= */}

//           <label
//             onDragOver={(event) => event.preventDefault()}
//             onDrop={handleDrop}
//             className="mt-5 flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#c6d5e8] bg-[#fcfdff] px-5 text-center transition hover:border-[#2864d6] hover:bg-[#f8faff]"
//           >

//             <input
//               type="file"
//               hidden
//               accept=".csv,.xlsx,.xls"
//               onChange={(event) =>
//                 handleFile(event.target.files?.[0])
//               }
//             />


//             <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full text-[#9aabc1]">
//               <Upload size={32} />
//             </div>


//             {file ? (
//               <>
//                 <h3 className="text-sm font-semibold text-[#172943]">
//                   {file.name}
//                 </h3>

//                 <p className="mt-2 text-xs text-[#65758e]">
//                   File selected successfully. Click to replace.
//                 </p>

//                 <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#e9eef5] px-2.5 py-1.5 text-[11px] font-semibold text-[#294362]">
//                   <FileSpreadsheet size={14} />

//                   {(file.size / 1024).toFixed(1)} KB
//                 </span>
//               </>
//             ) : (
//               <>
//                 <h3 className="text-sm font-semibold text-[#172943]">
//                   Click to select CSV/Excel template or drop
//                   file here
//                 </h3>

//                 <p className="mt-2 max-w-2xl text-xs text-[#65758e]">
//                   Expected columns:
//                   {" "}
//                   Roll_Number, Student_Name,
//                   Marks_Obtained, Attendance_Percentage
//                 </p>

//                 <div className="mt-1 flex gap-2">
//                   <span className="rounded bg-[#e9eef5] px-2.5 py-1.5 text-[11px] font-semibold text-[#294362]">
//                     .XLSX
//                   </span>

//                   <span className="rounded bg-[#e9eef5] px-2.5 py-1.5 text-[11px] font-semibold text-[#294362]">
//                     .CSV
//                   </span>
//                 </div>
//               </>
//             )}

//           </label>

//         </section>


//         {/* ===================================================
//             RIGHT COLUMN
//         =================================================== */}

//         <aside className="space-y-5">

//           {/* =================================================
//               TEMPLATE CARD
//           ================================================= */}

//           <section className="rounded-xl border border-[#dfe5ee] bg-white p-5 shadow-sm md:p-6">

//             <h2 className="text-base font-semibold">
//               Standard Templates & Guidelines
//             </h2>

//             <p className="mt-1 text-xs text-[#60718c] md:text-sm">
//               Download pre-formatted class spreadsheets
//             </p>


//             <button
//               type="button"
//               className="mt-4 flex w-full items-center gap-3 rounded-lg border border-[#dbe3ee] bg-[#f9fbfd] p-3 text-left transition hover:bg-[#f3f7fc]"
//             >

//               <div className="flex items-center justify-center text-[#00a16a]">
//                 <Download size={17} />
//               </div>

//               <strong className="text-xs text-[#152943]">
//                 Section D Roster Template
//               </strong>

//               <span className="ml-auto text-xs font-bold text-[#2463df]">
//                 Download
//               </span>

//             </button>

//           </section>


//           {/* =================================================
//               HISTORY CARD
//           ================================================= */}

//           <section className="rounded-xl border border-[#dfe5ee] bg-white p-5 shadow-sm md:p-6">

//             <h2 className="text-base font-semibold">
//               Previous Upload History
//             </h2>


//             <HistoryItem
//               title="MSE-2 Marks (Operating System)"
//               date="Uploaded on Oct 03, 2026"
//               students="60 students processed"
//             />


//             <HistoryItem
//               title="MSE-1 Marks (Operating System)"
//               date="Uploaded on Sep 14, 2026"
//               students="60 students processed"
//             />


//             <div className="mt-5 border-t border-[#e5eaf1] pt-4 text-[11px] leading-relaxed text-[#6c7d96]">
//               All uploaded data is synchronized with
//               Dean Analytics and the National Academic Portal.
//             </div>

//           </section>

//         </aside>

//       </main>

//     </div>
//   );
// };


// /* =========================================================
//    SELECT FIELD
// ========================================================= */

// function SelectField({
//   label,
//   value,
//   options,
// }) {
//   return (
//     <div>
//       <label className="mb-1.5 block text-xs font-semibold text-[#344560]">
//         {label}
//       </label>

//       <select
//         defaultValue={value}
//         className="h-10 w-full rounded-lg border border-[#cbd7e8] bg-white px-3 text-sm font-medium text-[#152844] outline-none focus:border-[#2864d6]"
//       >
//         {options.map((option) => (
//           <option key={option}>
//             {option}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }


// /* =========================================================
//    HISTORY ITEM
// ========================================================= */

// function HistoryItem({
//   title,
//   date,
//   students,
// }) {
//   return (
//     <div className="mt-3 flex flex-col gap-3 rounded-lg border border-[#dbe3ee] bg-[#f9fbfd] p-3 sm:flex-row sm:items-center sm:justify-between">

//       <div>
//         <strong className="text-xs text-[#152943]">
//           {title}
//         </strong>

//         <p className="mt-1 text-[11px] text-[#687993]">
//           {date} • {students}
//         </p>
//       </div>

//       <span className="flex items-center gap-1 text-[11px] font-bold text-[#008c62]">
//         <CheckCircle2 size={14} />
//         Committed
//       </span>

//     </div>
//   );
// }

// export default UploadMarks;


"use client";

import { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  CloudUpload,
  ArrowDown
} from "lucide-react";
import DashboardFilters from "@/components/teacher/DashboardFilters";

const UploadMarks = () => {
  // --- States ---
  const [file, setFile] = useState(null);
  const [maxMarks, setMaxMarks] = useState("100");
  
  // Phase 1 = Uploading, Phase 2 = Validation (Table shows), Phase 3 = Success
  const [currentPhase, setCurrentPhase] = useState(1);
  
  // States for Dynamic Data
  const [parsedData, setParsedData] = useState([]);
  const [errorCount, setErrorCount] = useState(0);

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

  // --- CSV Download Handler ---
  const downloadTemplate = () => {
    const csv = [
      "Roll_Number,Student_Name,Marks_Obtained,Attendance_Percentage",
      "1021,Aman Kumar,32,92",
      "1022,Ravi Singh,65,85",
      "1023,Neha Sharma,105,110", // Example of max marks & invalid attendance
      "1024,Karan Mehta,,0"       // Example of absent
    ].join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "marks_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- Process CSV when 'Validate & Preview' is clicked ---
  const processCSV = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      if (!text) return;

      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) {
        alert("The CSV file is empty or missing data rows.");
        return;
      }

      const seenRolls = new Set();
      const processedRows = [];
      let errors = 0;
      const max = Number(maxMarks);

      // Start at 1 to skip header row
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        if (cols.length < 4) continue; 

        const roll = cols[0];
        const name = cols[1];
        const rawMarks = cols[2];
        const attendance = cols[3];

        let status = 'valid';
        let statusText = 'Valid';
        let correctedMarks = null;
        
        // Absent Logic
        let absent = rawMarks === '' || rawMarks.toLowerCase() === 'absent' || attendance === '0' || attendance === '' ? 'Yes' : 'No';
        
        const numericMarks = Number(rawMarks);
        const numericAtt = Number(attendance);

        // Validation Rules
        if (seenRolls.has(roll)) {
          status = 'error';
          statusText = 'Duplicate roll · Remove row';
          errors++;
        } else if (absent === 'No' && (isNaN(numericAtt) || numericAtt < 0 || numericAtt > 100)) {
          // Check if attendance is NOT between 0 and 100
          status = 'error';
          statusText = 'Attendance must be 0-100%';
          errors++;
        } else if (absent === 'No' && numericMarks > max) {
          status = 'corrected';
          statusText = `Exceeds max · Corrected to ${max}`;
          correctedMarks = max.toString();
          errors++;
        } else if (absent === 'Yes') {
          status = 'absent';
          statusText = 'Valid · Absent';
          correctedMarks = '—';
        }

        seenRolls.add(roll);

        processedRows.push({
          name: name,
          roll: roll,
          class: 'MCA', // Static fallback
          marks: rawMarks,
          correctedMarks: correctedMarks,
          absent: absent,
          validationStatus: status,
          validationText: statusText,
          attendance: attendance
        });
      }

      setParsedData(processedRows);
      setErrorCount(errors);
      setCurrentPhase(2); 
    };
    
    reader.readAsText(file);
  };

  // --- Filter Config ---
  const filtersOption = [
    { label: "Class / Section", value: "MCA-1A & MCA-1B", options: ["MCA-1A & MCA-1B", "MCA-2A"] },
    { label: "Subject", value: "DBMS", options: ["DBMS", "Operating Systems", "Computer Networks"] },
    { label: "Semester", value: "Semester I", options: ["Semester I", "Semester II"] },
    { label: "Assessment", value: "MSE-II", options: ["MSE-I", "MSE-II", "ESE"] },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] pb-12">
      <main className="mx-auto max-w-[1300px] p-5 md:p-8 space-y-6">

        {/* 1. HEADER AREA */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Teacher workspace</p>
            <h1 className="text-2xl font-bold text-slate-800 mt-1">Upload Marks</h1>
            <p className="text-sm text-slate-500 mt-1">
              Import assessment marks, validate student records and publish a checkpoint.
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm">
            View Upload History
          </button>
        </div>

        {/* 2. STEPPER */}
        <div className="flex flex-col sm:flex-row gap-3">
          {['1 Select assessment', '2 Upload file', '3 Validate & preview', '4 Confirm submission'].map((step, idx) => (
            <div 
              key={idx} 
              className={`flex-1 border rounded-lg p-3 text-sm transition-colors ${
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <DashboardFilters filters={filtersOption} />
          </div>
          <div className="w-full md:w-[200px]">
            <label className="block text-xs font-semibold text-[#344560] mb-1.5">
              Maximum marks
            </label>
            <input
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#cbd7e8] bg-white px-3 text-sm font-medium text-[#152844] outline-none focus:border-[#2864d6]"
            />
          </div>
        </div>

        {/* 4. UPLOAD & RULES GRID (Phase 1) */}
        {currentPhase === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Upload Box */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <h2 className="text-base font-bold text-slate-800 mb-4">Import CSV</h2>
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
                    <p className="font-bold text-slate-800 text-sm">{file.name}</p>
                    <p className="text-xs text-slate-500 mt-1 mb-4">File selected successfully.</p>
                    <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md text-xs font-semibold">
                      <FileSpreadsheet size={14} />
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-slate-800 text-sm">Drag & drop your marks file here</p>
                    <p className="text-xs text-slate-500 mt-1 mb-5">CSV only · up to 10 MB · one student per row</p>
                    <div className="bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg text-sm shadow-sm hover:bg-slate-50">
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Validate & preview
                </button>
              </div>
            </div>

            {/* Template & Import Rules Box (Matches Figma EXACTLY) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-[17px] font-bold text-[#0f172a] mb-5">Template & import rules</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-[14px] font-semibold text-[#0f172a]">Required columns: Roll number, Marks, Absent</h3>
                  <p className="text-[13px] text-slate-500 mt-1">Marks must be 0–{maxMarks}. Use Yes / No for absence; leave marks empty when absent.</p>
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-[#0f172a]">Match enrolled student rolls</h3>
                  <p className="text-[13px] text-slate-500 mt-1">Duplicate or unknown rolls cannot be submitted. Category updates use validated marks only.</p>
                </div>
              </div>
              <button onClick={downloadTemplate} className="mt-6 flex items-center gap-2 bg-white border border-slate-200 text-[#0f172a] font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm hover:bg-slate-50 transition">
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
                  <h3 className="text-sm font-bold text-slate-800">{file?.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {file ? (file.size / 1024).toFixed(1) : "0"} KB · {parsedData.length} rows · Validation complete
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setFile(null); setParsedData([]); setCurrentPhase(1); }}
                className="bg-white border border-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm shadow-sm hover:bg-slate-50"
              >
                Replace file
              </button>
            </div>

            {/* ERROR BANNER */}
            {errorCount > 0 && (
              <div className="bg-red-50/80 border-l-4 border-red-500 rounded-r-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-red-600">{errorCount} rows need correction before submission</h3>
                  <p className="text-xs text-slate-600 mt-1">{parsedData.length - errorCount} valid records. Fix the highlighted rows or replace the file.</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Preview & validate marks</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3 font-medium">Student</th>
                      <th className="px-5 py-3 font-medium">Roll no.</th>
                      <th className="px-5 py-3 font-medium">Class</th>
                      <th className="px-5 py-3 font-medium">Marks / {maxMarks}</th>
                      <th className="px-5 py-3 font-medium">Attendance %</th>
                      <th className="px-5 py-3 font-medium">Absent</th>
                      <th className="px-5 py-3 font-medium">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {/* DYNAMIC MAP OF PARSED DATA */}
                    {parsedData.map((row, idx) => (
                      <tr 
                        key={idx} 
                        className={row.validationStatus === 'error' || row.validationStatus === 'corrected' ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-slate-50/50'}
                      >
                        <td className="px-5 py-3.5 text-slate-800">{row.name}</td>
                        <td className={`px-5 py-3.5 ${row.validationStatus === 'error' && row.validationText.includes('Duplicate') ? 'text-red-600 font-semibold' : ''}`}>{row.roll}</td>
                        <td className="px-5 py-3.5">{row.class}</td>
                        <td className="px-5 py-3.5">
                          {row.validationStatus === 'corrected' ? (
                            <><span className="text-red-500 line-through mr-1.5">{row.marks}</span> → {row.correctedMarks}</>
                          ) : row.validationStatus === 'absent' ? (
                            <span className="text-slate-400">—</span>
                          ) : (
                            row.marks
                          )}
                        </td>
                        <td className={`px-5 py-3.5 ${row.validationStatus === 'error' && row.validationText.includes('Attendance') ? 'text-red-600 font-semibold' : ''}`}>
                          {row.attendance}%
                        </td>
                        <td className="px-5 py-3.5">{row.absent}</td>
                        <td className="px-5 py-3.5">
                          {row.validationStatus === 'valid' ? (
                            <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md font-medium text-[11px] flex items-center gap-1.5 w-max">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>{row.validationText}
                            </span>
                          ) : (
                            <span className="text-slate-600 text-[12px]">{row.validationText}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-[12px] text-slate-500">Final import: {parsedData.length} records parsed.</p>
                <div className="flex gap-3">
                  <button className="bg-white border border-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm shadow-sm hover:bg-slate-50">
                    Revalidate file
                  </button>
                  <button 
                    disabled={errorCount > 0}
                    onClick={() => setCurrentPhase(3)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg text-sm shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Marks
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-800 mb-1">Submission confirmation</h2>
                <p className="text-[13px] text-slate-500">Publish {parsedData.length} records? This will update performance and subject-wise 3G categories.</p>
              </div>
              <button 
                disabled={errorCount > 0} 
                onClick={() => setCurrentPhase(3)} 
                className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-sm shadow-sm transition disabled:opacity-50"
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
              <h2 className="text-base font-bold text-slate-800 mb-1">Successful upload</h2>
              <p className="text-[13px] text-slate-500 mb-4">Confirmation after submission</p>
              
              <div className="bg-[#f0fdf4] border-l-4 border-[#22c55e] p-4 rounded-r-lg mb-6 flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-[#15803d]">Marks uploaded successfully</h3>
                  <p className="text-[12px] text-slate-600 mt-1">{parsedData.length} student records saved to the database.</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => { setFile(null); setParsedData([]); setCurrentPhase(1); }} 
              className="w-fit bg-white border border-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm shadow-sm hover:bg-slate-50"
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
