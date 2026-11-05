const exportStudents = async (students, assessmentType, subjectName) => {
  if (!Array.isArray(students) || students.length === 0) {
    alert("No student records available to export.");
    return;
  }

  try {
    const [
      { createWorkbook, addWorksheet },
      { workbookToBytes },
      { appendRow, mergeCells, setCell, setColumnWidths },
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
    const worksheet = addWorksheet(workbook, "Student List");
    const headers = [
      "University Roll No",
      "Student Name",
      "Semester",
      "Section",
      "Attendance (%)",
      "Obtained Marks",
      "Maximum Marks",
      "3G Category",
      "Observation",
    ];

    const border = makeBorder({
      bottom: makeSide({ style: "thin", color: makeColor({ rgb: "FFD9E2F3" }) }),
    });
    const titleStyle = registerCellStyle(workbook, {
      font: makeFont({ name: "Calibri", size: 16, bold: true }),
      alignment: makeAlignment({ horizontal: "center", vertical: "center" }),
    });
    const subtitleStyle = registerCellStyle(workbook, {
      font: makeFont({ name: "Calibri", size: 12, bold: true }),
      alignment: makeAlignment({ horizontal: "center", vertical: "center" }),
    });
    const headerStyle = registerCellStyle(workbook, {
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
      border,
    });
    const bodyStyle = registerCellStyle(workbook, {
      alignment: makeAlignment({ vertical: "center" }),
      border,
    });

    setCell(worksheet, 1, 1, `Student List for ${assessmentType || "Assessment"}`, titleStyle);
    mergeCells(worksheet, "A1:I1");
    setCell(worksheet, 2, 1, `Subject: ${subjectName || "Not specified"}`, subtitleStyle);
    mergeCells(worksheet, "A2:I2");
    setCell(worksheet, 3, 1, "");
    appendRow(worksheet, headers, { styleIds: headers.map(() => headerStyle) });

    students.forEach((student) => {
      appendRow(
        worksheet,
        [
          String(student.university_roll_no ?? ""),
          student.name ?? "",
          student.semester ?? "",
          student.section ?? "",
          student.attendance_pct ?? "",
          student.obtained_mark ?? "",
          student.max_mark ?? "",
          student.three_g_category ?? "",
          student.observation ?? "",
        ],
        { styleIds: headers.map(() => bodyStyle) }
      );
    });

    setColumnWidths(worksheet, [22, 25, 12, 12, 16, 16, 16, 18, 40]);

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
    link.download = "student-list.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error("Failed to export students:", error);
    alert("Failed to export student records. Please try again.");
  }
};

export default exportStudents;
