
import { NextResponse } from "next/server";
import pool from "@/config/db.config";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const assessment = searchParams.get("assessment");
    const category = searchParams.get("category");

    if (!assessment || !category) {
      return NextResponse.json(
        { error: "Assessment and category are required." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT
         action_id,
         title,
         description,
         target_category,
         assessment_type,
         submitter_type,
         display_order
       FROM action_templates
       WHERE is_active = TRUE
         AND assessment_type = $1
         AND target_category = $2
       ORDER BY display_order ASC, action_id ASC`,
      [assessment, category]
    );

    return NextResponse.json({ actions: result.rows });
  } catch (error) {
    console.error("Failed to fetch actions:", error);

    return NextResponse.json(
      { error: "Failed to fetch actions." },
      { status: 500 }
    );
  }
}
