import type { Metadata, Viewport } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://eddys.ai";

export const viewport: Viewport = {
  themeColor: "#10375C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "EDDY'S AI: Bangun Refleks Bicara Bahasa Inggris Bersama Mr. Khoirul",
    template: "%s | EDDY'S AI",
  },
  description:
    "Latihan bicara bahasa Inggris via simulasi telepon suara santai bersama Mr. Khoirul. Bebas rasa cemas, dikoreksi natural, terstruktur dari level CEFR A1 hingga C2.",
  keywords: [
    "kursus bahasa inggris",
    "belajar speaking inggris",
    "ai english tutor",
    "latihan bicara inggris",
    "cefr test gratis",
    "mr khoirul ai",
    "eddy ai",
    "bicara bahasa inggris lancar",
  ],
  authors: [{ name: "EDDY'S AI Team" }],
  creator: "EDDY'S AI",
  publisher: "EDDY'S AI",
  formatDetection: {
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "EDDY'S AI",
    title: "EDDY'S AI: Bangun Refleks Bicara Bahasa Inggris Bersama Mr. Khoirul",
    description:
      "Latihan bicara bahasa Inggris via simulasi telepon suara santai bersama Mr. Khoirul. Bebas rasa cemas, dikoreksi natural, terstruktur dari level CEFR A1 hingga C2.",
    images: [
      {
        url: "/illustrations/tutor/khoirul-waving.webp",
        width: 1200,
        height: 630,
        alt: "EDDY'S AI - Tutor Bahasa Inggris Cerdas Mr. Khoirul",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EDDY'S AI: Bangun Refleks Bicara Bahasa Inggris Bersama Mr. Khoirul",
    description:
      "Latihan bicara bahasa Inggris santai via simulasi telepon suara. Evaluasi CEFR instan dan koreksi natural.",
    images: ["/illustrations/tutor/khoirul-waving.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": `${APP_URL}/#organization`,
      name: "EDDY'S AI",
      url: APP_URL,
      logo: `${APP_URL}/images/logo-academy.png`,
      description:
        "Platform tutor AI percakapan suara untuk melatih refleks berbicara bahasa Inggris secara alami.",
    },
    {
      "@type": "Course",
      "@id": `${APP_URL}/#course`,
      name: "Program Latihan Refleks Percakapan Bahasa Inggris (CEFR A1–C2)",
      description:
        "Simulasi telepon dua arah bersama tutor AI Mr. Khoirul dengan umpan balik instan tata bahasa, kosa kata, dan aksen.",
      provider: {
        "@id": `${APP_URL}/#organization`,
      },
      educationalCredentialAwarded: "Sertifikat CEFR Resmi",
      offers: {
        "@type": "Offer",
        category: "Free Assessment & Subscription",
        price: "0",
        priceCurrency: "IDR",
        availability: "https://schema.org/InStock",
      },
    },
  ],
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
          rel="preload"
          href="/illustrations/tutor/khoirul-waving.webp"
          as="image"
          type="image/webp"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased font-sans bg-white text-slate-900 selection:bg-amber-100 selection:text-slate-900">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
