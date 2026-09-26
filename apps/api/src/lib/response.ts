import { Messages } from "./constants/messages";

export type ServiceResult<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; message: string; code: number; data?: null };

export type StandardResponse<T = any> = ServiceResult<T>;

export const Response = {
  buildSuccess<T>(data: T, message?: string): ServiceResult<T> {
    return { success: true, data, message };
  },
  buildSuccessCreated<T>(data: T, message: string = Messages.SUCCESS_CREATED): ServiceResult<T> {
    return { success: true, data, message };
  },
  buildError(code: number, message: string = Messages.DEFAULT_ERROR): ServiceResult<never> {
    return { success: false, message, code };
  },
  buildErrorService(message: string = Messages.DEFAULT_ERROR): ServiceResult<never> {
    return { success: false, message, code: Messages.HTTP_INTERNAL_ERROR };
  },
  buildErrorNotFound(message: string = Messages.DEFAULT_ERROR): ServiceResult<never> {
    return { success: false, message, code: Messages.HTTP_NOT_FOUND };
  },
  buildErrorBadRequest(message: string = Messages.DEFAULT_ERROR): ServiceResult<never> {
    return { success: false, message, code: Messages.HTTP_BAD_REQUEST };
  },
};

export const ResponseHelper = Response;
