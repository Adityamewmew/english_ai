import { apiClient } from "@/lib/api-client";

function extractErrorMessage(errValue: unknown, fallback: string): string {
  if (!errValue) return fallback;
  if (typeof errValue === "string") return errValue;
  if (typeof errValue === "object") {
    const val = errValue as any;
    if (val?.error?.message) return String(val.error.message);
    if (val?.message) return String(val.message);
    if (val?.error && typeof val.error === "string") return val.error;
  }
  return fallback;
}

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const { data, error } = await apiClient.api.user.login.post(credentials);
    if (error) {
      throw new Error(extractErrorMessage(error.value, "Email atau password salah"));
    }
    return data?.data;
  },

  register: async (payload: { name: string; email: string; password: string }) => {
    const { data, error } = await apiClient.api.user.register.post(payload);
    if (error) {
      throw new Error(extractErrorMessage(error.value, "Gagal mendaftar"));
    }
    return data?.data;
  },
};
