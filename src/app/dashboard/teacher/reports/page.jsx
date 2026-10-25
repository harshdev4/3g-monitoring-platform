"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Download,
  FileSpreadsheet,
  LoaderCircle,
} from "lucide-react";

import Header from "@/components/dashboard/Header";
import useTeacherStore from "@/store/useTeacherStore";

const ASSESSMENTS = [
  { value: "pre-mse", label: "Pre-MSE" },
  { value: "mse-1", label: "MSE-1" },
  { value: "mse-2", label: "MSE-2" },
  { value: "ese", label: "ESE" },
];

const REPORT_TYPES = [
  { value: "master", label: "Master student list" },
  { value: "Gradual", label: "Gradual students" },
  { value: "Growing", label: "Growing students" },
  { value: "Gallant", label: "Gallant students" },
];

const REPORT_COLUMNS = [
  { key: "student_name", label: "Student Name", width: 28 },
  { key: "student_rank", label: "Rank", width: 12 },
  { key: "university_roll_no", label: "University Roll Number", width: 24 },
  { key: "program_name", label: "Program", width: 16 },
  { key: "semester", label: "Semester", width: 12 },
  { key: "section", label: "Section", width: 12 },
  { key: "academic_year", label: "Academic Year", width: 16 },
  { key: "course_code", label: "Course Code", width: 18 },
  { key: "course_name", label: "Course Name", width: 30 },
  { key: "assessment_type", label: "Assessment", width: 16 },
  { key: "obtained_mark", label: "Obtained Marks", width: 18 },
  { key: "max_mark", label: "Maximum Marks", width: 18 },
  { key: "obtained_percentage", label: "Obtained Percentage", width: 22 },
  { key: "attendance_pct", label: "Attendance (%)", width: 18 },
  { key: "sgpa", label: "Previous SGPA", width: 16 },
  { key: "three_g_category", label: "3G Category", width: 18 },
  { key: "backlog", label: "Backlog", width: 12 },
  { key: "faculty_observation", label: "Faculty Observation", width: 40 },
  { key: "actions_taken", label: "Actions Taken / Teacher Evidence URL", width: 55 },
  { key: "assessment_uploaded_at", label: "Assessment Uploaded", width: 24 },
];

const ASSESSMENT_LABELS = Object.fromEntries(
  ASSESSMENTS.map(({ value, label }) => [value, label])
);
const NUMERIC_COLUMNS = new Set([
  "semester",
  "obtained_mark",
  "max_mark",
  "obtained_percentage",
  "attendance_pct",
  "sgpa",
  "student_rank",
]);

const getSafeFilePart = (value) =>
  String(value || "")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, "-");

const formatReportValue = (value, key) => {
  if (value == null || value === "") return "";
  if (key === "backlog") return value ? "Yes" : "No";
  if (key === "assessment_uploaded_at") {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  }
  if (NUMERIC_COLUMNS.has(key)) {
    const number = Number(value);
    return Number.isFinite(number) ? number : "";
  }
  return value;
};

async function downloadReport({ report, teacher, title, filters }) {
  const [
    { createWorkbook, addWorksheet },
    { workbookToBytes },
    { appendRow, mergeCells, setCell, setColumnWidths, setFreezePanes },
    {
      makeAlignment,
      makeBorder,
      makeColor,
      makeFont,
      makePatternFill,
      makeSide,
      registerCellStyle,
    },
  ] = await Promise.all([
    import("@office-kit/xlsx/workbook"),
    import("@office-kit/xlsx/io"),
    import("@office-kit/xlsx/worksheet"),
    import("@office-kit/xlsx/styles"),
  ]);

  const workbook = createWorkbook();
  const worksheet = addWorksheet(workbook, "Student Report");
  const lastColumn = REPORT_COLUMNS.length;
  const lastColumnLetter = String.fromCharCode(64 + lastColumn);
  const headerBorder = makeBorder({
    top: makeSide({ style: "thin", color: makeColor({ rgb: "FFB8C7DD" }) }),
    bottom: makeSide({ style: "thin", color: makeColor({ rgb: "FFB8C7DD" }) }),
    left: makeSide({ style: "thin", color: makeColor({ rgb: "FFB8C7DD" }) }),
    right: makeSide({ style: "thin", color: makeColor({ rgb: "FFB8C7DD" }) }),
  });
  const bodyBorder = makeBorder({
    bottom: makeSide({ style: "thin", color: makeColor({ rgb: "FFE2E8F0" }) }),
  });
  const titleStyle = registerCellStyle(workbook, {
    font: makeFont({ name: "Calibri", size: 18, bold: true, color: makeColor({ rgb: "FF17365D" }) }),
    alignment: makeAlignment({ horizontal: "center", vertical: "center" }),
  });
  const metadataStyle = registerCellStyle(workbook, {
    font: makeFont({ name: "Calibri", size: 11, color: makeColor({ rgb: "FF334155" }) }),
    alignment: makeAlignment({ horizontal: "left", vertical: "center" }),
  });
  const headerStyle = registerCellStyle(workbook, {
    font: makeFont({ name: "Calibri", size: 11, bold: true, color: makeColor({ rgb: "FFFFFFFF" }) }),
    fill: makePatternFill({
      patternType: "solid",
      fgColor: makeColor({ rgb: "FF1F4E78" }),
    }),
    alignment: makeAlignment({ horizontal: "center", vertical: "center", wrapText: true }),
    border: headerBorder,
  });
  const bodyStyle = registerCellStyle(workbook, {
    font: makeFont({ name: "Calibri", size: 10 }),
    alignment: makeAlignment({ vertical: "center", wrapText: true }),
    border: bodyBorder,
  });

  setCell(worksheet, 1, 1, title, titleStyle);
  mergeCells(worksheet, `A1:${lastColumnLetter}1`);
  setCell(
    worksheet,
    2,
    1,
    `Program: ${filters.program}   |   Class: ${filters.section}   |   Semester: ${filters.semester}   |   Academic Year: ${filters.academicYear}`,
    metadataStyle
  );
  mergeCells(worksheet, `A2:${lastColumnLetter}2`);
  setCell(
    worksheet,
    3,
    1,
    `Course: ${filters.courseName} (${filters.courseCode})   |   Assessment: ${ASSESSMENT_LABELS[filters.assessment]}`,
    metadataStyle
  );
  mergeCells(worksheet, `A3:${lastColumnLetter}3`);
  setCell(
    worksheet,
    4,
    1,
    `Generated by: ${teacher.name} (${teacher.empId})   |   Generated: ${new Date().toLocaleString("en-GB")}`,
    metadataStyle
  );
  mergeCells(worksheet, `A4:${lastColumnLetter}4`);
  setCell(worksheet, 5, 1, "", metadataStyle);
  appendRow(worksheet, REPORT_COLUMNS.map(({ label }) => label), {
    styleIds: REPORT_COLUMNS.map(() => headerStyle),
  });

  report.forEach((student) => {
    appendRow(
      worksheet,
      REPORT_COLUMNS.map(({ key }) => formatReportValue(student[key], key)),
      { styleIds: REPORT_COLUMNS.map(() => bodyStyle) }
    );
  });

  setColumnWidths(
    worksheet,
    REPORT_COLUMNS.map(({ width }) => width)
  );
  setFreezePanes(worksheet, "A7");

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
  link.href = url;
  link.download = [
    getSafeFilePart(title),
    getSafeFilePart(filters.section),
    getSafeFilePart(filters.courseCode),
    getSafeFilePart(filters.academicYear),
  ].filter(Boolean).join("-") + ".xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function TeacherReportsPage() {
  const assignedCourses = useTeacherStore((state) => state.assignedCourses);
  const teacherName = useTeacherStore((state) => state.name);
  const teacherEmpId = useTeacherStore((state) => state.empId);

  const [program, setProgram] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [assessment, setAssessment] = useState("");
  const [reportType, setReportType] = useState("master");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const programs = useMemo(
    () => [...new Set(assignedCourses.map((course) => course.program).filter(Boolean))],
    [assignedCourses]
  );
  const semesters = useMemo(
    () => [...new Set(assignedCourses
      .filter((course) => !program || course.program === program)
      .map((course) => String(course.semester)))].sort((a, b) => Number(a) - Number(b)),
    [assignedCourses, program]
  );
  const sections = useMemo(
    () => [...new Set(assignedCourses
      .filter((course) =>
        (!program || course.program === program) &&
        (!semester || String(course.semester) === semester)
      )
      .map((course) => course.className))].sort(),
    [assignedCourses, program, semester]
  );
  const courses = useMemo(() => {
    const matchingCourses = assignedCourses.filter((course) =>
      (!program || course.program === program) &&
      (!semester || String(course.semester) === semester) &&
      (!section || course.className === section)
    );
    return [...new Map(
      matchingCourses.map((course) => [course.course_code, course])
    ).values()];
  },
    [assignedCourses, program, semester, section]
  );
  const selectedCourse = courses.find((course) => course.course_code === courseCode);
  const academicYears = useMemo(
    () => [...new Set(assignedCourses
      .filter((course) =>
        (!program || course.program === program) &&
        (!semester || String(course.semester) === semester) &&
        (!section || course.className === section) &&
        (!courseCode || course.course_code === courseCode)
      )
      .map((course) => String(course.academicYear ?? ""))
      .filter(Boolean))].sort(),
    [assignedCourses, program, semester, section, courseCode]
  );

  const generateReport = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const params = new URLSearchParams({
        program,
        semester,
        section: section.replace(/^MCA-/, ""),
        course_code: courseCode,
        academic_year: academicYear,
        assessment,
        report_type: reportType,
      });
      const response = await fetch(`/api/teachers/reports?${params.toString()}`, {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to generate the report.");
      }
      if (!Array.isArray(result.rows) || result.rows.length === 0) {
        throw new Error("No students were found for this report and filter combination.");
      }

      const title = `${REPORT_TYPES.find((type) => type.value === reportType)?.label} - ${ASSESSMENT_LABELS[assessment]}`;
      await downloadReport({
        report: result.rows,
        teacher: result.teacher ?? { name: teacherName, empId: teacherEmpId },
        title,
        filters: {
          program,
          semester,
          section,
          courseCode,
          courseName: selectedCourse?.course ?? courseCode,
          academicYear,
          assessment,
        },
      });
      setSuccess(`${result.rows.length} student record(s) included in the downloaded report.`);
    } catch (reportError) {
      console.error("Teacher report generation failed:", reportError);
      setError(reportError.message || "Unable to generate the report.");
    } finally {
      setLoading(false);
    }
  };

  const selectClass = "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  const labelClass = "mb-1.5 block text-xs font-semibold text-slate-600";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-6xl space-y-5">
          <header>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Teacher workspace
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Student Reports
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Generate formatted Excel reports for Gradual, Growing, or Gallant
              students, or download the complete master list for a selected
              assessment and course.
            </p>
          </header>

          <form
            onSubmit={generateReport}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6"
          >
            <h2 className="mb-4 text-base font-semibold text-slate-900">
              Report filters
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={labelClass} htmlFor="report-program">Program</label>
                <select id="report-program" className={selectClass} value={program}
                  onChange={(event) => {
                    setProgram(event.target.value);
                    setSemester("");
                    setSection("");
                    setCourseCode("");
                    setAcademicYear("");
                    setAssessment("");
                  }} required>
                  <option value="">Select program</option>
                  {programs.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="report-semester">Semester</label>
                <select id="report-semester" className={selectClass} value={semester}
                  onChange={(event) => {
                    setSemester(event.target.value);
                    setSection("");
                    setCourseCode("");
                    setAcademicYear("");
                    setAssessment("");
                  }} required disabled={!program}>
                  <option value="">Select semester</option>
                  {semesters.map((value) => <option key={value} value={value}>Semester {value}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="report-class">Class / Section</label>
                <select id="report-class" className={selectClass} value={section}
                  onChange={(event) => {
                    setSection(event.target.value);
                    setCourseCode("");
                    setAcademicYear("");
                    setAssessment("");
                  }} required disabled={!semester}>
                  <option value="">Select class</option>
                  {sections.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="report-course">Course</label>
                <select id="report-course" className={selectClass} value={courseCode}
                  onChange={(event) => {
                    setCourseCode(event.target.value);
                    setAcademicYear("");
                    setAssessment("");
                  }} required disabled={!section}>
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={`${course.course_code}-${course.academicYear}`} value={course.course_code}>
                      {course.course} ({course.course_code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="report-year">Academic Year</label>
                <select id="report-year" className={selectClass} value={academicYear}
                  onChange={(event) => {
                    setAcademicYear(event.target.value);
                    setAssessment("");
                  }} required disabled={!courseCode}>
                  <option value="">Select academic year</option>
                  {academicYears.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="report-assessment">Assessment</label>
                <select id="report-assessment" className={selectClass} value={assessment}
                  onChange={(event) => setAssessment(event.target.value)} required disabled={!academicYear}>
                  <option value="">Select assessment</option>
                  {ASSESSMENTS
                    .filter((item) => !(item.value === "pre-mse" && semester === "1"))
                    .map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className={labelClass} htmlFor="report-type">Report type</label>
                <select id="report-type" className={selectClass} value={reportType}
                  onChange={(event) => setReportType(event.target.value)} required>
                  {REPORT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>
            </div>

            {error && (
              <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <p role="status" className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                {success}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Generated by {teacherName || "signed-in teacher"}{teacherEmpId ? ` (${teacherEmpId})` : ""}.
                The workbook also records the verified teacher identity and generation time.
              </p>
              <button
                type="submit"
                disabled={loading || !academicYear || !assessment || !courseCode}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <LoaderCircle size={17} className="animate-spin" /> : <Download size={17} />}
                {loading ? "Generating..." : "Generate & download Excel"}
              </button>
            </div>
          </form>

          <section className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex items-start gap-3">
              <FileSpreadsheet size={20} className="mt-0.5 shrink-0 text-blue-700" />
              <div>
                <h2 className="text-sm font-semibold text-blue-900">Report contents</h2>
                <p className="mt-1 text-xs leading-5 text-blue-800">
                  Each workbook includes student identity, program, class, course,
                  academic year, assessment, marks, percentage, attendance, class
                  rank, 3G category, faculty observation, and upload timestamp.
                  Category assignment follows the dashboard&apos;s dense-rank and
                  percentage rules.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
