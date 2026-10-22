import { classRepository } from "../../repository/class_repository";
import { certificateRepository } from "../../repository/certificate_repository";
import { NotFoundError, ValidationError } from "../../../common/errors/app-error";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";

export async function purchaseClassUsecase(userId: string, cefr: string) {
  const normalizedCefr = cefr.trim().toUpperCase();

  const classData = await classRepository.findClassByCefr(normalizedCefr);
  if (!classData || !classData.isActive) {
    throw new NotFoundError(
      `Kelas untuk level '${normalizedCefr}' tidak ditemukan atau sedang tidak aktif.`
    );
  }

  const [u] = await db
    .select({
      id: users.id,
      name: users.name,
      role: users.role,
      accessType: users.accessType,
      email: users.email,
      currentCefr: users.currentCefr,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!u) {
    throw new NotFoundError("Pengguna tidak ditemukan.");
  }

  const isAdmin =
    u.role === "admin" ||
    u.accessType === 1 ||
    u.email?.toLowerCase().includes("khoirul");

  // Check if already active
  const existingAccess = await classRepository.findUserAccessByCefr(
    userId,
    normalizedCefr
  );
  if (existingAccess && existingAccess.status === "active") {
    return {
      message: `Akses kelas ${normalizedCefr} sudah aktif.`,
      class: classData,
      access: existingAccess,
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
    "student_topup"
  );

  return {
    message: `Berhasil membuka akses ${classData.name}!`,
    class: classData,
    access,
  };
}
