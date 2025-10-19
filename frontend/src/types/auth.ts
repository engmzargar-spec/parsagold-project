// فایل: types/auth.ts
export interface RegisterResponse {
  user_id: number;
  phone: string;
  message: string;
}

export interface CountryOption {
  value: string;
  label: string;
  code: string;
  flag: string;
}

export interface ApiError {
  detail: string;
}