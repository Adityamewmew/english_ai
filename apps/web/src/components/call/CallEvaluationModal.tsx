"use client";

import React from "react";
import { PhoneOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCallDuration } from "@/lib/call-utils";

interface CallEvaluationModalProps {
  duration: number;
  onNewCall: () => void;
}

export function CallEvaluationModal({
  duration,
  onNewCall,
}: CallEvaluationModalProps) {
  return (
    <div className="w-full max-w-sm bg-zinc-950/95 border border-zinc-800/90 rounded-3xl p-6 space-y-6 text-center shadow-2xl animate-fadeIn backdrop-blur-md">
      <div className="space-y-3 py-2">
        <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
          <PhoneOff className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Panggilan Berakhir</h3>
        <p className="text-xs text-zinc-400">
          Durasi Percakapan: <span className="text-white font-semibold">{formatCallDuration(duration)}</span>
        </p>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          onClick={onNewCall}
          className="flex-1 bg-white hover:bg-zinc-200 text-black font-bold text-xs py-3 rounded-2xl shadow-lg"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Panggilan Baru
        </Button>
        <Link href="/dashboard" className="flex-1">
          <Button
            variant="outline"
            className="w-full text-xs py-3 text-zinc-300 border-zinc-800 hover:bg-zinc-900 rounded-2xl"
          >
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
