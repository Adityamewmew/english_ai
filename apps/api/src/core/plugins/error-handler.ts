import { Elysia } from "elysia";
import { AppError } from "../errors/app-error";

export const errorHandler = new Elysia({ name: "core-error-handler" })
  .error({ AppError })
  .onError({ as: "global" }, ({ error, code, set }) => {
    if (error instanceof AppError) {
      set.status = error.status;
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: "details" in error ? (error as any).details : undefined,
        },
      };
    }

    if (code === "VALIDATION") {
      set.status = 422;
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Data input tidak valid",
          details: error.message,
        },
      };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Route tidak ditemukan",
        },
      };
    }

    console.error("[Unhandled Server Error]:", error);
    set.status = 500;
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message:
          process.env.NODE_ENV === "production"
            ? "Terjadi kesalahan pada server"
            : error.message || "Internal server error",
      },
    };
  });
