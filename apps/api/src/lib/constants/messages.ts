export const Messages = {
  HTTP_SUCCESS: 200,
  HTTP_CREATED: 201,
  HTTP_BAD_REQUEST: 400,
  HTTP_UNAUTHORIZED: 401,
  HTTP_FORBIDDEN: 403,
  HTTP_NOT_FOUND: 404,
  HTTP_INTERNAL_ERROR: 500,

  SUCCESS_CREATED: "Data berhasil disimpan",
  SUCCESS_UPDATED: "Data berhasil diperbarui",
  SUCCESS_DELETED: "Data berhasil dihapus",
  DEFAULT_ERROR: "Terjadi kesalahan, silakan coba lagi",
} as const;
