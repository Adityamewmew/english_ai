import { Elysia } from "elysia";
import { AppError } from "./app-error";
import { jsonError } from "../../internal/presenter/json";

export const errorHandlerPlugin = new Elysia({ name: "error-handler" }).onError(
  { as: "global" },
  ({ code, error, set }) => {
    // 1. Custom AppError instances
    if (error instanceof AppError) {
      return jsonError({
        set,
        statusCode: error.statusCode,
        message: error.message,
        error: error.details,
      });
    }

    // 2. TypeBox Validation Errors
    if (code === "VALIDATION") {
      const details = (error as any).all
        ? (error as any).all.map((err: any) => ({
            path: err.path,
            message: err.schema?.error || err.summary || err.message,
          }))
        : (error as any).customError || error.message;

      return jsonError({
        set,
        statusCode: 422,
        message: "Validation failed",
        error: details,
      });
    }

    // 3. Not Found Errors
    if (code === "NOT_FOUND") {
      return jsonError({
        set,
        statusCode: 404,
        message: "Endpoint route not found",
      });
    }

    // 4. Default Internal Server Error
    console.error("[Server Error]:", error);
    return jsonError({
      set,
      statusCode: 500,
      message: "Internal server error occurred",
      error: (error as any)?.message ?? String(error),
    });
  }
);
