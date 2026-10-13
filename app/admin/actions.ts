"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

async function guard() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin") redirect("/member");
  return { sb, user };
}
const today = () => new Date().toISOString().slice(0, 10);
// Always ends the action: refreshes the page, and shows any database error at the top of /admin.
function done(error?: { message: string } | null): never {
  revalidatePath("/admin");
  redirect(error ? "/admin?error=" + encodeURIComponent(error.message) : "/admin");
}

export async function addExercise(fd: FormData) {
  const { sb, user } = await guard();
  const name = String(fd.get("name") ?? "").trim();
  if (!name) done();
  const { error } = await sb.from("exercises").insert({ name, created_by: user.id });
  done(error);
}
export async function addMember(fd: FormData) {
  await guard();
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data, error } = await admin.auth.admin.createUser({
    email: String(fd.get("email")), password: String(fd.get("password")), email_confirm: true,
    user_metadata: { full_name: String(fd.get("name")), phone: String(fd.get("phone")) },
  });
  if (error || !data.user) done(error ?? { message: "Could not create member" });
  const q = String(fd.get("plan")) === "quarterly";
  const end = new Date(); end.setMonth(end.getMonth() + (q ? 3 : 1));
  const ins = await admin.from("memberships").insert({ user_id: data!.user!.id, plan_name: q ? "3 Months" : "Monthly", start_date: today(), end_date: end.toISOString().slice(0, 10) });
  done(ins.error);
}
export async function removeMember(fd: FormData) {
  const { sb } = await guard(); const id = String(fd.get("id"));
  const a = await sb.from("profiles").update({ active: false }).eq("id", id);
  if (a.error) done(a.error);
  const b = await sb.from("memberships").update({ status: "cancelled" }).eq("user_id", id);
  done(b.error);
}
export async function setFee(fd: FormData) {
  const { sb } = await guard(); const paid = fd.get("paid") === "1";
  const { error } = await sb.from("fee_payments").upsert({
    user_id: String(fd.get("id")), period: new Date().toISOString().slice(0, 7) + "-01",
    amount: Number(fd.get("amount")) || 0, status: paid ? "paid" : "unpaid", paid_on: paid ? today() : null,
  }, { onConflict: "user_id,period" });
  done(error);
}
export async function review(fd: FormData) {
  const { sb, user } = await guard();
  const decision = String(fd.get("decision"));
  if (decision !== "approved" && decision !== "rejected") done({ message: "Invalid decision" });
  const { error } = await sb.from("workout_requests").update({
    status: decision, reviewed_by: user.id, reviewed_at: new Date().toISOString(),
  }).eq("id", String(fd.get("id")));
  done(error);
}
