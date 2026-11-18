import { redirect } from "next/navigation";
import { getUser } from "@/core/auth/server";

export default async function Root() {
  redirect((await getUser()) ? "/home" : "/login");
}
