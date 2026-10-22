import { classRepository } from "../../repository/class_repository";
import { certificateRepository } from "../../repository/certificate_repository";
import { userRepository } from "../../repository/user_repository";
import { NotFoundError, ValidationError } from "../../../common/errors/app-error";

export async function purchaseClassUsecase(
  userId: string,
  cefr: string,
  tier = "basic"
) {
  const normalizedCefr = cefr.trim().toUpperCase();
  const normalizedTier = tier.trim().toLowerCase();

  if (!["basic", "pro", "ultra"].includes(normalizedTier)) {
    throw new ValidationError("Pilihan tier tidak valid. Pilih antara basic, pro, atau ultra.");
  }

  const classData = await classRepository.findClassByCefr(normalizedCefr);
  if (!classData || !classData.isActive) {
    throw new NotFoundError(
      `Kelas untuk level '${normalizedCefr}' tidak ditemukan atau sedang tidak aktif.`
    );
  }

  const u = await userRepository.findById(userId);

  if (!u) {
    throw new NotFoundError("Pengguna tidak ditemukan.");
  }

  const adminEmails = [
    "mrkhoirul@gmail.com",
    "mrkhoriul@gmail.com",
    ...(process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
      : []),
  ];
  const isAdmin =
    u.role === "admin" ||
    u.accessType === 1 ||
    adminEmails.includes((u.email || "").toLowerCase());

  // Check if already active and upgrading
  const existingAccess = await classRepository.findUserAccessByCefr(
    userId,
    normalizedCefr
  );
  if (existingAccess && existingAccess.status === "active") {
    const currentTier = (existingAccess.tier || "basic").toLowerCase();
    if (currentTier === normalizedTier) {
      return {
        message: `Akses kelas ${normalizedCefr} (${normalizedTier.toUpperCase()}) sudah aktif.`,
        class: classData,
        access: existingAccess,
      };
    }

    const tierRank: Record<string, number> = { basic: 1, pro: 2, ultra: 3 };
    if ((tierRank[normalizedTier] || 1) < (tierRank[currentTier] || 1)) {
      throw new ValidationError(
        `Kamu saat ini sudah memiliki paket ${currentTier.toUpperCase()}. Paket aktif tidak dapat diturunkan ke ${normalizedTier.toUpperCase()}.`
      );
    }

    // Upgrading tier
    const updated = await classRepository.grantAccess(
      userId,
      normalizedCefr,
      normalizedTier,
      "student_upgrade"
    );

    return {
      message: `Berhasil meng-upgrade paket kelas ${normalizedCefr} ke ${normalizedTier.toUpperCase()}!`,
      class: classData,
      access: updated,
    };
  }

  const cefrOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const rank = cefrOrder.indexOf(normalizedCefr);
  const userRank = cefrOrder.indexOf(
    (u.currentCefr || "A1").toUpperCase().slice(0, 2)
  );

  if (!isAdmin && rank > 0) {
    const isPlacedAtOrAbove = userRank !== -1 && rank <= userRank;
    const prevCefr = cefrOrder[rank - 1];
    const prevCert = await certificateRepository.findUserCertificateByCefr(
      userId,
      prevCefr
    );

    if (!isPlacedAtOrAbove && !prevCert) {
      throw new ValidationError(
        `Untuk membuka kelas ${normalizedCefr}, kamu harus menyelesaikan kelas ${prevCefr} dan memperoleh sertifikat kelulusan terlebih dahulu.`
      );
    }
  }

  const access = await classRepository.grantAccess(
    userId,
    normalizedCefr,
    normalizedTier,
    "student_topup"
  );

  return {
    message: `Berhasil membuka akses ${classData.name} (${normalizedTier.toUpperCase()})!`,
    class: classData,
    access,
  };
}
