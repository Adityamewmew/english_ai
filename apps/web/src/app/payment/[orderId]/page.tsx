import React from "react";
import { PaymentConfirmationView } from "@/features/payment/components/payment-confirmation-view";

interface PaymentPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { orderId } = await params;
  return <PaymentConfirmationView orderId={orderId} />;
}
