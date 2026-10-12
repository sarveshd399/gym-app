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
  revalidatePath("/workout");
}
export async function logout() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/");
}

export async function toggleLike(fd: FormData) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const photo_id = String(fd.get("id"));
  const { data: ex } = await sb.from("gallery_likes").select("photo_id").eq("photo_id", photo_id).eq("user_id", user.id).maybeSingle();
  if (ex) await sb.from("gallery_likes").delete().eq("photo_id", photo_id).eq("user_id", user.id);
  else await sb.from("gallery_likes").insert({ photo_id, user_id: user.id });
  revalidatePath("/gallery");
}
export async function deletePhoto(fd: FormData) {
  const sb = await supabaseServer();
  await sb.from("gallery_photos").delete().eq("id", String(fd.get("id")));
  await sb.storage.from("gallery").remove([String(fd.get("path"))]);
  revalidatePath("/gallery"); revalidatePath("/");
}
