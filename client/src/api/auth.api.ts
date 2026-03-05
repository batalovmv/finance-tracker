import {
  type ApiSuccessResponse,
  type AuthResponse,
  type LoginInput,
  type RegisterInput,
  type TokenResponse,
  type UserResponse,
} from '@shared/types';

import { api } from '@/lib/axios';

export function register(data: RegisterInput) {
  return api.post<ApiSuccessResponse<AuthResponse>>('/auth/register', data);
}

export function login(data: LoginInput) {
  return api.post<ApiSuccessResponse<AuthResponse>>('/auth/login', data);
}

export function refresh() {
  return api.post<ApiSuccessResponse<TokenResponse>>('/auth/refresh');
}

export function logout() {
  return api.post('/auth/logout');
}

export function getMe() {
  return api.get<ApiSuccessResponse<UserResponse>>('/auth/me');
}
