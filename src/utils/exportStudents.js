import * as XLSX from "xlsx";

const exportStudents = (students, assessmentType, subjectName) => {
  if (!Array.isArray(students) || students.length === 0) {
    alert("No student records available to export.");
    return;
  }

  const formattedStudents = students.map((student) => ({
    "University Roll No": student.university_roll_no ?? "",
    "Student Name": student.name ?? "",
    Semester: student.semester ?? "",
    Section: student.section ?? "",
    "Attendance (%)": student.attendance_pct ?? "",
    "Obtained Marks": student.obtained_mark ?? "",
    "Maximum Marks": student.max_mark ?? "",
    "3G Category": student.three_g_category ?? "",
  }));

  const headers = Object.keys(formattedStudents[0]);

  const worksheetData = [
    [`Student List for ${assessmentType || "Assessment"}`],
    [`Subject: ${subjectName || "Not specified"}`],
    [],
    headers,
    ...formattedStudents.map((student) =>
      headers.map((header) => student[header])
    ),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  const lastColumn = headers.length - 1;

  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastColumn } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastColumn } },
  ];

  worksheet["!cols"] = [
    { wch: 22 },
    { wch: 25 },
    { wch: 12 },
    { wch: 12 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Student List");

  XLSX.writeFile(workbook, "student-list.xlsx");
};

export default exportStudents;