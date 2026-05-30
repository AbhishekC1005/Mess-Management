import api from './axios';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  messName: string;
  location: string;
  address: string;
  registrationPasscode: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  id: string;
  username: string;
  email: string;
  roles: string[];
  messId?: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<JwtResponse>('/auth/login', data),
  
  register: (data: RegisterRequest) =>
    api.post<JwtResponse>('/auth/register', data),
};
