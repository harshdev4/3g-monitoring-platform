import { create } from "zustand";

/**
 * Two different things live here, mirroring the database:
 *
 *  - activities   → the template a teacher creates once (public.activities)
 *  - assignments  → one row per student who got that activity, with progress,
 *                   evidence and feedback (public.student_activities, joined
 *                   to the activity, the enrollment and the student)
 *
 * `performedBy` says who does the work:
 *   "Student" → the student submits evidence, the teacher reviews it
 *   "Teacher" → the teacher responds and submits the evidence
 * It needs a column on public.activities:
 *
 *   ALTER TABLE public.activities
 *     ADD COLUMN performed_by VARCHAR(10) NOT NULL DEFAULT 'Student'
 *     CHECK (performed_by IN ('Student', 'Teacher'));
 *
 * Expected activity row:
 *   activity_id, title, description, course_code, course_name, section,
 *   semester, academic_year, assessment_type, target_category, due_date,
 *   evidence_required, total_steps, performed_by, created_by_emp_id,
 *   created_at, updated_at
 *
 * Expected assignment row: every activity column above, plus
 *   assignment_id, enrollment_id, status, completed_steps,
 *   submitted_evidence_url, faculty_feedback, assigned_at, updated_at,
 *   student_name, roll_no
 */

// ASSUMPTION: change these to your real API routes.
const ACTIVITIES_URL = "/api/teacher/activities";
const ASSIGNMENTS_URL = "/api/teacher/assignments";

const ASSESSMENT_LABELS = {
  "pre-mse": "Pre-MSE",
  "mse-1": "MSE-1",
  "mse-2": "MSE-2",
  ese: "ESE",
};

export const toActivity = (row) => ({
  activityId: row.activity_id,
  title: row.title,
  description: row.description ?? "",
  courseCode: row.course_code,
  courseName: row.course_name ?? row.course_code,
  section: row.section,
  semester: row.semester,
  academicYear: row.academic_year,
  assessment: ASSESSMENT_LABELS[row.assessment_type] ?? row.assessment_type,
  category: row.target_category ?? "",
  dueDate: row.due_date,
  evidenceRequired: row.evidence_required ?? "",
  totalSteps: row.total_steps,
  performedBy: row.performed_by ?? "Student",
  createdBy: row.created_by_emp_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const toAssignment = (row) => ({
  ...toActivity(row),
  assignmentId: row.assignment_id,
  enrollmentId: row.enrollment_id,
  studentName: row.student_name ?? "",
  roll: row.roll_no ?? "",
  status: row.status,
  completedSteps: row.completed_steps ?? 0,
  submittedEvidenceUrl: row.submitted_evidence_url ?? "",
  facultyFeedback: row.faculty_feedback ?? "",
  assignedAt: row.assigned_at,
  updatedAt: row.updated_at,
});

// Accepts either a bare array or { data: [...] }.
const rowsOf = (json) => (Array.isArray(json) ? json : (json?.data ?? []));

const useActivitiesStore = create((set, get) => ({
  activities: [],
  assignments: [],

  loading: false,
  error: null,

  setActivities: (rows) => set({ activities: rows.map(toActivity) }),
  setAssignments: (rows) => set({ assignments: rows.map(toAssignment) }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchActivities: async (empId) => {
    set({ loading: true, error: null });
    try {
      const query = `?empId=${encodeURIComponent(empId)}`;
      const [activitiesRes, assignmentsRes] = await Promise.all([
        fetch(ACTIVITIES_URL + query),
        fetch(ASSIGNMENTS_URL + query),
      ]);
      if (!activitiesRes.ok || !assignmentsRes.ok) {
        throw new Error(
          `Server returned ${activitiesRes.ok ? assignmentsRes.status : activitiesRes.status}`,
        );
      }
      set({
        activities: rowsOf(await activitiesRes.json()).map(toActivity),
        assignments: rowsOf(await assignmentsRes.json()).map(toAssignment),
      });
    } catch (err) {
      set({ error: err.message || "Request failed" });
    } finally {
      set({ loading: false });
    }
  },

  // The backend creates the activity and one student_activities row per
  // matching student, then we reload so the tables show the real rows.
  createActivity: async (empId, payload) => {
    const res = await fetch(ACTIVITIES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, createdByEmpId: empId }),
    });
    if (!res.ok) throw new Error(`Could not assign activity (${res.status})`);
    await get().fetchActivities(empId);
  },

  clearActivities: () =>
    set({ activities: [], assignments: [], error: null }),
}));

export default useActivitiesStore;