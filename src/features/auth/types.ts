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
  name: string;
  email: string;
  password: string;
}

export interface RefreshTokenResponse {
  status: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}
