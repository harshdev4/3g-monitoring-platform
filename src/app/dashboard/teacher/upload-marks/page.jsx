"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import DashboardFilters from "@/components/teacher/DashboardFilters";
import useTeacherStore from "@/store/useTeacherStore";
// Import modular fragments
import UploadHeader from "./fragments/UploadHeader";
import UploadSection from "./fragments/UploadSection";
import ValidationTable from "./fragments/ValidationTable";
import Header from "@/components/dashboard/Header";
import ViewUploadHistory from "./fragments/ViewUploadHistory";
import axios from "axios";
import { Toaster, toast } from 'sonner';



const UploadMarks = () => {
  // Core States
  const [file, setFile] = useState(null);
  const [maxMarks, setMaxMarks] = useState("100");
  const [currentPhase, setCurrentPhase] = useState(1); // Stepper Phases: 1 to 4
  const [parsedData, setParsedData] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const [activeView, setActiveView] = useState('upload');

  // History State
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionWarning, setSubmissionWarning] = useState("");

  const activeFilters = useTeacherStore((state) => state.filters);
  const [fileBase64, setFileBase64] = useState(null);
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/marks/");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Unable to load upload history.");
        }
        setHistoryData(data.history ?? []);
      } catch (error) {
        setHistoryError(error.message || "Unable to load upload history.");
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

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
      return {
        ...row,
        absent,
        validationStatus: status,
        validationText: statusText,
        correctedMarks,
        three_g_category: null,
      };
    });

    const rankedRows = validatedRows
      .map((row, index) => {
        const max = Number(row.maxMarks) || Number(overrideMax);
        const marks = Number(row.marks);
        if (
          row.validationStatus !== "valid" ||
          row.absent === "Yes" ||
          !Number.isFinite(marks) ||
          !Number.isFinite(max) ||
          max <= 0
        ) {
          return null;
        }

        return { index, percentage: (marks / max) * 100 };
      })
      .filter(Boolean)
      .sort((a, b) => b.percentage - a.percentage);

    let rank = 0;
    let previousPercentage;
    rankedRows.forEach(({ index, percentage }, position) => {
      if (position === 0 || percentage !== previousPercentage) {
        rank += 1;
      }
      validatedRows[index].three_g_category =
        rank <= 10
          ? "Gallant"
          : percentage < 40
            ? "Gradual"
            : "Growing";
      previousPercentage = percentage;
    });

    setParsedData(validatedRows);
    setErrorCount(errors);
  };

  const processExcel = async () => {
    if (!file) return;
    try {
      const [
        { fromBlob, loadWorkbook },
        { getSheetByIndex },
        { iterRows },
        { getCellDisplayText },
      ] = await Promise.all([
        import("@office-kit/xlsx/io"),
        import("@office-kit/xlsx/workbook"),
        import("@office-kit/xlsx/worksheet"),
        import("@office-kit/xlsx/styles"),
      ]);
      const workbook = await loadWorkbook(fromBlob(file));
      const worksheet = getSheetByIndex(workbook, 0);
      if (!worksheet) {
        throw new Error("The Excel file does not contain a worksheet.");
      }

      const rows = Array.from(iterRows(worksheet), (row) =>
        row.map((cell) => cell ? getCellDisplayText(workbook, cell).trim() : "")
      );
      const normalizeHeader = (value) =>
        value.toLowerCase().replace(/[^a-z0-9]/g, "");
      const columnAliases = {
        roll: ["rollnumber", "universityrollno", "rollno"],
        name: ["studentname", "name"],
        maxMarks: ["maxmarks", "maximummarks"],
        marks: ["marksobtained", "obtainedmarks"],
        attendance: ["attendancepercentage", "attendance"],
        facultyObservation: ["facultyobservation", "observation"],
      };
      const getColumnIndexes = (headerRow) => Object.fromEntries(
        Object.entries(columnAliases).map(([key, aliases]) => [
          key,
          headerRow.findIndex((value) => aliases.includes(normalizeHeader(value))),
        ])
      );
      const headerRowIndex = rows.findIndex((row) => {
        const columns = getColumnIndexes(row);
        return ["roll", "name", "maxMarks", "marks", "attendance"]
          .every((key) => columns[key] >= 0);
      });

      if (headerRowIndex < 0) {
        throw new Error(
          "The Excel file must include Roll Number, Student Name, Max Marks, Marks Obtained, and Attendance Percentage columns."
        );
      }

      const columns = getColumnIndexes(rows[headerRowIndex]);
      const rawRows = rows
        .slice(headerRowIndex + 1)
        .filter((row) => row.some((value) => value !== ""))
        .map((row) => ({
          roll: row[columns.roll] ?? "",
          name: row[columns.name] ?? "",
          maxMarks: row[columns.maxMarks] ?? "",
          marks: row[columns.marks] ?? "",
          attendance: row[columns.attendance] ?? "",
          facultyObservation: columns.facultyObservation >= 0
            ? row[columns.facultyObservation] ?? ""
            : "",
        }));

      if (rawRows.length === 0) {
        throw new Error("The Excel file does not contain any student records.");
      }

      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Unable to read the Excel file for upload."));
        reader.readAsDataURL(file);
      });
      setFileBase64(base64Data);

      runValidation(rawRows, maxMarks);
      setCurrentPhase(3); // Move to Phase 3: Validate & preview
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Unable to validate Excel file: ${message}`);
    }
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith(".xlsx")) {
      toast.error("Please upload an .xlsx file.");
      return false;
    }
    setFile(selectedFile);
    setFileBase64(null);
    setCurrentPhase(2); // Selecting a file moves active step to 2 (Upload File)
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };



const downloadTemplate = async () => {
  try {
    const response = await axios.post(
      "/api/teachers/getStudentForMarks",
      { filters: activeFilters }
    );

    const students = response.data.students ?? [];

    // Dynamically import only the required library modules
    const [
      { createWorkbook, addWorksheet },
      { workbookToBytes },
      {
        setCell,
        mergeCells,
        appendRow,
        setColumnWidths,
        setFreezePanes,
      },
      {
        registerCellStyle,
        makeFont,
        makeColor,
        makePatternFill,
        makeAlignment,
        makeBorder,
        makeSide,
      },
    ] = await Promise.all([
      import("@office-kit/xlsx/workbook"),
      import("@office-kit/xlsx/io"),
      import("@office-kit/xlsx/worksheet"),
      import("@office-kit/xlsx/styles"),
    ]);

    const workbook = createWorkbook();
    const worksheet = addWorksheet(workbook, "Student List");

    // Shared border styles
    const thinBorder = makeSide({ style: "thin" });

    const headerBorder = makeBorder({
      top: thinBorder,
      bottom: thinBorder,
      left: thinBorder,
      right: thinBorder,
    });

    const bodyBorder = makeBorder({
      bottom: makeSide({ style: "thin", color: makeColor({ rgb: "FFD9E2F3" }) }),
    });

    // Title style
    const titleStyle = registerCellStyle(workbook, {
      font: makeFont({
        name: "Calibri",
        size: 16,
        bold: true,
      }),
      alignment: makeAlignment({
        horizontal: "center",
        vertical: "center",
      }),
    });

    // Subject style
    const subjectStyle = registerCellStyle(workbook, {
      font: makeFont({
        name: "Calibri",
        size: 12,
        bold: true,
      }),
      alignment: makeAlignment({
        horizontal: "center",
        vertical: "center",
      }),
    });

    // Table header style
    const tableHeaderStyle = registerCellStyle(workbook, {
      font: makeFont({
        name: "Calibri",
        size: 11,
        bold: true,
        color: makeColor({ rgb: "FFFFFFFF" }),
      }),
      fill: makePatternFill({
        patternType: "solid",
        fgColor: makeColor({ rgb: "FF1F4E78" }),
      }),
      alignment: makeAlignment({
        horizontal: "center",
        vertical: "center",
        wrapText: true,
      }),
      border: headerBorder,
    });

    // Body styles
    const rollNumberStyle = registerCellStyle(workbook, {
      alignment: makeAlignment({
        horizontal: "center",
        vertical: "center",
      }),
      border: bodyBorder,
    });

    const studentNameStyle = registerCellStyle(workbook, {
      alignment: makeAlignment({
        horizontal: "left",
        vertical: "center",
      }),
      border: bodyBorder,
    });

    const marksStyle = registerCellStyle(workbook, {
      alignment: makeAlignment({
        horizontal: "center",
        vertical: "center",
      }),
      border: bodyBorder,
    });

    // Row 1: Main heading
    setCell(
      worksheet,
      1,
      1,
      `Student List for ${activeFilters.assessment ?? ""}`,
      titleStyle
    );

    mergeCells(worksheet, "A1:E1");

    // Row 2: Subject details
    setCell(
      worksheet,
      2,
      1,
      `Subject: ${activeFilters.courses ?? ""} - ${activeFilters.courseName ?? ""}`,
      subjectStyle
    );

    mergeCells(worksheet, "A2:E2");

    // Row 3: Spacer
    setCell(worksheet, 3, 1, "");

    // Row 4: Column headers
    appendRow(
      worksheet,
      [
        "Roll Number",
        "Student Name",
        "Max Marks",
        "Marks Obtained",
        "Attendance Percentage",
      ],
      {
        styleIds: Array(5).fill(tableHeaderStyle),
      }
    );

    // Rows 5 onward: Student data
    students.forEach((student) => {
      appendRow(
        worksheet,
        [
          String(student.university_roll_no ?? ""),
          student.name ?? "",
          null,
          null,
          null,
        ],
        {
          styleIds: [
            rollNumberStyle,
            studentNameStyle,
            marksStyle,
            marksStyle,
            marksStyle,
          ],
        }
      );
    });

    // Column widths
    setColumnWidths(worksheet, [
      22, // Roll Number
      32, // Student Name
      16, // Max Marks
      20, // Marks Obtained
      26, // Attendance Percentage
    ]);

    // Keep title, subject, spacer and headers visible while scrolling
    setFreezePanes(worksheet, "A5");

    // Generate XLSX bytes
    const bytes = await workbookToBytes(workbook);

    const buffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    );

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const safeFileName = (
      activeFilters.courseName || "student-list"
    ).replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");

    link.href = url;
    link.download = `${safeFileName}-studentList.xlsx`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    // Delay revocation so the browser can begin the download
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error("Failed to download marks template:", error);

    toast.error(
      error.response?.data?.message ||
        "Failed to download marks template. Please try again."
    );
  }
};




  const handleConfirmSubmission = async () => {
    if (errorCount > 0) {
      return toast.warning("Please fix all errors before submitting.");

    }
    try {
      setIsSubmitting(true);


      if (
        !activeFilters.className ||
        !activeFilters.courses ||
        !activeFilters.semester ||
        !activeFilters.assessment ||
        !activeFilters.academicYear
      ) {
        toast.error("Select a class, course, academic year, semester, and assessment before uploading.");
        return;
      }

      const payload = {
        marksData: parsedData,
        filters: {
          className: activeFilters.className,
          courseCode: activeFilters.courses,
          semester: activeFilters.semester,
          assessment: activeFilters.assessment,
          academicYear: activeFilters.academicYear,
        },
        fileMeta: {
          fileName: file ? file.name : "marks_upload.xlsx",
          errorCount: errorCount,
          totalRows: parsedData.length,
          base64Data: fileBase64
        }
      };

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
      setHistoryData((current) => [result.newRecord, ...current]);
      setHistoryError("");
      setSubmissionWarning(result.warning || "");
      setCurrentPhase(4); // Move to Phase 4: Confirm Submission / Success
    }
    catch (err) {
      toast.error("Submission Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Route to History View
  if (activeView === 'history') {
    return (
      <ViewUploadHistory
        onBackToUpload={() => setActiveView('upload')}
        historyData={historyData}
        loading={historyLoading}
        error={historyError}
      />
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
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
              <DashboardFilters />
            </div>
          </div>

          {/* Phases 1 & 2: Upload Section */}
          {(currentPhase === 1 || currentPhase === 2) && (
            <UploadSection
              file={file}
              handleDrop={handleDrop}
              handleFile={handleFile}
              processExcel={processExcel}
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

              {submissionWarning && (
                <p
                  role="status"
                  className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"
                >
                  {submissionWarning}
                </p>
              )}

              <div className="flex gap-3">
                {/* Resets file data and sets phase to 1 (Select assessment) */}
                <button
                  onClick={() => {
                    setFile(null);
                    setParsedData([]);
                    setErrorCount(0);
                    setSubmissionWarning("");
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