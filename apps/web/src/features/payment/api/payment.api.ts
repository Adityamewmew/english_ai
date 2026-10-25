import { apiClient } from "@/lib/api-client";

export interface PaymentBankOption {
  code: string;
  name: string;
  logo?: string | null;
}

export interface PaymentManualBank {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankLogo?: string | null;
  instructions?: string | null;
}

export interface PaymentMethodsData {
  vaBanks: PaymentBankOption[];
  qris: {
    code: string;
    name: string;
    description: string;
    logo: string;
  };
  ewallets: PaymentBankOption[];
  manualBanks: PaymentManualBank[];
  whatsapp: {
    number: string;
    name: string;
    message: string;
  };
  isSandbox: boolean;
}

export type PaymentMethods = PaymentMethodsData;

export interface PaymentOrderDetail {
  id: string;
  orderId: string;
  userId: string;
  cefr: string;
  tier: "basic" | "pro" | "ultra";
  className: string;
  paymentCategory: "va" | "qris" | "ewallet" | "manual_transfer";
  paymentChannel: string;
  amount: number;
  status: "pending" | "waiting_approval" | "paid" | "rejected" | "expired";
  vaNumber?: string | null;
  qrData?: string | null;
  qrImageUrl?: string | null;
  transferProofUrl?: string | null;
  rejectionReason?: string | null;
  expiresAt: string;
  remainingSeconds: number;
  isExpired: boolean;
  singapayPayload?: any;
  guides?: Array<{
    channel: string;
    steps: string[];
  }>;
  whatsappSupport?: {
    number: string;
    message: string;
  };
}

export const paymentApi = {
  getMethods: async (): Promise<PaymentMethodsData> => {
    const res = await (apiClient.api.payment as any).methods.get();
    if (res.error) throw new Error(String(res.error.value));
    return res.data?.data as PaymentMethodsData;
  },

  createOrder: async (payload: {
    cefr: string;
    tier: string;
    paymentCategory: string;
    paymentChannel: string;
    userId?: string;
  }) => {
    const res = await (apiClient.api.payment as any)["create-order"].post(payload);
    if (res.error) throw new Error(String(res.error.value));
    return res.data?.data as { orderId: string; redirectUrl: string };
  },

  getOrder: async (orderId: string): Promise<PaymentOrderDetail> => {
    const res = await (apiClient.api.payment as any).order({ orderId }).get();
    if (res.error) throw new Error(String(res.error.value));
    return res.data?.data as PaymentOrderDetail;
  },

  uploadProof: async (orderId: string, proofUrl: string) => {
    const res = await (apiClient.api.payment as any).order({ orderId }).proof.post({
      proofUrl,
    });
    if (res.error) throw new Error(String(res.error.value));
    return res.data;
  },

  simulateSandbox: async (orderId: string) => {
    const res = await (apiClient.api.payment as any).order({ orderId }).simulate.post();
    if (res.error) throw new Error(String(res.error.value));
    return res.data;
  },
};
