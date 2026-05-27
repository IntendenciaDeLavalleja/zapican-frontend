import axios from 'axios';
import { API_BASE_URL } from '@/config';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiClient.get<T>(path);
  return res.data;
}

export async function apiPost<T, P = unknown>(path: string, payload: P): Promise<T> {
  const res = await apiClient.post<T>(path, payload);
  return res.data;
}

export async function apiPostMultipart<T>(path: string, payload: FormData): Promise<T> {
  const res = await apiClient.post<T>(path, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
