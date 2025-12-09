import { request } from "./request";
import type { DeviceSummary } from "@/types";

export interface DeviceListResponse {
  code: number;
  message: string;
  data: {
    devices: DeviceSummary[];
  };
}

export interface DeviceBindPayload {
  serial_number: string;
  device_name?: string;
  is_owner?: number;
}

export interface DeviceBindResponse {
  code: number;
  message: string;
  data: {
    binding_id: string;
    device_id: string;
    created_device: boolean;
    device: {
      serial_number: string;
      status: number;
      photo_count: number;
      first_upload_time: string | null;
      last_upload_time: string | null;
    };
    binding: {
      device_name: string;
      is_owner: number;
      bind_time: string;
    };
  };
}

export function fetchDeviceList() {
  return request<DeviceListResponse>("/api/device/list", "GET");
}

export function bindDevice(payload: DeviceBindPayload) {
  return request<DeviceBindResponse>("/api/device/bind", "POST", payload);
}
