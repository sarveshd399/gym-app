import { GYM } from "@/lib/config";
export default function Contact() {
  return (<main className="mx-auto max-w-3xl px-5 py-14"><h1 className="text-4xl font-extrabold">Contact us</h1>
    <div className="card mt-8 space-y-3"><p>📞 <a className="text-orange-400" href={`tel:${GYM.phone}`}>{GYM.phone}</a></p>
      <p>✉️ <a className="text-orange-400" href={`mailto:${GYM.email}`}>{GYM.email}</a></p><p>📍 {GYM.address}</p><p>🕒 {GYM.hours}</p></div>
    <p className="mt-4 text-sm text-zinc-500">Edit these details in lib/config.ts.</p></main>);
}
