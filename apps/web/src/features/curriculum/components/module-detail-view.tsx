"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { ModuleVoiceDock } from "@/components/modules";
import { useModuleTutor } from "@/hooks/use-module-tutor";
import { getModuleDetailAction } from "@/app/(student)/modules/modules.actions";
import { ModuleStudyView } from "./module-study-view";

interface ModuleDetailViewProps {
  moduleId: string;
}

export function ModuleDetailView({ moduleId }: ModuleDetailViewProps) {
  const [loading, setLoading] = useState(true);
  const [moduleData, setModuleData] = useState<any>(null);
  const [subModules, setSubModules] = useState<any[]>([]);
  const [studentName, setStudentName] = useState("");
  const [userId, setUserId] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  const tutor = useModuleTutor({
    moduleId,
    studentName,
    userId,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      let res: any = null;
      try {
        res = await getModuleDetailAction(moduleId);
      } catch (e) {
        console.warn("getModuleDetailAction error:", e);
      }

      // If Server Action failed or returned undefined (e.g. dev reload / action ID mismatch), fallback to direct API
      if (!res?.success) {
        try {
          const directRes = await fetch(`/api/curriculum/modules/${moduleId}`);
          if (directRes.ok) {
            const json = await directRes.json();
            if (json?.success && json?.data) {
              res = {
                success: true,
                data: json.data,
                user: undefined,
              };
            }
          }
        } catch (fetchErr) {
          console.warn("Direct module fetch fallback error:", fetchErr);
        }
      }

      if (res?.success && res.data) {
        setModuleData(res.data.module);
        setSubModules(res.data.subModules || []);
        if (res.user) {
          setUserId(res.user.id);
          setStudentName(res.user.name);
          setCurrentUser(res.user);
        }
      }
    } catch (err) {
      console.error("Gagal memuat detail modul:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (moduleId) {
      loadData();
    }
  }, [moduleId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-[#0D3B66] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Preparing module workspace...</p>
        </div>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <BookOpen className="w-10 h-10 text-slate-400 mb-2" />
        <h2 className="text-base font-bold text-slate-800 dark:text-white mb-2">
          Module Not Found
        </h2>
        <Link
          href="/modules"
          className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
        >
          Back to Modules
        </Link>
      </div>
    );
  }

  return (
    <>
      <ModuleStudyView
        moduleId={moduleId}
        moduleData={moduleData}
        subModules={subModules}
        userId={userId}
        studentName={studentName}
        currentUser={currentUser}
        tutor={tutor}
        onRefresh={loadData}
      />
      {(tutor.isCalling || tutor.isChatOpen) && (
        <ModuleVoiceDock
          moduleTitle={moduleData.title}
          isCalling={tutor.isCalling}
          isSpeaking={tutor.isSpeaking}
          isListening={tutor.isListening}
          isThinking={tutor.isThinking}
          isChatOpen={tutor.isChatOpen}
          messages={tutor.tutorMessages}
          inputText={tutor.inputText}
          onInputChange={tutor.setInputText}
          onSendMessage={() => tutor.handleSendTutorMessage()}
          onToggleCall={tutor.handleToggleCall}
          onToggleMic={tutor.handleToggleMic}
          onToggleChat={tutor.handleToggleChat}
          onPlayAudio={tutor.playTutorAudio}
        />
      )}
    </>
  );
}
