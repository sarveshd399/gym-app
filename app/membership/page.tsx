import Link from "next/link";
import { PRICING as P } from "@/lib/config";
const plans = [
  { name: "Monthly", price: P.monthly, note: "1 month access" },
  { name: "3 Months", price: P.quarterly, note: `Save ₹${P.monthly * 3 - P.quarterly}`, best: true },
];
export default function Membership() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14 text-center">
      <h1 className="text-4xl font-extrabold">Membership plans</h1>
      <p className="mt-2 text-zinc-400">One-time joining fee of ₹{P.joining} for new members.</p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {plans.map((p) => (
          <div key={p.name} className={`card ${p.best ? "border-orange-500" : ""}`}>
            {p.best && <span className="badge bg-orange-500 text-black">Best value</span>}
            <h2 className="mt-2 text-xl font-semibold">{p.name}</h2>
            <p className="my-3 text-4xl font-extrabold text-orange-500">₹{p.price}</p>
            <p className="text-sm text-zinc-400">{p.note}</p>
            <p className="mt-4 border-t border-white/10 pt-3 text-sm">First payment: <b>₹{p.price + P.joining}</b></p>
          </div>))}
      </div>
      <p className="mt-8 text-sm text-zinc-400">Pay at the gym and your trainer will activate your membership.</p>
      <Link href="/login?mode=register" className="btn mt-6 inline-block">Create account</Link>
    </main>
  );
}
