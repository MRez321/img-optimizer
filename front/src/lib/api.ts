import axios from 'axios';
import type { ProcessOptions, User } from '../types';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // required to send/receive httpOnly auth cookies
});

// ---------- Image optimization ----------

export interface StartSessionResponse {
  sessionId: string;
  folderName: string;
  expectedFiles: number;
}

export const startSession = async (
  options: Partial<ProcessOptions> & { totalFiles: number }
): Promise<StartSessionResponse> => {
  const { data } = await api.post('/api/start', options);
  return data;
};

export const uploadFile = async (sessionId: string, file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('sessionId', sessionId);
  const { data } = await api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const requestZip = async (sessionId: string) => {
  const { data } = await api.get(`/api/zip/${sessionId}`);
  return data;
};

export const getSessionStatus = async (sessionId: string) => {
  const { data } = await api.get(`/api/status/${sessionId}`);
  return data;
};

// ---------- Auth ----------

export const register = async (email: string, password: string, name?: string): Promise<{ user: User }> => {
  const { data } = await api.post('/api/auth/register', { email, password, name });
  return data;
};

export const login = async (email: string, password: string): Promise<{ user: User }> => {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data;
};

export const googleLogin = async (idToken: string): Promise<{ user: User }> => {
  const { data } = await api.post('/api/auth/google', { idToken });
  return data;
};

export const logout = async (): Promise<void> => {
  await api.post('/api/auth/logout');
};

export const fetchMe = async (): Promise<{ user: User }> => {
  const { data } = await api.get('/api/auth/me');
  return data;
};

export const updateProfile = async (fields: { name?: string; avatarUrl?: string }): Promise<{ user: User }> => {
  const { data } = await api.patch('/api/auth/profile', fields);
  return data;
};

export const requestEmailVerification = async (): Promise<{ message: string }> => {
  const { data } = await api.post('/api/auth/verify-email/request');
  return data;
};

export const confirmEmailVerification = async (code: string): Promise<{ message: string }> => {
  const { data } = await api.post('/api/auth/verify-email/confirm', { code });
  return data;
};
