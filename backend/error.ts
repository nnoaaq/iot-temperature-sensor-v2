import { ZodError } from "zod";

export class CustomError extends Error {
  constructor(
    public statusCode: number,
    message: Record<string, unknown> = {},
  ) {
    super(JSON.stringify(message));
  }
}
const headers = {
  "Content-Type": "application/json",
};
export const handleError = (error: any) => {
  console.log("error:", error);
  if (error instanceof ZodError) {
    return {
      headers,
      statusCode: 400,
      body: error.message,
    };
  }
  return {
    headers,
    statusCode: error.statusCode,
    body: error.message,
  };
};
