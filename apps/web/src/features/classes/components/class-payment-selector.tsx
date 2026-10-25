"use client";

import React from "react";
import { Check, ShieldCheck, MessageCircle } from "lucide-react";
import { BankLogo } from "@/features/payment";
import type { PaymentMethods, PaymentBankOption, PaymentManualBank } from "@/features/payment";

export type PaymentTab = "va" | "qris" | "ewallet" | "manual_transfer" | "whatsapp";

interface ClassPaymentSelectorProps {
  activeTab: PaymentTab;
  selectedChannel: string;
  onSelectTab: (tab: PaymentTab) => void;
  onSelectChannel: (channel: string) => void;
  paymentMethods?: PaymentMethods;
}

const TABS: { id: PaymentTab; label: string }[] = [
  { id: "va", label: "Virtual Account" },
  { id: "qris", label: "QRIS" },
  { id: "ewallet", label: "E-Wallet" },
  { id: "manual_transfer", label: "TF Manual" },
  { id: "whatsapp", label: "Hubungi Admin" },
];

const DEFAULT_VA_BANKS = [
  { code: "BCA", name: "BCA Virtual Account" },
  { code: "MANDIRI", name: "Mandiri Virtual Account" },
  { code: "BRI", name: "BRI Virtual Account" },
  { code: "BNI", name: "BNI Virtual Account" },
  { code: "CIMB", name: "CIMB Niaga Virtual Account" },
  { code: "PERMATA", name: "Permata Virtual Account" },
  { code: "BSI", name: "BSI Virtual Account" },
];

const WALLETS = [
  { code: "GOPAY", name: "GoPay" },
  { code: "OVO", name: "OVO" },
  { code: "DANA", name: "DANA" },
  { code: "SHOPEEPAY", name: "ShopeePay" },
];

export function ClassPaymentSelector({
  activeTab,
  selectedChannel,
  onSelectTab,
  onSelectChannel,
  paymentMethods,
}: ClassPaymentSelectorProps) {
  const handleTabClick = (tabId: PaymentTab) => {
    onSelectTab(tabId);
    if (tabId === "va") onSelectChannel("BCA");
    else if (tabId === "qris") onSelectChannel("QRIS");
    else if (tabId === "ewallet") onSelectChannel("GOPAY");
    else if (tabId === "manual_transfer") {
      const firstBank = paymentMethods?.manualBanks?.[0];
      onSelectChannel(firstBank ? `manual_${firstBank.id}` : "manual_1");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 font-heading">Pilih Metode Pembayaran</h4>
          <p className="text-xs text-slate-500">
            Pilih kanal pembayaran langsung (Virtual Account, QRIS, atau Transfer).
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Aman &amp; Terenkripsi</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 rounded-2xl bg-slate-100 gap-1 overflow-x-auto text-xs font-bold scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={`py-2 px-3 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-[#0D3B66] shadow-2xs font-extrabold"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Virtual Account */}
      {activeTab === "va" && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            Pilih bank tujuan untuk mendapatkan nomor Virtual Account otomatis:
          </p>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {(paymentMethods?.vaBanks || DEFAULT_VA_BANKS).map((bank: PaymentBankOption) => {
              const isSelected = selectedChannel === bank.code;
              return (
                <div
                  key={bank.code}
                  onClick={() => onSelectChannel(bank.code)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? "border-[#0D3B66] bg-[#0D3B66]/5 shadow-xs ring-1 ring-[#0D3B66]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BankLogo code={bank.code} size="sm" className="shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{bank.name}</h5>
                      <p className="text-[11px] text-slate-500">Verifikasi instan otomatis 24 jam</p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                      isSelected
                        ? "bg-[#0D3B66] border-[#0D3B66] text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. QRIS */}
      {activeTab === "qris" && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            Pembayaran cepat menggunakan scan barcode QRIS standar Bank Indonesia:
          </p>
          <div
            onClick={() => onSelectChannel("QRIS")}
            className="flex items-center justify-between p-3.5 rounded-2xl border border-[#0D3B66] bg-[#0D3B66]/5 shadow-xs ring-1 ring-[#0D3B66] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <BankLogo code="QRIS" size="sm" className="shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-slate-900">QRIS (Semua Pembayaran)</h5>
                <p className="text-[11px] text-slate-500">
                  Scan dengan GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, dll.
                </p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full bg-[#0D3B66] text-white flex items-center justify-center">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
        </div>
      )}

      {/* 3. E-Wallet */}
      {activeTab === "ewallet" && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">Pilih dompet digital yang Anda gunakan:</p>
          <div className="grid grid-cols-2 gap-2">
            {WALLETS.map((wallet) => {
              const isSelected = selectedChannel === wallet.code;
              return (
                <div
                  key={wallet.code}
                  onClick={() => onSelectChannel(wallet.code)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? "border-[#0D3B66] bg-[#0D3B66]/5 shadow-xs ring-1 ring-[#0D3B66]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BankLogo code={wallet.code} size="sm" className="shrink-0" />
                    <span className="text-xs font-bold text-slate-900">{wallet.name}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                      isSelected
                        ? "bg-[#0D3B66] border-[#0D3B66] text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Transfer Manual */}
      {activeTab === "manual_transfer" && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            Transfer ke rekening resmi kami, lalu unggah bukti transfer untuk diverifikasi admin:
          </p>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {paymentMethods?.manualBanks && paymentMethods.manualBanks.length > 0 ? (
              paymentMethods.manualBanks.map((bank: PaymentManualBank) => {
                const channelKey = `manual_${bank.id}`;
                const isSelected = selectedChannel === channelKey;
                return (
                  <div
                    key={bank.id}
                    onClick={() => onSelectChannel(channelKey)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? "border-[#0D3B66] bg-[#0D3B66]/5 shadow-xs ring-1 ring-[#0D3B66]"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BankLogo code={bank.bankName} size="sm" className="shrink-0" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">
                          {bank.bankName} - {bank.accountNumber}
                        </h5>
                        <p className="text-[11px] text-slate-500">a.n. {bank.accountName}</p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        isSelected
                          ? "bg-[#0D3B66] border-[#0D3B66] text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-xs text-slate-500 border rounded-xl bg-slate-50">
                Rekening bank manual BCA (8920192831 a.n. KHOIRUL ANWAR)
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. WhatsApp Admin */}
      {activeTab === "whatsapp" && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Bantuan Pembayaran via WhatsApp</span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Tim admin kami siap membantu Anda melakukan pembayaran, aktivasi kelas khusus, atau transfer antar-bank dengan mudah.
          </p>
          <div className="text-xs text-emerald-900 font-medium">
            Admin CS: <strong>{paymentMethods?.whatsapp?.name || "Admin Support EDDY'S AI"}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
