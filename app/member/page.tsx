import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { logout, submitWorkout } from "../actions";

const tone: Record<string, string> = { pending: "bg-yellow-500/20 text-yellow-300", approved: "bg-green-500/20 text-green-300", rejected: "bg-red-500/20 text-red-300", paid: "bg-green-500/20 text-green-300", unpaid: "bg-red-500/20 text-red-300" };

export default async function Member() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await sb.from("profiles").select("*").eq("id", user.id).single();
  if (me?.role === "admin") redirect("/admin");
  if (me && !me.active) return <main className="p-10 text-center">Your account is deactivated. Please contact the gym.</main>;
  const period = new Date().toISOString().slice(0, 7) + "-01";
  const [{ data: ms }, { data: fee }, { data: ex }, { data: reqs }] = await Promise.all([
    sb.from("memberships").select("*").eq("user_id", user.id).order("end_date", { ascending: false }).limit(1),
    sb.from("fee_payments").select("*").eq("user_id", user.id).eq("period", period).maybeSingle(),
    sb.from("exercises").select("id,name").order("name"),
    sb.from("workout_requests").select("*, exercises(name)").eq("member_id", user.id).order("created_at", { ascending: false }).limit(20),
  ]);
  const m = ms?.[0]; const feeStatus = fee?.status ?? "unpaid";
  const daysLeft = m ? Math.ceil((new Date(m.end_date).getTime() - Date.now()) / 86400000) : null;
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-5">
      <header className="flex items-center justify-between"><h1 className="text-2xl font-bold">Hi, {me?.full_name}</h1>
        <form action={logout}><button className="btn-ghost">Logout</button></form></header>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card"><p className="text-sm text-zinc-400">Membership</p>
          {m ? <><p className="text-xl font-bold">{m.plan_name}</p><p className="text-sm text-zinc-400">Expires {m.end_date} · {daysLeft && daysLeft > 0 ? `${daysLeft} days left` : "expired"}</p></> : <p>No active membership</p>}</div>
        <div className="card"><p className="text-sm text-zinc-400">This month's fee</p>
          <span className={`badge mt-2 inline-block ${tone[feeStatus]}`}>{feeStatus.toUpperCase()}</span></div>
      </div>
      <form action={submitWorkout} className="card grid gap-3 sm:grid-cols-5">
        <h2 className="font-semibold sm:col-span-5">Log a workout for approval</h2>
        <select name="exercise" required className="input sm:col-span-2">{ex?.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
        <input name="sets" type="number" min={1} placeholder="Sets" required className="input" />
        <input name="reps" type="number" min={1} placeholder="Reps" required className="input" />
        <input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="input" />
        <button className="btn sm:col-span-5">Submit request</button>
      </form>
      <div className="card"><h2 className="mb-3 font-semibold">My requests</h2>
        {reqs?.length ? reqs.map((r) => (
          <div key={r.id} className="flex items-center justify-between border-t border-white/5 py-2 text-sm">
            <span>{r.exercises?.name} — {r.sets}×{r.reps} <span className="text-zinc-500">({r.performed_on})</span></span>
            <span className={`badge ${tone[r.status]}`}>{r.status}</span></div>)) : <p className="text-sm text-zinc-500">Nothing yet.</p>}
      </div>
    </main>
  );
}
