import "./globals.css";
import Navbar from "@/components/Navbar";
import { GYM } from "@/lib/config";
export const metadata = { title: GYM.name, description: GYM.tagline };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body><Navbar />{children}</body></html>);
}
