import { CertificateStatusGrid } from "@/features/certificates";

export const metadata = {
  title: "Sertifikat Kelulusan Level CEFR | EDDY'S English AI",
  description: "Lihat status kelulusan level CEFR dan klaim sertifikat resmi bahasa Inggris Anda.",
};

export default function CertificatesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20">
      <CertificateStatusGrid />
    </div>
  );
}
