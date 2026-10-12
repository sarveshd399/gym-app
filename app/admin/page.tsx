import { supabaseServer } from "@/lib/supabase/server";
import { logout } from "../actions";
import { PRICING } from "@/lib/config";
import { addExercise, addMember, removeMember, review, setFee } from "./actions";

export default async function Admin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const sb = await supabaseServer();
  const period = new Date().toISOString().slice(0, 7) + "-01";
  const [{ data: members }, { data: ms }, { data: fees }, { data: ex }, { data: pending }] = await Promise.all([
    sb.from("profiles").select("*").eq("role", "member").eq("active", true).order("full_name"),
    sb.from("memberships").select("*").order("end_date", { ascending: false }),
    sb.from("fee_payments").select("*").eq("period", period),
    sb.from("exercises").select("id,name").order("name"),
    sb.from("workout_requests").select("*, profiles!member_id(full_name), exercises(name)").eq("status", "pending").order("created_at"),
  ]);
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-5">
      <header className="flex items-center justify-between"><h1 className="text-2xl font-bold">Trainer dashboard</h1>
        <form action={logout}><button className="btn-ghost">Logout</button></form></header>
      {error && <p className="card border-red-500/50 text-sm text-red-300">{error}</p>}

      <section className="card"><h2 className="mb-3 font-semibold">Pending workout requests ({pending?.length ?? 0})</h2>
        {pending?.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 py-2 text-sm">
            <span><b>{r.profiles?.full_name}</b> — {r.exercises?.name}, {r.sets}×{r.reps} <span className="text-zinc-500">({r.performed_on})</span></span>
            <form action={review} className="flex gap-2"><input type="hidden" name="id" value={r.id} />
              <button name="decision" value="approved" className="btn">Approve</button>
              <button name="decision" value="rejected" className="btn-ghost">Reject</button></form></div>))}
      </section>

      <section className="card"><h2 className="mb-3 font-semibold">Members ({members?.length ?? 0})</h2>
        {members?.map((u) => {
          const m = ms?.find((x) => x.user_id === u.id); const f = fees?.find((x) => x.user_id === u.id); const paid = f?.status === "paid";
          return (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 py-3 text-sm">
              <div><p className="font-medium">{u.full_name}</p><p className="text-zinc-500">{m ? `${m.plan_name} · ends ${m.end_date}` : "No membership"}</p></div>
              <div className="flex flex-wrap items-center gap-2">
                <form action={setFee} className="flex items-center gap-2"><input type="hidden" name="id" value={u.id} />
                  <input name="amount" type="number" defaultValue={f?.amount ?? PRICING.monthly} className="input w-24" />
                  <button name="paid" value={paid ? "0" : "1"} className={paid ? "btn-ghost text-green-300" : "btn"}>{paid ? "Paid ✓ (undo)" : "Mark paid"}</button></form>
                <form action={removeMember}><input type="hidden" name="id" value={u.id} /><button className="btn-ghost text-red-300">Remove</button></form>
              </div></div>);
        })}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <form action={addMember} className="card space-y-2"><h2 className="font-semibold">Add member</h2>
          <input name="name" placeholder="Full name" required className="input" /><input name="phone" placeholder="Phone" className="input" />
          <input name="email" type="email" placeholder="Email" required className="input" /><input name="password" placeholder="Temporary password" minLength={6} required className="input" />
          <div className="flex gap-2"><select name="plan" className="input"><option value="monthly">Monthly (₹800)</option><option value="quarterly">3 Months (₹2200)</option></select></div>
          <button className="btn w-full">Add member</button></form>
        <div className="card"><h2 className="mb-3 font-semibold">Exercises</h2>
          <form action={addExercise} className="mb-3 flex gap-2"><input name="name" placeholder="e.g. Bench Press" required className="input" /><button className="btn">Add</button></form>
          <div className="flex flex-wrap gap-2">{ex?.map((e) => <span key={e.id} className="badge bg-zinc-800">{e.name}</span>)}</div></div>
      </div>
    </main>
  );
}
