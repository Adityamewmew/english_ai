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
    throw new ValidationError("Invalid tier selection. Choose between basic, pro, or ultra.");
  }

  const classData = await classRepository.findClassByCefr(normalizedCefr);
  if (!classData || !classData.isActive) {
    throw new NotFoundError(
      `Class for level '${normalizedCefr}' was not found or is currently inactive.`
    );
  }

  const u = await userRepository.findById(userId);

  if (!u) {
    throw new NotFoundError("User not found.");
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

  // Check if already active, expired (renewal), or upgrading
  const existingAccess = await classRepository.findUserAccessByCefr(
    userId,
    normalizedCefr
  );
  if (existingAccess && existingAccess.status === "active") {
    const validity = await classRepository.checkAccessValidity(existingAccess, userId);
    const currentTier = (existingAccess.tier || "basic").toLowerCase();

    // If access has expired and student has not completed modules, allow renewal
    if (validity.isExpired) {
      const renewed = await classRepository.grantAccess(
        userId,
        normalizedCefr,
        normalizedTier,
        "student_renewal"
      );

      return {
        message: `Successfully renewed class access for ${classData.name} (${normalizedTier.toUpperCase()}) for another 30 days!`,
        class: classData,
        access: renewed,
      };
    }

    if (currentTier === normalizedTier) {
      return {
        message: `Class access for ${normalizedCefr} (${normalizedTier.toUpperCase()}) is already active.`,
        class: classData,
        access: existingAccess,
      };
    }

    const tierRank: Record<string, number> = { basic: 1, pro: 2, ultra: 3 };
    if ((tierRank[normalizedTier] || 1) < (tierRank[currentTier] || 1)) {
      throw new ValidationError(
        `You currently have an active ${currentTier.toUpperCase()} plan. Active plans cannot be downgraded to ${normalizedTier.toUpperCase()}.`
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
      message: `Successfully upgraded class ${normalizedCefr} to ${normalizedTier.toUpperCase()}!`,
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
        `To unlock class ${normalizedCefr}, you must complete class ${prevCefr} and obtain the graduation certificate first.`
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
    message: `Successfully unlocked access to ${classData.name} (${normalizedTier.toUpperCase()})!`,
    class: classData,
    access,
  };
}
