import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
export default async function Member() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await sb.from("profiles").select("role").eq("id", user.id).single();
  redirect(me?.role === "admin" ? "/admin" : "/");
}
