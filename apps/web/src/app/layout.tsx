import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EDDY'S AI — Your Personal AI English Tutor",
  description: "Belajar Bahasa Inggris interaktif dengan Mr. Khoirul. Real-time voice call, tes penempatan CEFR, dan kurikulum standar IELTS/TOEIC.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-surface selection:bg-accent/20">
        {children}
      </body>
    </html>
  );
}
