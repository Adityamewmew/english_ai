import { paymentRepository } from "../../repository/payment.repository";
import { classRepository } from "../../repository/class_repository";
import { NotFoundError } from "../../../common/errors/app-error";

export async function getPaymentOrderUsecase(orderId: string) {
  const tx = await paymentRepository.findByOrderId(orderId);
  if (!tx) {
    throw new NotFoundError("Pesanan pembayaran tidak ditemukan.");
  }

  // Check if expired
  const now = new Date();
  if (tx.status === "pending" && tx.expiresAt < now) {
    await paymentRepository.updateStatus(orderId, "expired");
    tx.status = "expired";
  }

  const classData = await classRepository.findClassByCefr(tx.cefr);

  // Generate guides based on category & channel
  const bankCode = (tx.paymentChannel || "BCA").replace(/_VA$/i, "").toUpperCase();
  const guides = getBankPaymentGuides(tx.paymentCategory, bankCode, tx.vaNumber || "");

  // Read WhatsApp settings in case student wants to ask support
  const settings = await paymentRepository.getSettings();

  return {
    ...tx,
    className: classData?.name || `Kelas CEFR ${tx.cefr}`,
    isExpired: tx.status === "expired",
    remainingSeconds: Math.max(0, Math.floor((tx.expiresAt.getTime() - now.getTime()) / 1000)),
    guides,
    whatsappSupport: {
      number: settings.whatsapp_number || "6281234567890",
      message: encodeURIComponent(
        `Halo Admin EDDY'S AI, saya ingin menanyakan konfirmasi pembayaran pesanan #${tx.orderId} untuk kelas ${tx.cefr}.`
      ),
    },
  };
}

function getBankPaymentGuides(category: string, bankCode: string, vaNumber: string) {
  if (category === "va") {
    return [
      {
        channel: `Mobile Banking (m-Banking ${bankCode})`,
        steps: [
          `Buka aplikasi Mobile Banking ${bankCode} di ponsel Anda dan lakukan login.`,
          `Pilih menu Transfer atau Pembayaran > Virtual Account / Tagihan.`,
          `Masukkan nomor Virtual Account: ${vaNumber}.`,
          `Pastikan nama merchant EDDY'S AI dan total tagihan sudah sesuai.`,
          `Masukkan PIN Mobile Banking Anda untuk menyelesaikan pembayaran.`,
        ],
      },
      {
        channel: `ATM ${bankCode}`,
        steps: [
          `Masukkan kartu ATM ${bankCode} dan PIN Anda.`,
          `Pilih menu Transaksi Lainnya > Transfer > Ke Rekening Virtual Account.`,
          `Masukkan nomor Virtual Account: ${vaNumber} lalu tekan Benar.`,
          `Periksa rincian pembayaran di layar ATM. Jika sudah sesuai, pilih Ya.`,
          `Simpan struk transaksi sebagai bukti pembayaran yang sah.`,
        ],
      },
      {
        channel: `Internet Banking`,
        steps: [
          `Login ke portal Internet Banking bank Anda.`,
          `Pilih menu Pembayaran Tagihan / Virtual Account.`,
          `Input nomor Virtual Account: ${vaNumber}.`,
          `Verifikasi nominal dan lakukan otorisasi transaksi dengan Token Anda.`,
        ],
      },
    ];
  }

  if (category === "qris") {
    return [
      {
        channel: "Scan Semua Aplikasi (QRIS)",
        steps: [
          "Buka aplikasi e-wallet (GoPay, OVO, Dana, ShopeePay) atau Mobile Banking (BCA, Mandiri, BRI, BNI).",
          "Pilih menu Bayar / Scan QRIS.",
          "Arahkan kamera ke QR Code yang ditampilkan.",
          "Pastikan nama merchant EDDY'S AI dan nominal pembayaran telah sesuai.",
          "Masukkan PIN transaksi Anda untuk menyelesaikan pembayaran.",
        ],
      },
    ];
  }

  if (category === "manual_transfer") {
    return [
      {
        channel: "Petunjuk Transfer Manual & Upload Bukti",
        steps: [
          "Transfer tepat sesuai nominal yang tertera ke nomor rekening bank di atas.",
          "Simpan tangkapan layar / struk bukti transfer yang berhasil.",
          "Unggah bukti transfer Anda melalui formulir di bawah ini.",
          "Admin akan memverifikasi bukti transfer Anda (biasanya 5–15 menit). Setelah di-ACC, kelas akan otomatis terbuka.",
        ],
      },
    ];
  }

  return [
    {
      channel: "Petunjuk Pembayaran",
      steps: [
        "Selesaikan pembayaran sesuai petunjuk pada layar.",
        "Status pembayaran akan terverifikasi secara otomatis.",
      ],
    },
  ];
}
