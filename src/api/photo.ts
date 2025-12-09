import { request } from "./request";
import type { PhotoItem } from "@/types";

export interface PhotoListParams {
  device_id: string;
  page?: number;
  page_size?: number;
  include_deleted?: boolean;
}

export interface PhotoListResponse {
  code: number;
  message: string;
  data: {
    page: number;
    page_size: number;
    total: number;
    has_more: boolean;
    items: PhotoItem[];
  };
}

export interface PhotoDeletePayload {
  device_id: string;
  photo_ids: string[];
}

export interface PhotoDeleteResponse {
  code: number;
  message: string;
  data: {
    deleted_ids: string[];
    failed: { photo_id: string; code: number; message: string }[];
    deleted_at: string;
  };
}

export interface PhotoDownloadParams {
  device_id: string;
  photo_ids: string;
}

export interface PhotoDownloadResponse {
  code: number;
  message: string;
  data: {
    links: { photo_id: string; download_url: string; expires_at: string }[];
  };
}

export function fetchPhotoList(params: PhotoListParams) {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");
  return request<PhotoListResponse>(`/api/photo/list?${query}`, "GET");
}

export function deletePhotos(payload: PhotoDeletePayload) {
  return request<PhotoDeleteResponse>("/api/photo/delete", "DELETE", payload);
}

export function downloadPhotos(params: PhotoDownloadParams) {
  const query = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
  return request<PhotoDownloadResponse>(`/api/photo/download?${query}`, "GET");
}
