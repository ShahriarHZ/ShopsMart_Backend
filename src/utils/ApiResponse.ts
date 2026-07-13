import { Response } from 'express';

interface ApiResponsePayload<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export class ApiResponse {
  static send<T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T,
    meta?: Record<string, unknown>
  ): Response {
    const payload: ApiResponsePayload<T> = {
      success: statusCode < 400,
      message,
      ...(data !== undefined ? { data } : {}),
      ...(meta !== undefined ? { meta } : {}),
    };
    return res.status(statusCode).json(payload);
  }

  static ok<T>(res: Response, message: string, data?: T, meta?: Record<string, unknown>): Response {
    return this.send(res, 200, message, data, meta);
  }

  static created<T>(res: Response, message: string, data?: T): Response {
    return this.send(res, 201, message, data);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
