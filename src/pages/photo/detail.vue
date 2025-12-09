<template>
  <view class="bg-slate-900 text-white">
    <scroll-view scroll-y class="h-screen">
      <view class="bg-black flex items-center justify-center" style="height: 100vh;">
        <image :src="photoUrl" mode="aspectFit" class="w-full h-full" />
      </view>

      <view class="p-4 space-y-4">
        <view class="flex items-start justify-between">
          <view>
            <view class="text-lg font-semibold">照片详情</view>
            <view class="text-xs text-slate-300 mt-1">{{ deviceName || "未知设备" }}</view>
          </view>
          <view class="px-3 py-1 rounded-full bg-white/10 text-xs border border-white/10">
            {{ format?.toUpperCase() || "JPG" }}
          </view>
        </view>

        <view class="bg-white/5 rounded-2xl p-4 border border-white/10">
          <view class="flex justify-between text-sm">
            <text class="text-slate-300">上传时间</text>
            <text class="text-white">{{ uploadTimeDisplay }}</text>
          </view>
          <view class="flex justify-between text-sm mt-3">
            <text class="text-slate-300">分辨率</text>
            <text class="text-white">{{ resolutionText }}</text>
          </view>
          <view class="flex justify-between text-sm mt-3">
            <text class="text-slate-300">大小</text>
            <text class="text-white">{{ sizeText }}</text>
          </view>
          <view class="flex justify-between text-sm mt-3">
            <text class="text-slate-300">照片 ID</text>
            <text class="text-white">{{ photoId || "--" }}</text>
          </view>
        </view>

        <view class="flex gap-3 pb-4">
          <button
            class="flex-1 py-3 rounded-xl bg-amber-500 text-white text-base disabled:bg-slate-600"
            @tap="confirmDelete"
          >
            删除
          </button>
          <button
            class="flex-1 py-3 rounded-xl bg-emerald-500 text-white text-base"
            @tap="handleDownload"
          >
            下载
          </button>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

const photoId = ref("");
const deviceName = ref("");
const photoUrl = ref("/static/logo.png");
const uploadTime = ref("");
const width = ref<number | null>(null);
const height = ref<number | null>(null);
const format = ref("");
const fileSize = ref<number | null>(null);

const uploadTimeDisplay = computed(() => {
  if (!uploadTime.value) return "--";
  return uploadTime.value.replace("T", " ").slice(0, 19);
});

const resolutionText = computed(() =>
  width.value && height.value ? `${width.value} × ${height.value}` : "--"
);

const sizeText = computed(() => {
  if (!fileSize.value) return "--";
  return `${(fileSize.value / 1024 / 1024).toFixed(1)} MB`;
});

const confirmDelete = () => {
  uni.showModal({
    title: "确认删除",
    content: "将移至回收站，30 天后自动清除",
    success: (res) => {
      if (res.confirm) {
        // TODO: 调用 /api/photo/delete 单张接口
        uni.showToast({ title: "已删除到回收站", icon: "none" });
      }
    },
  });
};

const handleDownload = () => {
  // TODO: 调用 /api/photo/download 获取单张签名链接后下载
  uni.showToast({ title: "获取下载链接中", icon: "none" });
};

onLoad((options) => {
  photoId.value = (options?.photo_id as string) || "";
  deviceName.value = decodeURIComponent((options?.device_name as string) || "相机设备");
  photoUrl.value = decodeURIComponent((options?.url as string) || "/static/logo.png");
  uploadTime.value = decodeURIComponent((options?.upload_time as string) || "");
  width.value = options?.width ? Number(options.width) : null;
  height.value = options?.height ? Number(options.height) : null;
  format.value = (options?.format as string) || "";
  fileSize.value = options?.file_size ? Number(options.file_size) : null;
});
</script>
