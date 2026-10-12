import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { GYM } from "@/lib/config";

export const dynamic = "force-dynamic";
export default async function Home() {
  const sb = await supabaseServer();
  const [{ data: board }, { data: photos }] = await Promise.all([
    sb.rpc("get_leaderboard", { lim: 5 }),
    sb.from("gallery_photos").select("id,image_path,caption").order("created_at", { ascending: false }).limit(4),
  ]);
  const url = (p: string) => sb.storage.from("gallery").getPublicUrl(p).data.publicUrl;
  return (
    <main>
      <section className="hero px-5 py-28 text-center sm:py-40">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">{GYM.name}</h1>
        <p className="mt-4 text-lg text-orange-400">{GYM.tagline}</p>
        <Link href="/login?mode=register" className="btn mt-8 inline-block px-8 py-3">Join now</Link>
      </section>
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-14 lg:grid-cols-2">
        <section className="card"><h2 className="mb-4 text-xl font-bold">🏆 Leaderboard <span className="text-sm font-normal text-zinc-500">· most approved exercises</span></h2>
          {board?.length ? board.map((r: { full_name: string; total: number }, i: number) => (
            <div key={i} className={`flex items-center justify-between border-t border-white/5 py-2 ${i === 0 ? "font-bold text-orange-400" : ""}`}>
              <span>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`} {r.full_name}</span><span>{r.total}</span></div>
          )) : <p className="text-sm text-zinc-500">No approved workouts yet. Be the first!</p>}
        </section>
        <section className="card"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">📸 Gallery</h2><Link href="/gallery" className="btn-ghost">View all</Link></div>
          {photos?.length ? <div className="grid grid-cols-2 gap-2">{photos.map((p) => (
            <Link key={p.id} href="/gallery"><img src={url(p.image_path)} alt={p.caption ?? "Gym photo"} className="aspect-square w-full rounded-lg object-cover" /></Link>))}</div>
            : <p className="text-sm text-zinc-500">No photos yet. Upload the first one!</p>}
        </section>
      </div>
    </main>
  );
}
