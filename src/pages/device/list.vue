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
import { fetchDeviceList } from "@/api/device";
import { useAuth } from "@/utils/auth";

const loading = ref(true);
const devices = ref<DeviceSummary[]>([]);
const { getToken } = useAuth();

const ensureAuthed = () => {
  const token = getToken();
  if (!token) {
    uni.reLaunch({ url: "/pages/login/index" });
    return false;
  }
  return true;
};

const fetchDevices = async () => {
  loading.value = true;
  try {
    const res = await fetchDeviceList();
    if (res.code === 200 && res.data?.devices) {
      devices.value = res.data.devices;
    } else {
      uni.showToast({ title: res.message || "加载失败", icon: "none" });
    }
  } finally {
    loading.value = false;
    uni.stopPullDownRefresh();
  }
};

const gotoBind = () => {
  uni.navigateTo({ url: "/pages/device/bind" });
};

const handleCardTap = (device: DeviceSummary) => {
  if (!device.device_id) {
    uni.showToast({ title: "设备信息缺失，请刷新列表后重试", icon: "none" });
    return;
  }
  uni.navigateTo({
    url: `/pages/photo/list?device_id=${device.device_id}&name=${encodeURIComponent(device.device_name)}`,
  });
};

onMounted(async () => {
  if (!ensureAuthed()) return;
  await fetchDevices();
});

onPullDownRefresh(async () => {
  if (!ensureAuthed()) {
    uni.stopPullDownRefresh();
    return;
  }
  await fetchDevices();
});
</script>
