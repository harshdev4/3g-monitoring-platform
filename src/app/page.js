import { redirect } from "next/navigation";
import getUser from "./api/users/getUser";

export default async function Home() {
  redirect("/dashboard/teacher");
}