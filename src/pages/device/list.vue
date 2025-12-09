<template>
  <view class="min-h-screen bg-slate-50">
    <view class="bg-white px-4 pt-3 pb-3 shadow-sm flex items-start justify-between">
      <view>
        <view class="text-lg font-semibold text-slate-900">我的设备</view>
        <view class="text-xs text-slate-500 mt-1">查看已绑定的相机并进入照片列表</view>
      </view>
      <button class="px-3 py-1.5 text-sm rounded-full bg-emerald-500 text-white" @tap="gotoBind">
        绑定设备
      </button>
    </view>

    <view class="px-4 pt-4 pb-6">
      <view v-if="loading" class="text-center text-slate-500 mt-10">加载中...</view>

      <view v-else-if="!devices.length" class="mt-16 flex flex-col items-center">
        <view class="w-16 h-16 rounded-2xl bg-white shadow flex items-center justify-center text-2xl text-emerald-500">
          📷
        </view>
        <view class="mt-4 text-lg font-semibold text-slate-900">还没有设备</view>
        <view class="mt-2 text-sm text-slate-500">绑定后即可查看云端照片</view>
        <button
          class="mt-5 px-5 py-2 rounded-full bg-emerald-500 text-white text-sm"
          @tap="gotoBind"
        >
          去绑定
        </button>
      </view>

      <view v-else>
        <DeviceCard
          v-for="item in devices"
          :key="item.binding_id"
          :device="item"
          @tap="handleCardTap"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { onPullDownRefresh } from "@dcloudio/uni-app";
import DeviceCard from "@/components/DeviceCard.vue";
import type { DeviceSummary } from "@/types";

const loading = ref(true);
const devices = ref<DeviceSummary[]>([]);

const mockDevices: DeviceSummary[] = [
  {
    binding_id: "bind-1",
    device_id: "dev-1",
    serial_number: "CAM-20250108-A3F9E2B1",
    device_name: "客厅相机",
    status: 1,
    photo_count: 128,
    first_upload_time: "2025-01-01T10:00:00",
    last_upload_time: "2025-01-08T10:00:00",
  },
  {
    binding_id: "bind-2",
    device_id: "dev-2",
    serial_number: "CAM-20250102-B7C1D3E4",
    device_name: "卧室相机",
    status: 0,
    photo_count: 36,
    first_upload_time: "2025-01-02T09:10:00",
    last_upload_time: "2025-01-06T08:42:00",
  },
];

const fetchDevices = async () => {
  loading.value = true;
  try {
    // TODO: 调用 /api/device/list 获取真实数据
    await new Promise((resolve) => setTimeout(resolve, 400));
    devices.value = mockDevices;
  } finally {
    loading.value = false;
    uni.stopPullDownRefresh();
  }
};

const gotoBind = () => {
  uni.navigateTo({ url: "/pages/device/bind" });
};

const handleCardTap = (device: DeviceSummary) => {
  uni.navigateTo({
    url: `/pages/photo/list?device_id=${device.device_id}&name=${encodeURIComponent(device.device_name)}`,
  });
};

onMounted(() => {
  fetchDevices();
});

onPullDownRefresh(() => {
  fetchDevices();
});
</script>
