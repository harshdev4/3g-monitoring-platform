"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import DashboardFilters from "@/components/teacher/DashboardFilters";
import useTeacherStore from "@/store/useTeacherStore";
// Import modular fragments
import UploadHeader from "./fragments/UploadHeader";
import UploadSection from "./fragments/UploadSection";
import ValidationTable from "./fragments/ValidationTable";
import Header from "@/components/dashboard/Header";
import ViewUploadHistory from "./fragments/ViewUploadHistory";


// Initial mock history data
const initialHistory = [
  { id: "UP-104", filename: "dbms_mse2.xlsx", date: "04 Oct 2026", time: "09:15", uploader: "Prof. Harsh Sharma", class: "1A & 1B", subject: "DBMS", assessment: "MSE-II", rows: 120, errors: 0, status: "Success" },
  { id: "UP-103", filename: "daa_mse2.csv", date: "03 Oct 2026", time: "14:20", uploader: "Prof. Harsh Sharma", class: "MCA-1A", subject: "DAA", assessment: "MSE-II", rows: 60, errors: 0, status: "Success" },
  { id: "UP-102", filename: "dbms_draft.xlsx", date: "03 Oct 2026", time: "11:05", uploader: "Prof. Harsh Sharma", class: "1A & 1B", subject: "DBMS", assessment: "MSE-II", rows: 118, errors: 2, status: "Partial" },
  { id: "UP-101", filename: "os_mse2.csv", date: "02 Oct 2026", time: "10:10", uploader: "Prof. Harsh Sharma", class: "MCA-1B", subject: "Operating Systems", assessment: "MSE-II", rows: 0, errors: 60, status: "Failed" },
  { id: "UP-100", filename: "dbms_mse1.xlsx", date: "10 Sep 2026", time: "16:00", uploader: "Prof. Harsh Sharma", class: "1A & 1B", subject: "DBMS", assessment: "MSE-I", rows: 120, errors: 0, status: "Success" },
];

const UploadMarks = () => {
  // Core States
  const [file, setFile] = useState(null);
  const [maxMarks, setMaxMarks] = useState("100");
  const [currentPhase, setCurrentPhase] = useState(1); // Stepper Phases: 1 to 4
  const [parsedData, setParsedData] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const [activeView, setActiveView] = useState('upload');
  
  // History State
  const [historyData, setHistoryData] = useState(initialHistory);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeFilters = useTeacherStore((state) => state.filters);

  // File Validation Logic
  const runValidation = (rows, overrideMax = maxMarks) => {
    let errors = 0;
    const rollCounts = {};
    rows.forEach(r => {
      if (r.roll) rollCounts[r.roll] = (rollCounts[r.roll] || 0) + 1;

      
    });

    const validatedRows = rows.map((row) => {
      const max = Number(row.maxMarks) || Number(overrideMax); 
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
      } else if (absent === 'No' && numericMarks < 0) {
        status = 'corrected';
        statusText = `Negative max detected (marks<0)`;
        correctedMarks = "Not allow"; 
        errors++; 
      } else if (absent === 'Yes') {
        status = 'absent';
        statusText = 'Valid · Absent';
        correctedMarks = '—';
      }
      return { ...row, absent, validationStatus: status, validationText: statusText, correctedMarks };
    });

    setParsedData(validatedRows);
    setErrorCount(errors);
  };

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
        if (cols.length < 6) continue; 
        rawRows.push({ roll: cols[0], name: cols[1],maxMarks: cols[2] , marks: cols[3], attendance: cols[4],facultyObservation:cols[5] });
      }
      runValidation(rawRows, maxMarks);
      setCurrentPhase(3); // Move to Phase 3: Validate & preview
    };
    reader.readAsText(file);
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith(".csv")) return alert("Please upload a .csv file.");
    setFile(selectedFile);
    setCurrentPhase(2); // Selecting a file moves active step to 2 (Upload File)
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

const downloadTemplate = () => {
    // Added 'Observation' to the header and sample text to the rows
    const csv = [
      "Roll_Number,Student_Name,Max_Marks,Marks_Obtained,Attendance_Percentage,Observation", 
      "1021,Aman Kumar,100,92,90,Good", 
      "1022,Ravi Singh,100,85,100,Excellent", 
      "1023,Neha Sharma,100,60,98,Needs improvement", 
      "1024,Karan Mehta,100,79,95,Consistent", 
      "1031,Dman,100,90,90,Satisfactory"
    ].join("\n");
    
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "marks_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Push new upload record into history array and complete flow
  const handleConfirmSubmission = async() => {
    if (errorCount > 0) {
    return alert("Please fix all errors before submitting.");
  }
  try {
    setIsSubmitting(true);

    // 1. Construct dynamic payload
    console.log(activeFilters.courses);
    
    const payload = {
      marksData: parsedData, // Validated rows from CSV
      filters: {
        className: activeFilters?.className || "MCA-1A",
        courseCode: activeFilters.courses,
        semester: activeFilters?.semester,
        assessment: activeFilters?.assessment,
        academicYear: activeFilters?.academicYear || "2026-27",
      },
    };

    console.log(payload);
    
    // 2. Send request to backend API
    const response = await fetch("/api/marks/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to submit marks.");
    }
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = today.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const newRecord = {
      id: `UP-${100 + historyData.length + 1}`,
      filename: file ? file.name : "marks_upload.csv",
      date: formattedDate,
      time: formattedTime,
      uploader: "Prof. Harsh Sharma",
      class: activeFilters?.className || "MCA-1A",
      subject: activeFilters?.courseName || "DBMS",
      assessment: activeFilters?.assessment || "MSE-II",
      rows: parsedData.length,
      errors: 0,
      status: "Success",
    };

    setHistoryData([newRecord, ...historyData]);
    setCurrentPhase(4); // Move to Phase 4: Confirm Submission / Success
  }
  catch (err) {
    alert("Submission Error: " + err.message);
  } finally {
    setIsSubmitting(false);
  }
}

  // Filter Setup
  const filtersOption = [
    { label: "Class / Section", value: "MCA-1A & MCA-1B", options: ["MCA-1A & MCA-1B"] },
    { label: "Subject", value: "DBMS", options: ["DBMS"] },
    { label: "Semester", value: "Semester I", options: ["Semester I"] },
    { label: "Assessment", value: "MSE-II", options: ["MSE-II"] },
  ];

  // Route to History View
  if (activeView === 'history') {
    return <ViewUploadHistory onBackToUpload={() => setActiveView('upload')} historyData={historyData} />;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen text-[#0f172a] pb-12 font-sans not-italic">
        <main className="mx-auto max-w-[1400px] p-5 md:p-5 space-y-5">

          {/* Modular Header & Stepper */}
          <UploadHeader currentPhase={currentPhase} onViewHistory={() => setActiveView('history')} />

          {/* Global Filters */}
          <div 
          onFocus={() => setCurrentPhase(1)} // Highlights "1 Select assessment" when focusing filters
         onClick={() => setCurrentPhase(1)}   // Highlights "1 Select assessment" when clicking filters
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <DashboardFilters filters={filtersOption} />
            </div>
          </div>

          {/* Phases 1 & 2: Upload Section */}
          {(currentPhase === 1 || currentPhase === 2) && (
            <UploadSection 
              file={file} 
              handleDrop={handleDrop} 
              handleFile={handleFile} 
              processCSV={processCSV} 
              maxMarks={maxMarks} 
              downloadTemplate={downloadTemplate} 
              currentPhase={currentPhase}       
              setCurrentPhase={setCurrentPhase}
            />
          )}

          {/* Phase 3: Validation Table */}
          {currentPhase === 3 && (
            <ValidationTable 
              file={file}
              setFile={setFile}
              parsedData={parsedData}
              setParsedData={setParsedData}
              errorCount={errorCount}
              setCurrentPhase={setCurrentPhase}
              runValidation={runValidation}
              maxMarks={maxMarks}
              onConfirm={handleConfirmSubmission}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Phase 4: Success / Confirmation */}
         
{currentPhase === 4 && (
  <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 font-sans not-italic">
    <h2 className="text-base font-semibold text-slate-800 mb-1">Successful upload</h2>
    <p className="text-xs font-normal text-slate-500 mb-4">Confirmation after submission</p>
    
    <div className="border-l-4 border-[#22c55e] p-4 rounded-r-lg mb-6 flex gap-3 bg-[#f0fdf4]">
      <CheckCircle2 className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="text-xs font-semibold text-[#15803d]">Marks uploaded successfully</h3>
        <p className="text-xs font-normal text-slate-600 mt-1">{parsedData.length} student records saved to the database.</p>
      </div>
    </div>
    
    <div className="flex gap-3">
      {/* Resets file data and sets phase to 1 (Select assessment) */}
      <button 
        onClick={() => { 
          setFile(null); 
          setParsedData([]); 
          setErrorCount(0);
          setCurrentPhase(1); // Explicitly sets stepper back to '1 Select assessment'
        }} 
        className="bg-white border border-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg text-xs shadow-sm hover:bg-slate-50 transition"
      >
        Upload Another Assessment
      </button>
      
      <button 
        onClick={() => setActiveView('history')} 
        className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-lg text-xs shadow-sm transition"
      >
        View Updated History
      </button>
    </div>
  </div>
)}

        </main>
      </div>
    </>
  );
};

export default UploadMarks; 