import { NextResponse } from "next/server";
import getAssignedCourses from "../getAssignedCourses";

export const GET = async (request) => {
    const empId = request.nextUrl.searchParams.get("empId");
    if (!empId) {
        return NextResponse.json(
            { message: "Employee ID is required" },
            { status: 400 }
        );
    }

    try {
        const assignedCourses = await getAssignedCourses(empId);
        return NextResponse.json({
            message: "Employee ID received",
            assignedCourses,
        });
    } catch (error) {
        console.error("Failed to fetch assigned courses:", error);

        return NextResponse.json(
            { message: "Failed to fetch employee" },
            { status: 500 }
        );
    }
}
