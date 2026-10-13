import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { logout } from "@/app/actions";
import { GYM } from "@/lib/config";
import Dropdown from "./Dropdown";

const link = "rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white";

export default async function Navbar() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  let me: any = null, m: any = null, fee: any = null;
  if (user) {
    const period = new Date().toISOString().slice(0, 7) + "-01";
    const [a, b, c] = await Promise.all([
      sb.from("profiles").select("*").eq("id", user.id).single(),
      sb.from("memberships").select("*").eq("user_id", user.id).order("end_date", { ascending: false }).limit(1),
      sb.from("fee_payments").select("status").eq("user_id", user.id).eq("period", period).maybeSingle(),
    ]);
    me = a.data; m = b.data?.[0]; fee = c.data;
  }
  const initials = (me?.full_name ?? user?.email ?? "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-orange-500">{GYM.name.toUpperCase()}</Link>
        <nav className="order-last flex w-full flex-wrap items-center gap-1 sm:order-none sm:w-auto">
          <Link href="/" className={link}>Home</Link>
          <Link href="/membership" className={link}>Membership</Link>
          <Link href="/workout" className={link}>Workout</Link>
          <Dropdown label="More ▾" className={link}>
            <div className="w-40 rounded-lg border border-white/10 bg-zinc-900 p-1">
              <Link href="/about" className={`block ${link}`}>About us</Link>
              <Link href="/contact" className={`block ${link}`}>Contact us</Link>
            </div>
          </Dropdown>
          {me?.role === "admin" && <Link href="/admin" className={`${link} text-orange-400`}>Admin</Link>}
        </nav>
        {user ? (
          <Dropdown align="right" label={initials} className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-black">
            <div className="card w-72 space-y-1 text-sm">
              <p className="text-base font-semibold">{me?.full_name}</p>
              <p className="text-zinc-400">{user.email}</p>
              {me?.phone && <p className="text-zinc-400">{me.phone}</p>}
              {me?.role === "member" && (<div className="mt-2 space-y-1 border-t border-white/10 pt-2">
                <p>Plan: <b>{m?.plan_name ?? "None"}</b></p>
                {m && <p>Expires: <b>{m.end_date}</b></p>}
                <p>Fee this month: <b className={fee?.status === "paid" ? "text-green-400" : "text-red-400"}>{(fee?.status ?? "unpaid").toUpperCase()}</b></p>
              </div>)}
              <form action={logout} className="pt-2"><button className="btn-ghost w-full">Logout</button></form>
            </div>
          </Dropdown>
        ) : (<div className="flex gap-2"><Link href="/login" className="btn-ghost">Login</Link><Link href="/login?mode=register" className="btn">Join</Link></div>)}
      </div>
    </header>
  );
}
