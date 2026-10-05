import { apiClient } from "@/lib/api-client";

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const { data, error } = await apiClient.api.user.login.post(credentials);
    if (error) throw new Error(String(error.value));
    return data?.data;
  },

  register: async (payload: { name: string; email: string; password: string }) => {
    const { data, error } = await apiClient.api.user.register.post(payload);
    if (error) throw new Error(String(error.value));
    return data?.data;
  },
};
