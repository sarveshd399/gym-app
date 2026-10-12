"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
export default function Uploader() {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; const f = new FormData(form); const file = f.get("file") as File;
    if (!file?.size) return;
    if (!file.type.startsWith("image/")) return setMsg("Please choose an image.");
    if (file.size > 4 * 1024 * 1024) return setMsg("Max size is 4 MB.");
    setBusy(true); setMsg("");
    const sb = supabaseBrowser(); const { data: { user } } = await sb.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const path = `${user.id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const up = await sb.storage.from("gallery").upload(path, file);
    if (up.error) { setBusy(false); return setMsg(up.error.message); }
    const ins = await sb.from("gallery_photos").insert({ user_id: user.id, image_path: path, caption: String(f.get("caption") || "") });
    setBusy(false);
    if (ins.error) return setMsg(ins.error.message);
    form.reset(); router.refresh();
  }
  return (
    <form onSubmit={onSubmit} className="card flex flex-wrap items-center gap-3">
      <input name="file" type="file" accept="image/*" required className="text-sm" />
      <input name="caption" placeholder="Caption (optional)" className="input w-auto flex-1" />
      <button disabled={busy} className="btn">{busy ? "Uploading…" : "Upload"}</button>
      {msg && <p className="w-full text-sm text-orange-400">{msg}</p>}
    </form>
  );
}
