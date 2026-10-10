import { NextResponse } from "next/server";
import getDashboardStudents from "../getDashboardStudents";


export async function POST(request) {
    try {
        const body = await request.json();

        const {
            filters,
            category = "all",
            page = 1,
            pageSize = 10,
        } = body;

        if (!filters || typeof filters !== "object") {
            return NextResponse.json(
                { error: "Invalid filters." },
                { status: 400 }
            );
        }

        const result = await getDashboardStudents(
            filters,
            page,
            pageSize,
            category
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error("Students API error:", error);

        return NextResponse.json(
            { error: "Unable to fetch students." },
            { status: 500 }
        );
    }
}