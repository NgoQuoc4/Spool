/** Shape cho mọi response thành công có data */
export interface ApiSuccess<T = unknown> {
  success: true;
  message: string;
  data: T;
}

/** Shape cho response có phân trang */
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

/** Shape cho mọi response lỗi */
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, { msg: string; [key: string]: any }>;
}
