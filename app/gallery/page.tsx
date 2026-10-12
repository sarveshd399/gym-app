import { supabaseServer } from "@/lib/supabase/server";
import Uploader from "@/components/Uploader";
import { deletePhoto, toggleLike } from "../actions";

export const dynamic = "force-dynamic";
export default async function Gallery() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const isAdmin = user ? (await sb.from("profiles").select("role").eq("id", user.id).single()).data?.role === "admin" : false;
  const { data: photos } = await sb.from("gallery_photos").select("*, gallery_likes(user_id)").order("created_at", { ascending: false });
  const url = (p: string) => sb.storage.from("gallery").getPublicUrl(p).data.publicUrl;
  return (
    <main className="mx-auto max-w-6xl space-y-6 p-5">
      <h1 className="text-3xl font-extrabold">Gallery</h1>
      {user ? <Uploader /> : <p className="text-sm text-zinc-400">Log in to upload photos and like them.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos?.map((p) => {
          const likes = p.gallery_likes ?? []; const liked = likes.some((l: { user_id: string }) => l.user_id === user?.id);
          return (
            <div key={p.id} className="card overflow-hidden p-0">
              <img src={url(p.image_path)} alt={p.caption ?? "Gym photo"} className="aspect-square w-full object-cover" />
              <div className="flex items-center justify-between p-3 text-sm">
                <span className="truncate text-zinc-300">{p.caption}</span>
                <div className="flex items-center gap-2">
                  <form action={toggleLike}><input type="hidden" name="id" value={p.id} />
                    <button className={`btn-ghost ${liked ? "text-red-400" : ""}`}>{liked ? "❤️" : "🤍"} {likes.length}</button></form>
                  {(isAdmin || p.user_id === user?.id) && <form action={deletePhoto}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="path" value={p.image_path} /><button className="btn-ghost text-red-300">Delete</button></form>}
                </div></div></div>);
        })}
      </div>
      {!photos?.length && <p className="text-zinc-500">No photos yet.</p>}
    </main>
  );
}
