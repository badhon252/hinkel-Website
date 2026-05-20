// auth types
export interface User {
  _id: string;
  email: string;
  role: string;
  profileImage: string;
  refreshToken: string;
  updatedAt: string;
}

export interface LoginData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  data: LoginData;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface VerifyCodeFormData {
  email: string;
  otp: string;
}

export interface RegisterFormData {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface VerificationMeta {
  email: string;
  maskedEmail: string;
  expiresInMinutes: number;
  resendCooldownSeconds: number;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface LoginVerificationRequiredData extends VerificationMeta {
  verificationRequired: true;
}

export interface RefreshTokenResponse {
  status: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}
