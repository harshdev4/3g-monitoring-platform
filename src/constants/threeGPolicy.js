/**
 * 3G policy (Department of Computer Applications), section 2.2.
 * This is policy text, not student data.
 *
 * owner    "Teacher" – faculty does it and submits the evidence themselves
 *          "Student" – the student does it, faculty reviews the evidence
 * evidence / steps are editable defaults offered in the assign form.
 * Adjust owners if the department reads the policy differently.
 */
export const CATEGORIES = ["Gradual", "Growing", "Gallant"];

export const ASSESSMENTS = [
  { label: "Pre-MSE", value: "pre-mse" },
  { label: "MSE-1", value: "mse-1" },
  { label: "MSE-2", value: "mse-2" },
  { label: "ESE", value: "ese" },
];

export const POLICY_ACTIONS = {
  Gradual: [
    {
      title: "Remedial classes (detained students)",
      owner: "Teacher",
      evidence: "Attendance / completion proof",
      steps: 4,
    },
    {
      title: "Peer learning with a Gallant mentor",
      owner: "Student",
      evidence: "Faculty confirmation",
      steps: 3,
    },
    {
      title: "MSE-I / MSE-II question paper practice",
      owner: "Student",
      evidence: "Answer sheet",
      steps: 4,
    },
    {
      title: "Fortnightly one-on-one with subject faculty",
      owner: "Teacher",
      evidence: "Meeting notes",
      steps: 4,
    },
  ],
  Growing: [
    {
      title: "Growth sprint (coding / MOOC with leaderboard)",
      owner: "Student",
      evidence: "Leaderboard screenshot or certificate",
      steps: 3,
    },
    {
      title: "Talent development & participation",
      owner: "Student",
      evidence: "Participation proof",
      steps: 3,
    },
    {
      title: "Supplementary textbooks beyond syllabus",
      owner: "Teacher",
      evidence: "Faculty confirmation",
      steps: 3,
    },
  ],
  Gallant: [
    {
      title: "Academic enrichment (advanced question banks)",
      owner: "Teacher",
      evidence: "Solved question set",
      steps: 3,
    },
    {
      title: "Research & innovation activity",
      owner: "Student",
      evidence: "Project document",
      steps: 3,
    },
    {
      title: "Mentoring & leadership activity",
      owner: "Teacher",
      evidence: "Mentoring log",
      steps: 3,
    },
    {
      title: "Skill development & competitive readiness",
      owner: "Student",
      evidence: "Certificate or completion proof",
      steps: 3,
    },
    {
      title: "Higher education planning (GATE / NET / Ph.D.)",
      owner: "Teacher",
      evidence: "Mock test report",
      steps: 3,
    },
  ],
};