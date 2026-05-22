import type { Metadata } from "next";
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
            <a
              href="/settings"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-500 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </a>
          </div>
        </header>
        <main className="px-6 py-8 max-w-7xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
