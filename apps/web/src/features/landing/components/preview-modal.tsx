"use client";

import React from "react";
import { ShieldCheck, X } from "lucide-react";

interface PreviewModalProps {
  isOpen: boolean;
  title: string;
  bodyText: string;
  onClose: () => void;
}

export function PreviewModal({
  isOpen,
  title,
  bodyText,
  onClose,
}: PreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-primary/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50 transition-all"
    >
      <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#E5E9F5] shadow-2xl transform transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="badge-skeuo-gold px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
            <span>EDDY&apos;S AI Official Info</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface text-primary font-bold hover:bg-primary hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <h4 className="font-heading font-bold text-lg text-primary mb-2">
          {title}
        </h4>
        <p className="text-sm text-primary/75 leading-relaxed mb-5">
          {bodyText}
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-skeuo-primary px-5 py-2.5 font-heading font-semibold text-xs sm:text-sm cursor-pointer"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}

