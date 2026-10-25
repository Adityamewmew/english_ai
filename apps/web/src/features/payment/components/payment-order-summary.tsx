"use client";

import React from "react";
import { Check, RefreshCw, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaymentOrderDetail } from "../api/payment.api";

interface PaymentOrderSummaryProps {
  order: PaymentOrderDetail;
  isRefetching: boolean;
  onRefetch: () => void;
  formatRupiah: (num: number) => string;
}

export function PaymentOrderSummary({
  order,
  isRefetching,
  onRefetch,
  formatRupiah,
}: PaymentOrderSummaryProps) {
  return (
    <div className="space-y-4">
      {/* Rincian Paket Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F4F6FF] via-[#EEF2FF] to-[#F4F6FF] border border-[#D5E0FA] space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-black tracking-wider text-[#10375C] font-mono">
            Rincian Pembelian
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
            <Check className="w-3 h-3" /> Akses Selamanya
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-[#10375C] text-white font-mono text-[10px] font-bold">
              {order.cefr}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 uppercase">
              Paket {order.tier}
            </span>
          </div>
          <h4 className="text-sm font-extrabold text-slate-900 font-heading leading-snug">
            {order.className}
          </h4>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span>Harga Paket:</span>
            <span className="font-extrabold text-slate-900">{formatRupiah(order.amount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Biaya Transaksi:</span>
            <span className="text-emerald-600 font-bold">Gratis (Rp 0)</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-sm font-extrabold text-[#10375C]">
            <span>Total Tagihan:</span>
            <span>{formatRupiah(order.amount)}</span>
          </div>
        </div>
      </div>

      {/* Tombol Aksi: Cek Status Pembayaran */}
      <Button
        type="button"
        onClick={onRefetch}
        disabled={isRefetching}
        className="w-full h-12 rounded-xl text-xs font-extrabold bg-[#10375C] hover:bg-[#0D2D4B] text-white btn-skeuo-navy flex items-center justify-center gap-2 shadow-sm"
      >
        <RefreshCw
          className={`w-4 h-4 ${isRefetching ? "animate-spin text-white" : ""}`}
        />
        {isRefetching ? "Memeriksa Status..." : "Cek Status Pembayaran"}
      </Button>

      {/* Hubungi WhatsApp Bantuan */}
      {order.whatsappSupport && (
        <a
          href={`https://wa.me/${order.whatsappSupport.number}?text=${order.whatsappSupport.message}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition shadow-2xs text-center"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Butuh bantuan? Hubungi Admin WhatsApp</span>
        </a>
      )}

      <div className="text-center pt-1">
        <p className="text-[11px] text-slate-400">
          Sistem mendeteksi transfer secara otomatis 24 jam. Jika sudah transfer, klik tombol "Cek Status Pembayaran" di atas.
        </p>
      </div>
    </div>
  );
}
