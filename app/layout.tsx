import "./globals.css";
import { Montserrat } from "next/font/google";
import Navbar from "@/components/Navbar";
import { GYM } from "@/lib/config";
const font = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });
export const metadata = { title: GYM.name, description: GYM.tagline };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body className={font.className}><Navbar />{children}</body></html>);
}
