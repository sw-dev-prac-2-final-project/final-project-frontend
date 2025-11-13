export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type PaginatedResponse<T> = {
  success: true;
  count: number;
  data: T[];
};

export type ApiErrorResponse = {
  success: false;
  error?: string;
  msg?: string;
};

export type ProductDto = {
  _id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  price: number;
  stockQuantity: number;
  unit: string;
  picture: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type RequestDto = {
  _id: string;
  transactionDate: string;
  transactionType: "stockIn" | "stockOut";
  itemAmount: number;
  user: string | { _id: string; name: string; email: string; role?: string };
  product_id:
    | string
    | {
        _id: string;
        name: string;
        sku: string;
        category?: string;
        stockQuantity?: number;
      };
  createdAt?: string;
  updatedAt?: string;
};

export type UserProfile = {
  _id: string;
  name: string;
  email: string;
  tel: string;
  role: "admin" | "staff";
  createdAt?: string;
};

export type UserDirectoryEntry = {
  id: string;
  name: string;
  email: string;
  tel?: string;
  role: "admin" | "staff";
  createdAt?: string;
  requestSummary?: {
    totalRequests: number;
    stockIn: number;
    stockOut: number;
  };
};

export type UserDirectoryResponse = {
  success: true;
  count: number;
  roleFilter: string;
  roleSummary: Record<string, number>;
  requestSummary: {
    totalRequests: number;
    stockIn: number;
    stockOut: number;
  };
  data: UserDirectoryEntry[];
};
