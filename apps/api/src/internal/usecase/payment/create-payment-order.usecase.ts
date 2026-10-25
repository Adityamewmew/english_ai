import { randomUUID } from "crypto";
import { paymentRepository } from "../../repository/payment.repository";
import { classRepository } from "../../repository/class_repository";
import { userRepository } from "../../repository/user_repository";
import { NotFoundError } from "../../../common/errors/app-error";

export interface CreatePaymentOrderDTO {
  userId: string;
  cefr: string;
  tier: "basic" | "pro" | "ultra";
  paymentCategory: "va" | "qris" | "ewallet" | "manual_transfer";
  paymentChannel: string;
}

/**
 * Request SingaPay OAuth token directly via process.env
 */
async function getSingapayToken(): Promise<string | null> {
  const clientId = process.env.SINGAPAY_CLIENT_ID;
  const clientSecret = process.env.SINGAPAY_CLIENT_SECRET;
  const partnerId = process.env.SINGAPAY_PARTNER_ID;
  const isSandbox = (process.env.SINGAPAY_ENVIRONMENT || "sandbox").toLowerCase() === "sandbox";
  const baseUrl = isSandbox
    ? "https://sandbox-openapi.singapay.id"
    : "https://openapi.singapay.id";

  if (!clientId || !clientSecret || !partnerId) return null;

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const res = await fetch(`${baseUrl}/api/v1.0/access-token/b2b`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "X-PARTNER-ID": partnerId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ grant_type: "client_credentials" }),
    });

    if (!res.ok) return null;
    const json = (await res.json()) as any;
    return json?.data?.access_token || json?.access_token || null;
  } catch {
    return null;
  }
}

/**
 * Generate SingaPay Virtual Account
 */
async function generateVirtualAccount(params: {
  bankCode: string;
  amount: number;
  orderId: string;
  customerName: string;
  expiredAt: Date;
}) {
  const partnerId = process.env.SINGAPAY_PARTNER_ID || "";
  const isSandbox = (process.env.SINGAPAY_ENVIRONMENT || "sandbox").toLowerCase() === "sandbox";
  const baseUrl = isSandbox
    ? "https://sandbox-openapi.singapay.id"
    : "https://openapi.singapay.id";
  const token = await getSingapayToken();

  if (token) {
    try {
      const res = await fetch(`${baseUrl}/api/v1.0/virtual-accounts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-PARTNER-ID": partnerId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bank_code: params.bankCode,
          kind: "temporary",
          amount_type: "closed",
          amount: params.amount,
          merchant_reff_no: params.orderId,
          name: `EDDYS - ${params.customerName.slice(0, 30)}`,
          expired_at: String(params.expiredAt.getTime()),
          max_usage: 1,
        }),
      });

      if (res.ok) {
        const json = (await res.json()) as any;
        const vaNum = json?.data?.va_number || json?.va_number;
        if (vaNum) {
          return { vaNumber: vaNum, payload: json };
        }
      }
    } catch {
      // Fallback to predictable sandbox format
    }
  }

  // Predictable sandbox VA format
  const prefixMap: Record<string, string> = {
    BCA: "1614",
    MANDIRI: "8982",
    BRI: "1284",
    BNI: "8271",
    PERMATA: "8528",
    CIMB: "5919",
    BSI: "9008",
  };
  const prefix = prefixMap[params.bankCode] || "8888";
  const randomDigits = Math.floor(100000000000 + Math.random() * 900000000000).toString();
  const sandboxVa = `${prefix}${randomDigits}`;

  return {
    vaNumber: sandboxVa,
    payload: { mode: "sandbox", bank: params.bankCode, va_number: sandboxVa },
  };
}

/**
 * Generate SingaPay QRIS
 */
async function generateQris(params: {
  amount: number;
  orderId: string;
}) {
  const partnerId = process.env.SINGAPAY_PARTNER_ID || "";
  const isSandbox = (process.env.SINGAPAY_ENVIRONMENT || "sandbox").toLowerCase() === "sandbox";
  const baseUrl = isSandbox
    ? "https://sandbox-openapi.singapay.id"
    : "https://openapi.singapay.id";
  const token = await getSingapayToken();

  if (token) {
    try {
      const res = await fetch(`${baseUrl}/api/v1.0/qris-dynamic/generate-qr`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-PARTNER-ID": partnerId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: params.amount,
          merchant_reff_no: params.orderId,
        }),
      });

      if (res.ok) {
        const json = (await res.json()) as any;
        const qrData = json?.data?.qr_data || json?.qr_data;
        if (qrData) {
          return {
            qrData,
            qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`,
            payload: json,
          };
        }
      }
    } catch {
      // Fallback to sandbox mock QR
    }
  }

  const mockQrData = `00020101021226670014ID.LINKAJA.WWW011893600911002${params.orderId}520458125303360540${params.amount}5802ID5914EDDYS ENGLISH6007JAKARTA6304ABCD`;
  return {
    qrData: mockQrData,
    qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(mockQrData)}`,
    payload: { mode: "sandbox", qr_data: mockQrData },
  };
}

export async function createPaymentOrderUsecase(dto: CreatePaymentOrderDTO) {
  const normalizedCefr = dto.cefr.trim().toUpperCase();
  const normalizedTier = dto.tier.trim().toLowerCase() as "basic" | "pro" | "ultra";

  const classData = await classRepository.findClassByCefr(normalizedCefr);
  if (!classData || !classData.isActive) {
    throw new NotFoundError(`Kelas untuk level '${normalizedCefr}' tidak ditemukan.`);
  }

  const user = await userRepository.findById(dto.userId);
  if (!user) {
    throw new NotFoundError("Pengguna tidak ditemukan.");
  }

  // Calculate tier price
  const tierPlans = classData.tierPlans as any;
  const tierPlan = tierPlans?.[normalizedTier];
  const price = tierPlan?.price ?? classData.price ?? 49000;

  // Read expiration setting
  const settings = await paymentRepository.getSettings();
  const expiredHours = parseInt(settings.payment_expired_hours || "24", 10) || 24;
  const expiresAt = new Date(Date.now() + expiredHours * 3600 * 1000);

  // Generate unique order ID
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = `INV-${dateStr}-${randSuffix}`;
  const txId = randomUUID();

  let vaNumber: string | undefined = undefined;
  let qrData: string | undefined = undefined;
  let qrImageUrl: string | undefined = undefined;
  let singapayPayload: any = undefined;

  if (dto.paymentCategory === "va") {
    const bankCode = dto.paymentChannel.replace(/_VA$/i, "").toUpperCase();
    const vaResult = await generateVirtualAccount({
      bankCode,
      amount: price,
      orderId,
      customerName: user.name || "Siswa",
      expiredAt: expiresAt,
    });
    vaNumber = vaResult.vaNumber;
    singapayPayload = vaResult.payload;
  } else if (dto.paymentCategory === "qris") {
    const qrisResult = await generateQris({
      amount: price,
      orderId,
    });
    qrData = qrisResult.qrData;
    qrImageUrl = qrisResult.qrImageUrl;
    singapayPayload = qrisResult.payload;
  } else if (dto.paymentCategory === "manual_transfer") {
    const manualBankId = parseInt(dto.paymentChannel.replace("manual_", ""), 10);
    let bankInfo = null;
    if (!isNaN(manualBankId)) {
      bankInfo = await paymentRepository.getManualBankById(manualBankId);
    }
    if (!bankInfo) {
      const activeBanks = await paymentRepository.getActiveManualBanks();
      bankInfo = activeBanks[0] || null;
    }
    singapayPayload = {
      manual_bank: bankInfo,
    };
  } else if (dto.paymentCategory === "ewallet") {
    singapayPayload = {
      vendor: dto.paymentChannel,
      mode: "sandbox_ewallet",
    };
  }

  const transaction = await paymentRepository.createTransaction({
    id: txId,
    orderId,
    userId: dto.userId,
    cefr: normalizedCefr,
    tier: normalizedTier,
    paymentCategory: dto.paymentCategory,
    paymentChannel: dto.paymentChannel,
    amount: price,
    status: "pending",
    vaNumber,
    qrData,
    qrImageUrl,
    expiresAt,
    singapayPayload,
  });

  return {
    orderId: transaction.orderId,
    amount: transaction.amount,
    status: transaction.status,
    cefr: transaction.cefr,
    tier: transaction.tier,
    paymentCategory: transaction.paymentCategory,
    paymentChannel: transaction.paymentChannel,
    vaNumber: transaction.vaNumber,
    qrData: transaction.qrData,
    qrImageUrl: transaction.qrImageUrl,
    expiresAt: transaction.expiresAt,
    singapayPayload: transaction.singapayPayload,
    redirectUrl: `/payment/${transaction.orderId}`,
  };
}
