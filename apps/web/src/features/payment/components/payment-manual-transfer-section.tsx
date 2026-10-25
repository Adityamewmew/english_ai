"use client";

import React, { useState } from "react";
import { Copy, FileCheck, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BankLogo } from "./bank-logo";
import { useUploadProof } from "../hooks/use-payment";
import type { PaymentOrderDetail } from "../api/payment.api";

interface PaymentManualTransferSectionProps {
  order: PaymentOrderDetail;
  orderId: string;
  onCopyText: (text: string) => void;
  isWaitingApproval: boolean;
  compressImage: (file: File) => Promise<string>;
}

export function PaymentManualTransferSection({
  order,
  orderId,
  onCopyText,
  isWaitingApproval,
  compressImage,
}: PaymentManualTransferSectionProps) {
  const uploadProofMutation = useUploadProof();
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) return;
    setIsCompressing(true);
    try {
      const base64 = await compressImage(proofFile);
      await uploadProofMutation.mutateAsync({
        orderId,
        proofUrl: base64,
      });
      setProofSubmitted(true);
      setProofFile(null);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Rekening Tujuan Box */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Rekening Tujuan</span>
          <div className="flex items-center gap-2">
            <BankLogo
              code={order.singapayPayload?.manual_bank?.bankName || "BCA"}
              size="sm"
            />
            <span className="text-xs font-bold text-slate-800">
              {order.singapayPayload?.manual_bank?.bankName || "Bank BCA"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600">Nomor Rekening:</span>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-slate-900 font-mono">
              {order.singapayPayload?.manual_bank?.accountNumber || "8920192831"}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                onCopyText(order.singapayPayload?.manual_bank?.accountNumber || "8920192831")
              }
              className="h-7 w-7 text-slate-600 hover:text-slate-900"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600">Atas Nama:</span>
          <span className="text-xs font-bold text-slate-800">
            {order.singapayPayload?.manual_bank?.accountName || "KHOIRUL ANWAR"}
          </span>
        </div>
      </div>

      {/* Form Upload Bukti Transfer */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
          <FileCheck className="w-4 h-4 text-[#10375C]" />
          <span>Unggah Bukti Transfer</span>
        </div>

        {(order.transferProofUrl || proofPreview) && (
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-col items-center gap-2">
            <img
              src={proofPreview || order.transferProofUrl || ""}
              alt="Bukti Transfer"
              className="max-h-48 w-auto rounded-lg object-contain shadow-2xs border border-slate-100"
            />
            {proofFile && (
              <span className="text-[10px] text-slate-500 font-medium">
                {proofFile.name} ({(proofFile.size / 1024).toFixed(0)} KB)
              </span>
            )}
          </div>
        )}

        <form onSubmit={handleSubmitProof} className="space-y-2.5">
          <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-[#10375C]/30 rounded-xl bg-white hover:bg-[#10375C]/5 transition cursor-pointer text-center group">
            <Upload className="w-5 h-5 text-[#10375C] group-hover:scale-110 transition-transform mb-1" />
            <span className="text-xs font-bold text-[#10375C]">
              {proofFile ? "Ganti Gambar Bukti" : "Pilih Foto Bukti Transfer"}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Format JPG, PNG, atau WebP
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {proofFile && (
            <Button
              type="submit"
              disabled={uploadProofMutation.isPending || isCompressing}
              className="btn-skeuo-navy bg-[#10375C] hover:bg-[#0D2D4B] text-white w-full h-10 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploadProofMutation.isPending || isCompressing
                ? "Mengirim Bukti..."
                : "Kirim Bukti Pembayaran"}
            </Button>
          )}
        </form>

        {(isWaitingApproval || order.transferProofUrl || proofSubmitted) && (
          <p className="text-[11px] text-amber-800 flex items-center gap-1.5 font-medium bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            Bukti transfer tersimpan. Menunggu verifikasi admin untuk aktivasi kelas.
          </p>
        )}
      </div>
    </div>
  );
}
