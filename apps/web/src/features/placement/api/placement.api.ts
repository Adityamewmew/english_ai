import { apiClient } from "@/lib/api-client";

export const placementApi = {
  getSession: async () => {
    const { data, error } = await apiClient.api.placement.session.get();
    if (error) throw new Error(String(error.value));
    return data?.data;
  },

  getLatestByUser: async (userId: string) => {
    const { data, error } = await apiClient.api.placement.latest({ userId }).get();
    if (error) throw new Error(String(error.value));
    return data?.data;
  },

  submit: async (payload: any) => {
    const { data, error } = await apiClient.api.placement.submit.post(payload);
    if (error) throw new Error(String(error.value));
    return data?.data;
  },

  transcribeSpeaking: async (blob: Blob, mimeType: string = "audio/webm"): Promise<string> => {
    const base64Audio = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl.split(",")[1] || "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const { data, error } = await apiClient.api.placement["transcribe-speaking"].post({
      audioBase64: base64Audio,
      mimeType,
    });
    if (error) throw new Error(String(error.value));
    return (data as any)?.data?.transcript || "";
  },
};
