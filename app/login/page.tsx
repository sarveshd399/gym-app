"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

function Form() {
  const router = useRouter();
  const [register, setRegister] = useState(useSearchParams().get("mode") === "register");
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg("");
    const f = new FormData(e.currentTarget); const sb = supabaseBrowser();
    const email = String(f.get("email")), password = String(f.get("password"));
    const { data, error } = register
      ? await sb.auth.signUp({ email, password, options: { data: { full_name: String(f.get("name")), phone: String(f.get("phone")) } } })
      : await sb.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setMsg(error.message);
    if (!data.session) return setMsg("Check your email to confirm your account, then log in.");
    router.push("/member"); router.refresh();
  }
  return (
    <form onSubmit={onSubmit} className="card w-full max-w-sm space-y-3">
      <h1 className="text-2xl font-bold">{register ? "Create account" : "Welcome back"}</h1>
      {register && <><input name="name" placeholder="Full name" required className="input" /><input name="phone" placeholder="Phone" className="input" /></>}
      <input name="email" type="email" placeholder="Email" required className="input" />
      <input name="password" type="password" placeholder="Password (min 6)" minLength={6} required className="input" />
      {msg && <p className="text-sm text-orange-400">{msg}</p>}
      <button disabled={busy} className="btn w-full">{busy ? "Please wait…" : register ? "Register" : "Login"}</button>
      <button type="button" onClick={() => setRegister(!register)} className="w-full text-sm text-zinc-400 hover:text-white">
        {register ? "Have an account? Login" : "New member? Register"}
      </button>
    </form>
  );
}
export default function LoginPage() {
  return (<main className="flex min-h-screen items-center justify-center p-5"><Suspense><Form /></Suspense></main>);
}
