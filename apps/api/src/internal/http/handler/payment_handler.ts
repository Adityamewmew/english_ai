import { Elysia, t } from "elysia";
import { createPaymentOrderUsecase } from "../../usecase/payment/create-payment-order.usecase";
import { getPaymentOrderUsecase } from "../../usecase/payment/get-payment-order.usecase";
import { uploadTransferProofUsecase } from "../../usecase/payment/upload-transfer-proof.usecase";
import { simulateSandboxPaymentUsecase } from "../../usecase/payment/simulate-sandbox-payment.usecase";
import { processSingapayWebhookUsecase } from "../../usecase/payment/process-singapay-webhook.usecase";
import { paymentRepository } from "../../repository/payment.repository";
import { jsonResponse } from "../../presenter/json";
import { UnauthorizedError } from "../../../common/errors/app-error";
import { authPlugin } from "../../../lib/auth";

export const paymentHandler = new Elysia({ prefix: "/api/payment" })
  .use(authPlugin)
  // 1. Ambil Katalog Metode Pembayaran
  .get("/methods", async ({ set }) => {
    const manualBanks = await paymentRepository.getActiveManualBanks();
    const settings = await paymentRepository.getSettings();

    const data = {
      vaBanks: [
        { code: "BCA", name: "BCA Virtual Account", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg" },
        { code: "MANDIRI", name: "Mandiri Virtual Account", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg" },
        { code: "BRI", name: "BRI Virtual Account", logo: "https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg" },
        { code: "BNI", name: "BNI Virtual Account", logo: "https://upload.wikimedia.org/wikipedia/id/5/55/BNI_logo.svg" },
        { code: "CIMB", name: "CIMB Niaga Virtual Account", logo: "https://upload.wikimedia.org/wikipedia/commons/3/38/CIMB_Niaga_logo.svg" },
        { code: "PERMATA", name: "Permata Virtual Account", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Permata_Bank_logo.svg" },
        { code: "BSI", name: "BSI Virtual Account", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Bank_Syariah_Indonesia.svg" },
      ],
      qris: {
        code: "QRIS",
        name: "QRIS (Semua Pembayaran)",
        description: "Scan instan dengan GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, dll.",
        logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg",
      },
      ewallets: [
        { code: "GOPAY", name: "GoPay", logo: "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg" },
        { code: "OVO", name: "OVO", logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg" },
        { code: "DANA", name: "DANA", logo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg" },
        { code: "SHOPEEPAY", name: "ShopeePay", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/ShopeePay_logo.svg" },
      ],
      manualBanks,
      whatsapp: {
        number: settings.whatsapp_number || "6281234567890",
        name: settings.whatsapp_name || "Admin Support EDDY'S AI",
        message: settings.whatsapp_message || "Halo Admin, saya ingin konfirmasi pembayaran kelas.",
      },
      isSandbox: (process.env.SINGAPAY_ENVIRONMENT || "sandbox").toLowerCase() === "sandbox",
    };

    return jsonResponse({
      set,
      statusCode: 200,
      message: "Daftar metode pembayaran berhasil diambil",
      data,
    });
  })

  // 2. Buat Order Pembayaran Baru
  .post(
    "/create-order",
    async ({ body, user, set }) => {
      const activeUserId = user?.id || body.userId;
      if (!activeUserId) {
        throw new UnauthorizedError("Autentikasi diperlukan untuk membuat pesanan pembayaran.");
      }

      const data = await createPaymentOrderUsecase({
        userId: activeUserId,
        cefr: body.cefr,
        tier: body.tier as any,
        paymentCategory: body.paymentCategory as any,
        paymentChannel: body.paymentChannel,
      });

      return jsonResponse({
        set,
        statusCode: 201,
        message: "Pesanan pembayaran berhasil dibuat",
        data,
      });
    },
    {
      auth: true,
      body: t.Object({
        cefr: t.String(),
        tier: t.String(),
        paymentCategory: t.String(),
        paymentChannel: t.String(),
        userId: t.Optional(t.String()),
      }),
    }
  )

  // 3. Ambil Detail Order Pembayaran
  .get("/order/:orderId", async ({ params, set }) => {
    const data = await getPaymentOrderUsecase(params.orderId);
    return jsonResponse({
      set,
      statusCode: 200,
      message: "Detail pesanan pembayaran berhasil diambil",
      data,
    });
  })

  // 4. Upload Bukti Transfer Manual
  .post(
    "/order/:orderId/proof",
    async ({ params, body, set }) => {
      const data = await uploadTransferProofUsecase(params.orderId, body.proofUrl);
      return jsonResponse({
        set,
        statusCode: 200,
        message: data.message,
        data: data.transaction,
      });
    },
    {
      body: t.Object({
        proofUrl: t.String(),
      }),
    }
  )

  // 5. Simulasi Sukses di Mode Sandbox
  .post("/order/:orderId/simulate", async ({ params, set }) => {
    const data = await simulateSandboxPaymentUsecase(params.orderId);
    return jsonResponse({
      set,
      statusCode: 200,
      message: data.message,
      data: data.transaction,
    });
  })

  // 6. Webhook Resmi SingaPay
  .post("/webhook/singapay", async ({ headers, body, request, set }) => {
    const rawBody = typeof body === "string" ? body : JSON.stringify(body);
    const result = await processSingapayWebhookUsecase({
      rawBody,
      headers: headers as any,
      endpoint: "/api/payment/webhook/singapay",
    });

    set.status = result.statusCode;
    return {
      status: result.success ? "success" : "error",
      message: result.message,
    };
  });
