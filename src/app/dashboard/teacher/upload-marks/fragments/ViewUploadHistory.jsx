"use client";

import Header from "@/components/dashboard/Header";
import { Search, Info } from "lucide-react";

// Accept historyData as a prop
export default function ViewUploadHistory({ onBackToUpload, historyData }) {
  
  // Dynamically calculate stats based on the data
  const totalImports = historyData.length;
  const successCount = historyData.filter(item => item.status === "Success").length;
  const partialCount = historyData.filter(item => item.status === "Partial").length;
  const failedCount = historyData.filter(item => item.status === "Failed").length;

  
  const filterDataHistory = [
    { id: "class", label: "Class / Section", defaultOption: "All assigned classes" },
    { id: "subject", label: "Subject", defaultOption: "All subjects" },
    { id: "assessment", label: "Assessment", defaultOption: "All assessments" },
    { id: "status", label: "Import status", defaultOption: "All statuses" },
    { id: "dateRange", label: "Date range", defaultOption: "Aug-Oct 2026" },
  ];

  // Intercepts the Cloudinary file, formats the roll number with 'ID-', and forces .csv download
  const handleHistoryDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const text = await response.text();

      const lines = text.split('\n');
      // const formattedLines = lines.map((line, index) => {
      //   if (index === 0 || !line.trim()) return line;
      //   const cols = line.split(',');
      //   if (cols.length > 0 && cols[0]) {
      //    const rawRoll = cols[0].replace(/["']/g, '').replace('ID-', '').trim();
      //     cols[0] = `"${rawRoll}"`; 
      //   }
      //   return cols.join(',');
      // });
      const formattedLines = lines.map((line, index) => {
        if (index === 0 || !line.trim()) return line;
        const cols = line.split(',');
        if (cols.length > 0 && cols[0]) {
          const rawRoll = cols[0].replace(/["']/g, '').replace('ID-', '').trim();
          // Applies the invisible formula trick to the history downloads
          cols[0] = `="${rawRoll}"`; 
        }
        return cols.join(',');
      });

      const finalCSV = formattedLines.join('\n');
      const blob = new Blob(['\uFEFF' + finalCSV], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      const safeName = fileName ? fileName.replace('.csv', '') : 'import';
      link.download = `${safeName}.csv`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(fileUrl, "_blank"); // Fallback
    }
  };

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] pb-12" >
      <main className="mx-auto max-w-[1400px] p-5 md:p-5 space-y-6">
        
        {/* HEADER AREA */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium text-slate-500  tracking-wide">Teacher workspace / Upload Marks / History</p>
            <h1 className="text-[27px] font-bold text-slate-800 mt-1">Upload History</h1>
            <p className="text-[12px] font-normal text-slate-500 mt-1">
              Assessment imports - Faculty audit trail - Academic Year 2026-27
            </p>
          </div>
          <button 
            onClick={onBackToUpload} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-[12px] transition shadow-sm"
          >
            Upload Marks
          </button>
        </div>

        {/* FILTERS & SEARCH */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {filterDataHistory.map((filter) => (
              <div key={filter.id}>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                  {filter.label}
                </label>
                <select 
                  name={filter.id}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-[12px] text-slate-700 outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">{filter.defaultOption}</option>
                </select>
              </div>
            ))}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search file name or import ID" 
              className="w-full border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-[12px] outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* DYNAMIC SUMMARY STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-[12px] font-medium text-slate-500">Total imports</h3>
            <p className="text-[28px] font-bold text-slate-800 mt-1">{totalImports}</p>
            <p className="text-[11px] text-slate-400 mt-2">This academic year</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-[12px] font-medium text-slate-500">Successful</h3>
            <p className="text-[28px] font-bold text-slate-800 mt-1">{successCount}</p>
            <p className="text-[11px] text-slate-400 mt-2">Published assessment records</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-[12px] font-medium text-slate-500">Needs correction</h3>
            <p className="text-[28px] font-bold text-slate-800 mt-1">{partialCount}</p>
            <p className="text-[11px] text-slate-400 mt-2">Imports with invalid rows</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-[12px] font-medium text-slate-500">Failed</h3>
            <p className="text-[28px] font-bold text-slate-800 mt-1">{failedCount}</p>
            <p className="text-[11px] text-slate-400 mt-2">No records published</p>
          </div>
        </div>

        {/* PAST IMPORTS TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-[17px] font-bold text-slate-800">Past imports</h2>
            <p className="text-[11px] text-slate-500 mt-1">Newest first · All uploads by Prof. Harsh Sharma</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 text-[10px] font-semibold border-b border-slate-200 uppercase">
                <tr>
                  <th className="px-5 py-3">Import / file</th>
                  <th className="px-5 py-3">Date / uploader</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Assessment</th>
                  <th className="px-5 py-3">Rows</th>
                  <th className="px-5 py-3">Errors</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {historyData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4">
                      <span className="text-slate-800">{row.id}</span>
                      <span className="text-slate-400 mx-1">·</span>
                      {row.filename}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-800">{row.date} {row.time}</div>
                      <div className="text-[12px] font-normal text-slate-500">{row.uploader}</div>
                    </td>
                    <td className="px-5 py-4">{row.class}</td>
                    <td className="px-5 py-4">{row.subject}</td>
                    <td className="px-5 py-4">{row.assessment}</td>
                    <td className="px-5 py-4">{row.rows}</td>
                    <td className="px-5 py-4">{row.errors}</td>
                    <td className="px-5 py-4">
                      {row.status === "Success" && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1.5 w-max"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>Success</span>}
                      {row.status === "Partial" && <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1.5 w-max"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>Partial</span>}
                      {row.status === "Failed" && <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1.5 w-max"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>Failed</span>}
                    </td>
                    
                    {/* HERE IS THE UPDATED VIEW IMPORT BUTTON */}
                    <td className="px-5 py-4">
                      {row.fileUrl ? (
                        <button 
                          onClick={() => handleHistoryDownload(row.fileUrl, row.filename)}
                          className="text-blue-600 hover:text-blue-800 font-semibold transition text-[13px] inline-block"
                        >
                          {row.status === "Success" ? "View import" : "View errors"}
                        </button>
                      ) : (
                        <button 
                          disabled
                          className="text-slate-400 font-semibold transition text-[13px] cursor-not-allowed"
                        >
                          No file
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-[12px] text-slate-500 font-medium">
            <span>Showing 1-{Math.min(5, historyData.length)} of {historyData.length} imports</span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 bg-white hover:bg-slate-50 transition">Previous</button>
              <button className="px-3 py-1.5 border border-blue-600 bg-blue-600 text-white rounded font-bold">1</button>
              <button className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 bg-white hover:bg-slate-50 transition">Next</button>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-[17px] font-bold text-slate-800 mb-4">Selected import · {historyData[0]?.id}</h2>
              <div className="mb-4">
                <h3 className="text-[13px] font-bold text-slate-800">{historyData[0]?.rows} records successfully published</h3>
                <p className="text-[12px] text-slate-500 mt-1">{historyData[0]?.subject} · {historyData[0]?.assessment} · {historyData[0]?.class} · {historyData[0]?.date}, {historyData[0]?.time} IST</p>
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-slate-800">Uploaded by {historyData[0]?.uploader}</h3>
                <p className="text-[12px] text-slate-500 mt-1">Source: {historyData[0]?.filename} · Categories recalculated after validation.</p>
              </div>
            </div>
            
            {/* HERE IS THE BOTTOM DOWNLOAD BUTTON UPDATED TOO */}
            {historyData[0]?.fileUrl ? (
              <button 
                onClick={() => handleHistoryDownload(historyData[0].fileUrl, historyData[0].filename)}
                className="mt-6 w-fit inline-block bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg text-[13px] shadow-sm hover:bg-slate-50 transition"
              >
                Download imported records
              </button>
            ) : (
              <button disabled className="mt-6 w-fit bg-slate-100 border border-slate-200 text-slate-400 font-semibold px-4 py-2 rounded-lg text-[13px] cursor-not-allowed">
                No file available
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-[17px] font-bold text-slate-800 mb-4">Validation audit</h2>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 mb-6">
              <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <h3 className="text-[13px] font-bold text-blue-800">UP-102 superseded by UP-104</h3>
                <p className="text-[12px] text-blue-700/80 mt-1">Two invalid rows were corrected before the final 120-record upload.</p>
              </div>
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-slate-800">Failed upload did not change marks</h3>
              <p className="text-[12px] text-slate-500 mt-1">UP-101 had missing roll numbers. Correct the CSV and upload again.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </>
  );
}