import { GYM } from "@/lib/config";
export default function About() {
  return (<main className="mx-auto max-w-3xl px-5 py-14"><h1 className="text-4xl font-extrabold">About {GYM.name}</h1>
    <p className="mt-6 text-zinc-300">Write the gym's story here: who the trainer is, how long it has been running, and what makes it different. Edit this text in <code>app/about/page.tsx</code>.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-3">{["Experienced trainer", "Track your progress", "Friendly community"].map((t) => <div key={t} className="card text-center font-medium">{t}</div>)}</div></main>);
}
