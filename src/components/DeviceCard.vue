<template>
  <view
    class="rounded-2xl bg-white shadow-sm p-4 mb-4 border border-slate-100 active__bg-slate-50"
    @tap="handleTap"
  >
    <view class="flex items-start justify-between">
      <view class="flex-1">
        <view class="text-lg font-semibold text-slate-900">{{ device.device_name || "相机设备" }}</view>
        <view class="mt-1 text-xs text-slate-500">序列号：{{ device.serial_number }}</view>
      </view>
      <view class="flex flex-col items-end">
        <view class="flex items-center text-xs">
          <view class="w-2 h-2 rounded-full" :class="device.status ? 'bg-emerald-500' : 'bg-gray-400'"></view>
          <text class="ml-1 text-slate-600">{{ device.status ? "在线" : "未知" }}</text>
        </view>
        <view class="mt-1 px-2 py-1 bg-slate-100 rounded-full text-[11px] text-slate-600">
          照片 {{ device.photo_count }}
        </view>
      </view>
    </view>

    <view class="mt-3 grid grid-cols-2 gap-2 text-[12px] text-slate-500">
      <view class="flex items-center">
        <view class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></view>
        首次上传：{{ formatTime(device.first_upload_time) }}
      </view>
      <view class="flex items-center">
        <view class="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5"></view>
        最近上传：{{ formatTime(device.last_upload_time) }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { DeviceSummary } from "@/types";

const props = defineProps<{
  device: DeviceSummary;
}>();

const emit = defineEmits<{
  (event: "tap", device: DeviceSummary): void;
}>();

const formatTime = (value?: string | null) => {
  if (!value) return "--";
  return value.replace("T", " ").slice(0, 16);
};

const handleTap = () => {
  emit("tap", props.device);
};
</script>
