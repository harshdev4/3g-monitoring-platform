import { cookies } from "next/headers";
import { getSessionFromToken, SESSION_COOKIE } from "@/lib/auth";
import { getStudentProfileByEmail } from "@/lib/student";
import { BookOpen, Building2, CalendarDays, GraduationCap, IdCard, Mail, Phone, Tag } from "lucide-react";

const details = [
  { label: "Full name", field: "name", icon: IdCard },
  { label: "University roll number", field: "university_roll_no", icon: IdCard },
  { label: "Registered email", field: "mail_id", icon: Mail },
  { label: "Phone number", field: "phone_number", icon: Phone },
  { label: "Department", field: "dept_name", icon: Building2 },
  { label: "Program", field: "program_name", icon: GraduationCap },
  { label: "Semester", field: "semester", icon: BookOpen },
  { label: "Section", field: "section", icon: IdCard },
  { label: "Academic year", field: "academic_year", icon: CalendarDays },
  { label: "Student category", field: "category", icon: Tag },
];

export default async function StudentProfilePage() {
  const cookieStore = await cookies();
  const session = getSessionFromToken(cookieStore.get(SESSION_COOKIE)?.value);
  const student = await getStudentProfileByEmail(session?.email);

  return (
    <div className="mx-auto max-w-4xl font-inter">
      <div className="mb-5">
        <p className="my-1 text-[9px] font-medium text-[#71809A]">Student workspace</p>
        <h1 className="text-[23px] font-semibold leading-tight text-navy lg:text-[27px]">Profile</h1>
        <p className="mt-1 text-[12px] text-[#71809A]">
          Your profile information is managed by your institution and is read-only.
        </p>
      </div>

      <section className="overflow-hidden rounded-lg border border-[#E5EAF1] bg-white">
        <div className="bg-[#142844] px-5 py-5 text-white sm:px-7">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-[14px] font-semibold">
              {student.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-[14px] font-semibold">{student.name}</h2>
              <p className="mt-1 truncate text-[12px] text-blue-100">
                {student.program_name} · {student.university_roll_no}
              </p>
            </div>
          </div>
        </div>

        <dl className="grid gap-px bg-[#EEF1F5] sm:grid-cols-2">
          {details.map(({ label, field, icon: Icon }) => (
            <div key={field} className="min-w-0 bg-white px-5 py-3.5 sm:px-7">
              <dt className="flex items-center gap-2 text-[11px] font-medium text-[#71809A]">
                <Icon size={14} className="text-slate-400" />
                {label}
              </dt>
              <dd className="mt-1.5 break-words text-[12px] font-medium text-[#253B59]">
                {student[field] ?? "Not provided"}
              </dd>
            </div>
          ))}
        </dl>
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-[11px] text-slate-500 sm:px-7">
          Need to update a detail? Please contact your department administrator.
        </div>
      </section>
    </div>
  );
}