import { Response } from "express";

export interface ApiSuccess<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiPaginated<T = unknown> {
  success: true;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, { msg: string; [key: string]: any }>;
}

export const ok = <T>(res: Response, data: T, message = "Success") =>
  res.status(200).json({ success: true, message, data } satisfies ApiSuccess<T>);

export const created = <T>(res: Response, data: T, message = "Created") =>
  res.status(201).json({ success: true, message, data } satisfies ApiSuccess<T>);

export const paginated = <T>(
  res: Response,
  data: T[],
  meta: { page: number; limit: number; total: number },
  message = "Success",
) =>
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: meta.page,
      limit: meta.limit,
      total: meta.total,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  } satisfies ApiPaginated<T>);
