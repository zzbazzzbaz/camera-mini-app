export interface DeviceSummary {
  binding_id: string;
  device_id: string;
  serial_number: string;
  device_name: string;
  status: number;
  photo_count: number;
  first_upload_time?: string | null;
  last_upload_time?: string | null;
}

export interface PhotoItem {
  photo_id: string;
  device_id: string;
  thumbnail_url: string;
  original_url: string;
  file_size?: number;
  width?: number;
  height?: number;
  format?: string;
  upload_time: string;
  is_deleted?: number;
}
