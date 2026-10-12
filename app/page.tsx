import Link from "next/link";
const plans = [["Monthly", "₹1,000", "Full gym access"], ["Quarterly", "₹2,700", "Save 10%"], ["Yearly", "₹9,600", "Best value"]];
export default function Home() {
  return (
    <main>
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-5">
        <span className="text-xl font-extrabold tracking-tight text-orange-500">IRONFORGE</span>
        <div className="flex gap-3"><Link href="/login" className="btn-ghost">Login</Link><Link href="/login?mode=register" className="btn">Join now</Link></div>
      </nav>
      <section className="mx-auto max-w-6xl px-5 py-24 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">Train hard.<br /><span className="text-orange-500">Track everything.</span></h1>
        <p className="mx-auto mt-6 max-w-xl text-zinc-400">Track your membership, log your workouts and get them approved by your trainer, all in one place.</p>
        <Link href="/login?mode=register" className="btn mt-8 inline-block px-8 py-3">Get started</Link>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-20 sm:grid-cols-3">
        {plans.map(([n, p, d]) => (<div key={n} className="card text-center"><h3 className="font-semibold">{n}</h3><p className="my-3 text-3xl font-extrabold text-orange-500">{p}</p><p className="text-sm text-zinc-400">{d}</p></div>))}
      </section>
      <footer className="border-t border-white/10 p-6 text-center text-sm text-zinc-500">Contact: +91 00000 00000 · your-gym@email.com</footer>
    </main>
  );
}
