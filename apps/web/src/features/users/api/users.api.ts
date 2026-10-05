import { apiClient } from "@/lib/api-client";

export const usersApi = {
  list: async (params?: { keywords?: string; role?: string; page?: number; perPage?: number }) => {
    const { data, error } = await apiClient.api.user.get({
      query: {
        keywords: params?.keywords,
        role: params?.role,
        page: params?.page ? String(params.page) : undefined,
        perPage: params?.perPage ? String(params.perPage) : undefined,
      },
    });
    if (error) throw new Error(String(error.value));
    return data?.data;
  },

  getProfile: async (id: string) => {
    const { data, error } = await apiClient.api.user({ id }).get();
    if (error) throw new Error(String(error.value));
    return data?.data;
  },

  updateProfile: async (id: string, payload: any, updaterId?: string) => {
    const { data, error } = await apiClient.api.user({ id }).put(payload, {
      headers: updaterId ? { "x-user-id": updaterId } : undefined,
    });
    if (error) throw new Error(String(error.value));
    return data?.data;
  },

  deleteUser: async (id: string, deleterId?: string) => {
    const { data, error } = await apiClient.api.user({ id }).delete(undefined, {
      headers: deleterId ? { "x-user-id": deleterId } : undefined,
    });
    if (error) throw new Error(String(error.value));
    return data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const { data, error } = await apiClient.api.user.login.post(credentials);
    if (error) throw new Error(String(error.value));
    return data?.data;
  },

  register: async (payload: { name: string; email: string; password: string; role?: string; currentCefr?: string }) => {
    const { data, error } = await apiClient.api.user.register.post(payload);
    if (error) throw new Error(String(error.value));
    return data?.data;
  },
};
