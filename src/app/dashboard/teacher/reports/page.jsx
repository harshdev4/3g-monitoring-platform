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
];

const REPORT_TYPES = [
  { value: "master", label: "Master student list" },
  { value: "Gradual", label: "Gradual students" },
  { value: "Growing", label: "Growing students" },
  { value: "Gallant", label: "Gallant students" },
];

const ASSESSMENT_LABELS = Object.fromEntries(
  ASSESSMENTS.map(({ value, label }) => [value, label])
);

const getColumnLetter = (column) => {
  let letter = "";
  let number = column;
  while (number > 0) {
    const remainder = (number - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    number = Math.floor((number - 1) / 26);
  }
  return letter;
};

function createReportLayout() {
  const columns = [
    { key: "serial", label: "S. No.", width: 8 },
    { key: "university_roll_no", label: "Univ. Roll. No.", width: 20 },
    { key: "student_name", label: "Student Name", width: 28 },
  ];
  const fixedHeaders = columns.map((column, index) => ({
    ...column,
    start: index + 1,
  }));
  const groups = [
    {
      label: "Pre-MSE (Based on previous semester performance)",
      start: 4,
      fields: [
        { key: "pre_mse_mark", maxKey: "pre_mse_max_mark", label: "Marks", width: 18, kind: "marks" },
        { key: "pre_mse_observation", label: "Observations", width: 34 },
      ],
    },
    {
      label: "MSE-1",
      start: 6,
      fields: [
        { key: "mse_1_attendance_pct", label: "Attendance (%)", width: 16 },
        { key: "mse_1_mark", maxKey: "mse_1_max_mark", label: "Marks", width: 18, kind: "marks" },
        { key: "mse_1_observation", label: "Observations", width: 34 },
      ],
    },
    {
      label: "MSE-2",
      start: 9,
      fields: [
        { key: "mse_2_attendance_pct", label: "Attendance (%)", width: 16 },
        { key: "mse_2_mark", maxKey: "mse_2_max_mark", label: "Marks", width: 18, kind: "marks" },
        { key: "mse_2_observation", label: "Observations", width: 34 },
      ],
    },
  ];
  columns.push(
    ...groups.flatMap(({ fields }) => fields),
    { key: "category_movement", label: "Category Movement", width: 30 }
  );
  return { columns, fixedHeaders, groups };
}

const getSafeFilePart = (value) =>
  String(value || "")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, "-");

const formatReportValue = (value) => {
  if (value == null || value === "") return "";
  return value;
};

async function downloadReport({ report, actions = [], teacher, title, filters }) {
  const [
    { createWorkbook, addWorksheet },
    { workbookToBytes },
    { appendRow, mergeCells, setCell, setColumnWidths, setFreezePanes, setRowHeight },
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
  const layout = createReportLayout();
  const { columns } = layout;
  const lastColumnLetter = getColumnLetter(columns.length);
  const cellBorder = makeBorder({
    top: makeSide({ style: "thin", color: makeColor({ rgb: "FFB8C7DD" }) }),
    bottom: makeSide({ style: "thin", color: makeColor({ rgb: "FFB8C7DD" }) }),
    left: makeSide({ style: "thin", color: makeColor({ rgb: "FFB8C7DD" }) }),
    right: makeSide({ style: "thin", color: makeColor({ rgb: "FFB8C7DD" }) }),
  });
  const titleStyle = registerCellStyle(workbook, {
    font: makeFont({ name: "Calibri", size: 16, bold: true, color: makeColor({ rgb: "FF17365D" }) }),
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
    border: cellBorder,
  });
  const bodyStyle = registerCellStyle(workbook, {
    font: makeFont({ name: "Calibri", size: 10 }),
    alignment: makeAlignment({ vertical: "center", wrapText: true }),
    border: cellBorder,
  });
  const persistentGradualStyle = registerCellStyle(workbook, {
    font: makeFont({ name: "Calibri", size: 10 }),
    fill: makePatternFill({
      patternType: "solid",
      fgColor: makeColor({ rgb: "FFFFF2CC" }),
    }),
    alignment: makeAlignment({ vertical: "center", wrapText: true }),
    border: cellBorder,
  });
  const actionHeadingStyle = registerCellStyle(workbook, {
    font: makeFont({ name: "Calibri", size: 11, bold: true, color: makeColor({ rgb: "FF17365D" }) }),
    alignment: makeAlignment({ vertical: "center", wrapText: true }),
  });
  const actionTextStyle = registerCellStyle(workbook, {
    font: makeFont({ name: "Calibri", size: 10 }),
    alignment: makeAlignment({ vertical: "center", wrapText: true }),
  });

  setCell(worksheet, 1, 1, `Department of ${teacher.department}`, titleStyle);
  mergeCells(worksheet, `A1:${lastColumnLetter}1`);
  setCell(
    worksheet,
    2,
    1,
    `Academic Session: ${filters.academicYear}   |   ${filters.program}   |   Semester ${filters.semester}   |   Section ${filters.section}`,
    metadataStyle
  );
  mergeCells(worksheet, `A2:${lastColumnLetter}2`);
  const learnerType = REPORT_TYPES.find((type) => type.value === filters.reportType)?.label || "Student";
  setCell(
    worksheet,
    3,
    1,
    `${filters.program.toUpperCase()} ${learnerType.toUpperCase()} MONITORING REPORT - ${ASSESSMENT_LABELS[filters.assessment].toUpperCase()}`,
    titleStyle
  );
  mergeCells(worksheet, `A3:${lastColumnLetter}3`);
  setCell(worksheet, 4, 1, `Faculty: ${teacher.name} (${teacher.empId})`, metadataStyle);
  mergeCells(worksheet, `A4:${lastColumnLetter}4`);
  setCell(worksheet, 5, 1, `Subject Name: ${filters.courseName}`, metadataStyle);
  mergeCells(worksheet, `A5:F5`);
  setCell(worksheet, 5, 7, `Subject Code: ${filters.courseCode}`, metadataStyle);
  mergeCells(worksheet, `G5:${lastColumnLetter}5`);

  for (const column of layout.fixedHeaders) {
    setCell(worksheet, 7, column.start, column.label, headerStyle);
    mergeCells(worksheet, `${getColumnLetter(column.start)}7:${getColumnLetter(column.start)}8`);
  }

  for (const group of layout.groups) {
    setCell(worksheet, 7, group.start, group.label, headerStyle);
    const end = group.start + group.fields.length - 1;
    mergeCells(worksheet, `${getColumnLetter(group.start)}7:${getColumnLetter(end)}7`);
    group.fields.forEach((field, index) => {
      setCell(worksheet, 8, group.start + index, field.label, headerStyle);
    });
  }

  const movementColumn = columns.length;
  setCell(worksheet, 7, movementColumn, "Category Movement", headerStyle);
  mergeCells(
    worksheet,
    `${getColumnLetter(movementColumn)}7:${getColumnLetter(movementColumn)}8`
  );

  report.forEach((student, index) => {
    const stagesToInclude = filters.assessment === "mse-2"
      ? new Set(["pre_mse", "mse_1", "mse_2"])
      : filters.assessment === "mse-1"
        ? new Set(["pre_mse", "mse_1"])
        : new Set(["pre_mse"]);
    const styleId = student.persistent_gradual
      ? persistentGradualStyle
      : bodyStyle;
    appendRow(
      worksheet,
      columns.map((column) => {
        if (column.key === "serial") return index + 1;
        if (column.key === "category_movement") return student.category_movement;
        const stage = column.key.startsWith("pre_mse_")
          ? "pre_mse"
          : column.key.startsWith("mse_1_")
            ? "mse_1"
            : column.key.startsWith("mse_2_")
              ? "mse_2"
              : null;
        if (stage && !stagesToInclude.has(stage)) return "";
        if (column.kind === "marks") {
          const mark = formatReportValue(student[column.key]);
          const maximum = formatReportValue(student[column.maxKey]);
          return mark === "" ? "" : maximum === "" ? mark : `${mark} / ${maximum}`;
        }
        return formatReportValue(student[column.key]);
      }),
      { styleIds: columns.map(() => styleId) }
    );
    setRowHeight(worksheet, 9 + index, 32);
  });

  const actionsStart = 9 + report.length + 1;
  setCell(
    worksheet,
    actionsStart,
    1,
    `Actions Taken ${ASSESSMENT_LABELS[filters.assessment]}:`,
    actionHeadingStyle
  );
  mergeCells(worksheet, `A${actionsStart}:${lastColumnLetter}${actionsStart}`);
  const actionItems = actions.length
    ? actions.map((action) => `☒ ${action}`)
    : ["No teacher actions have been submitted for this assessment and report filter."];
  actionItems.forEach((action, index) => {
    const row = actionsStart + index + 1;
    setCell(worksheet, row, 1, action, actionTextStyle);
    mergeCells(worksheet, `A${row}:${lastColumnLetter}${row}`);
    setRowHeight(worksheet, row, 30);
  });
  const observationRow = actionsStart + actionItems.length + 1;
  setCell(worksheet, observationRow, 1, "Observation:", actionHeadingStyle);
  mergeCells(worksheet, `A${observationRow}:${lastColumnLetter}${observationRow}`);
  setRowHeight(worksheet, observationRow, 40);
  setCell(worksheet, observationRow + 2, 1, "Signature of Faculty Member", metadataStyle);
  mergeCells(worksheet, `A${observationRow + 2}:D${observationRow + 2}`);

  setColumnWidths(
    worksheet,
    columns.map(({ width }) => width)
  );
  setFreezePanes(worksheet, "A9");

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
        actions: result.actions,
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
          reportType,
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
              Generate the learner monitoring format for the selected assessment.
              Earlier assessment fields are included only when they apply to the
              selected stage.
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
                The workbook records the verified teacher identity.
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
                  Pre-MSE includes previous-performance marks and observations.
                  MSE-1 also includes available Pre-MSE results, and MSE-2
                  includes available results from all three stages. Category
                  Movement compares the selected category with the previous stage.
                  Students who remain Gradual are highlighted, and teacher actions
                  for the selected assessment appear below the student list.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
