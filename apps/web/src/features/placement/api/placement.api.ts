import { apiClient } from "@/lib/api-client";

function extractErrorMessage(error: any): string {
  if (!error) return "Unknown error occurred";
  if (typeof error.value === "string") return error.value;
  if (typeof error.value === "object" && error.value) {
    return error.value.message || error.value.error || JSON.stringify(error.value);
  }
  if (error.message) return error.message;
  return String(error);
}

export const placementApi = {
  getSession: async () => {
    const { data, error } = await apiClient.api.placement.session.get();
    if (error) throw new Error(extractErrorMessage(error));
    return data?.data;
  },

  getLatestByUser: async (userId: string) => {
    const { data, error } = await apiClient.api.placement.latest({ userId }).get();
    if (error) throw new Error(extractErrorMessage(error));
    return data?.data;
  },

  submit: async (payload: any) => {
    const { data, error } = await apiClient.api.placement.submit.post(payload);
    if (error) throw new Error(extractErrorMessage(error));
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
    if (error) throw new Error(extractErrorMessage(error));
    return (data as any)?.data?.transcript || "";
  },
};
