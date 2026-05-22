import type { Metadata } from "next";
import HeaderActions from "@/components/HeaderActions";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quote Comparison — Inquiry Log",
  description: "Nagarkot Forwarders internal dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4">
          <a href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Nagarkot" className="h-8 w-auto" />
            <div className="border-l border-slate-200 pl-4">
              <p className="text-sm font-semibold leading-tight text-brand-500">Quote Comparison — Inquiry Log</p>
            </div>
          </a>
          <div className="ml-auto">
            <HeaderActions />
          </div>
        </header>
        <main className="px-6 py-8 max-w-7xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
