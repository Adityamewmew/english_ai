import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";

export const metadata: Metadata = {
  title: "EDDY'S AI: Your Personal AI English Tutor",
  description: "Belajar Bahasa Inggris interaktif dengan Mr. Khoirul. Real-time voice call, tes penempatan CEFR, dan kurikulum standar IELTS/TOEIC.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-blue-100">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
