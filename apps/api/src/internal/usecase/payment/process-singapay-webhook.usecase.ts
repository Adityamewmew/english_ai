import crypto from "crypto";
import { paymentRepository } from "../../repository/payment.repository";
import { classRepository } from "../../repository/class_repository";

function verifyWebhookSignature(
  rawBody: string,
  headers: Record<string, string | undefined>,
  clientSecret: string,
  endpoint: string
): boolean {
  const receivedSig = headers["x-signature"] || headers["X-Signature"] || "";
  const timestamp = headers["x-timestamp"] || headers["X-Timestamp"] || "";
  const authHeader = headers["authorization"] || headers["Authorization"] || "";
  const accessToken = authHeader.replace(/^Bearer\s+/i, "");

  if (!receivedSig) return false;

  try {
    const bodyObj = JSON.parse(rawBody);
    const sortRecursive = (obj: any): any => {
      if (typeof obj !== "object" || obj === null) return obj;
      if (Array.isArray(obj)) return obj.map(sortRecursive);
      return Object.keys(obj)
        .sort()
        .reduce((acc: any, key) => {
          acc[key] = sortRecursive(obj[key]);
          return acc;
        }, {});
    };
    const normalized = JSON.stringify(sortRecursive(bodyObj));
    const hashedBody = crypto.createHash("sha256").update(normalized).digest("hex");
    const stringToSign = `POST:${endpoint}:${accessToken}:${hashedBody}:${timestamp}`;
    const calculatedSig = crypto
      .createHmac("sha512", clientSecret)
      .update(stringToSign)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(calculatedSig),
      Buffer.from(receivedSig)
    );
  } catch {
    return false;
  }
}

export async function processSingapayWebhookUsecase(params: {
  rawBody: string;
  headers: Record<string, string | undefined>;
  endpoint: string;
}) {
  // Validate signature if configured
  const clientSecret = process.env.SINGAPAY_CLIENT_SECRET || process.env.SINGAPAY_HMAC_KEY;
  const isSandbox = (process.env.SINGAPAY_ENVIRONMENT || "sandbox").toLowerCase() === "sandbox";

  if (clientSecret) {
    const isValid = verifyWebhookSignature(
      params.rawBody,
      params.headers,
      clientSecret,
      params.endpoint
    );
    if (!isValid && !isSandbox) {
      return { success: false, statusCode: 401, message: "Invalid webhook signature" };
    }
  }

  let body: any;
  try {
    body = JSON.parse(params.rawBody);
  } catch {
    return { success: false, statusCode: 400, message: "Invalid JSON body" };
  }

  // Extract reference number
  const data = body.data || body;
  const txObj = data.transaction || data;
  const orderId =
    txObj.merchant_reff_no ||
    txObj.reff_no ||
    data.merchant_reff_no ||
    data.reff_no;

  const status = (txObj.status || data.status || "").toLowerCase();

  if (!orderId) {
    return { success: false, statusCode: 422, message: "Order ID missing from payload" };
  }

  const existingTx = await paymentRepository.findByOrderId(orderId);
  if (!existingTx) {
    return { success: false, statusCode: 404, message: `Transaction with order ID ${orderId} not found` };
  }

  if (existingTx.status === "paid") {
    return { success: true, statusCode: 200, message: "Transaction already processed as paid" };
  }

  if (status === "paid" || status === "settled" || status === "success") {
    await paymentRepository.updateStatus(orderId, "paid", {
      paidAt: new Date(),
      singapayPayload: body,
    });

    // Grant class access to user
    await classRepository.grantAccess(
      existingTx.userId,
      existingTx.cefr,
      existingTx.tier,
      "singapay_webhook"
    );

    return { success: true, statusCode: 200, message: "Payment processed and class unlocked" };
  }

  if (status === "failed" || status === "cancelled" || status === "expired") {
    await paymentRepository.updateStatus(orderId, status === "expired" ? "expired" : "rejected", {
      singapayPayload: body,
    });
    return { success: true, statusCode: 200, message: `Transaction marked as ${status}` };
  }

  return { success: true, statusCode: 200, message: "Webhook acknowledged" };
}
