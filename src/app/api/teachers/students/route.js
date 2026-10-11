import { NextResponse } from "next/server";
import getDashboardStudents from "../getDashboardStudents";


export async function POST(request) {
    try {
        const body = await request.json();

        const { filters } = body;

        if (!filters || typeof filters !== "object") {
            return NextResponse.json(
                { error: "Invalid filters." },
                { status: 400 }
            );
        }

        const students = await getDashboardStudents(filters);

        return NextResponse.json({ students });
    } catch (error) {
        console.error("Students API error:", error);

        return NextResponse.json(
            { error: "Unable to fetch students." },
            { status: 500 }
        );
    }
}