import api from './index';

export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  bio: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email?: string;
}

export const register = (data: RegisterData) => {
  return api.post('/register/', data);
};

export const login = (data: LoginData) => {
  return api.post('/login/', data);
};

export const getCurrentUser = () => {
  return api.get('/user/');
};

export const updateUser = (data: Partial<User>) => {
  return api.put('/user/', data);
};