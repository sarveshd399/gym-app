"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function submitWorkout(fd: FormData) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  await sb.from("workout_requests").insert({
    member_id: user.id, exercise_id: String(fd.get("exercise")),
    sets: Number(fd.get("sets")), reps: Number(fd.get("reps")), performed_on: String(fd.get("date")),
  });
  revalidatePath("/member");
}
export async function logout() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/");
}
