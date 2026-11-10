import axios, { type InternalAxiosRequestConfig } from "axios";
import { apiConfig } from "../config/api";
import { dataConsultation } from "./dataConsultation";

declare module "axios" {
  interface AxiosRequestConfig {
    background?: boolean;
  }
}

export const http = axios.create({ ...apiConfig, withCredentials: true });
const consultations = new WeakMap<InternalAxiosRequestConfig, () => void>();
http.interceptors.request.use(config => {
  if ((config.method ?? "get").toLowerCase() === "get" && !config.background && !config.signal?.aborted) {
    consultations.set(config, dataConsultation.start());
  }
  return config;
});
function finish(config?: InternalAxiosRequestConfig) {
  if (!config) return;
  consultations.get(config)?.();
  consultations.delete(config);
}
http.interceptors.response.use(response => {
  finish(response.config);
  return response;
}, (error: unknown) => {
  if (axios.isAxiosError(error)) finish(error.config);
  if (axios.isAxiosError(error) && error.response?.status === 401 && !/\/auth\/(login|register)(?:$|\?)/.test(error.config?.url ?? "") && typeof window !== "undefined") window.dispatchEvent(new Event("portal:session-check"));
  return Promise.reject(error);
});
