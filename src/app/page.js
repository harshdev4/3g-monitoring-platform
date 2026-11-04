import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionFromToken, SESSION_COOKIE } from "@/lib/auth";

export default async function HomePage() {
  const cookieStore = await cookies();
  const session = getSessionFromToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (session?.role === "student") redirect("/dashboard/student");
  if (session?.role === "dean") redirect("/dashboard/dean");
  if (session) redirect("/dashboard/teacher");
  redirect("/login");
}