"use client";

import { CloudUpload, FileSpreadsheet, ArrowDown } from "lucide-react";

export default function UploadSection({ 
  file, 
  handleDrop, 
  handleFile, 
  processCSV, 
  maxMarks, 
  downloadTemplate 
}) {
  return (
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
  );
}