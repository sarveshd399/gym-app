import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { GYM, STATS } from "@/lib/config";

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
      <section className="hero">
        <img src="/hero.jpg" alt="" className="hero-img" />
        <div className="hero-fade" />
        <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-64 sm:py-40">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500">{GYM.name}</p>
          <h1 className="mt-4 max-w-xl text-5xl font-black uppercase leading-[0.95] sm:text-7xl">
            Build strength.<br /><span className="text-orange-500">Track</span> progress.<br />Enjoy the process.</h1>
          <p className="mt-6 max-w-md text-sm text-zinc-300">Log your workouts, get them approved by your trainer, keep your membership in check and climb the leaderboard.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login?mode=register" className="btn px-6 py-3 uppercase">Join today →</Link>
            <Link href="/membership" className="btn-ghost px-6 py-3 font-semibold uppercase">View memberships</Link></div>
        </div>
      </section>
      <section className="border-y border-white/10 bg-black"><div className="mx-auto grid max-w-6xl grid-cols-2 sm:grid-cols-4">
        {STATS.map(([v, l]) => (<div key={l} className="border-white/10 p-6 sm:border-r last:border-r-0"><p className="text-3xl font-black text-orange-500">{v}</p><p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">{l}</p></div>))}
      </div></section>
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-14 lg:grid-cols-2">
        <section className="card"><h2 className="mb-4 text-xl font-extrabold uppercase">🏆 Leaderboard <span className="text-xs font-normal normal-case text-zinc-500">· most approved exercises</span></h2>
          {board?.length ? board.map((r: { full_name: string; total: number }, i: number) => (
            <div key={i} className={`flex items-center justify-between border-t border-white/5 py-2 ${i === 0 ? "font-bold text-orange-500" : ""}`}>
              <span>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`} {r.full_name}</span><span>{r.total}</span></div>
          )) : <p className="text-sm text-zinc-500">No approved workouts yet. Be the first!</p>}
        </section>
        <section className="card"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-extrabold uppercase">📸 Gallery</h2><Link href="/gallery" className="btn-ghost">View all</Link></div>
          {photos?.length ? <div className="grid grid-cols-2 gap-2">{photos.map((p) => (
            <Link key={p.id} href="/gallery"><img src={url(p.image_path)} alt={p.caption ?? "Gym photo"} className="aspect-square w-full rounded-lg object-cover" /></Link>))}</div>
            : <p className="text-sm text-zinc-500">No photos yet. Upload the first one!</p>}
        </section>
      </div>
    </main>
  );
}
