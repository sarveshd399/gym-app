"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function Dropdown({ label, children, align = "left", className = "" }: {
  label: React.ReactNode; children: React.ReactNode; align?: "left" | "right"; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className={className}>{label}</button>
      {open && <div className={`absolute z-50 mt-2 ${align === "right" ? "right-0" : "left-0"}`}>{children}</div>}
    </div>
  );
}
