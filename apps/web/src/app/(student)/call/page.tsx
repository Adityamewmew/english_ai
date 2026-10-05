import React from "react";
import { getSession } from "@/lib/session";
import { VoiceCallView } from "@/features/voice";

export default async function VoiceCallPage() {
  const session = await getSession();
  const studentName = session?.name ? session.name.split(" ")[0] : "";

  return (
    <VoiceCallView
      userId={session?.userId}
      studentName={studentName}
    />
  );
}
