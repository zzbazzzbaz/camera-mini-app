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
import { deletePhotos } from "@/api/photo";

const photoId = ref("");
const deviceId = ref("");
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
  if (!fileSize.value || fileSize.value <= 0) return "--";
  const mb = fileSize.value / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
});

const confirmDelete = () => {
  if (!photoId.value || !deviceId.value) {
    uni.showToast({ title: "缺少必要信息", icon: "none" });
    return;
  }

  uni.showModal({
    title: "确认删除",
    content: "将移至回收站，30 天后自动清除",
    success: async (res) => {
      if (!res.confirm) return;
      uni.showLoading({ title: "处理中...", mask: true });
      try {
        const resp = await deletePhotos({
          device_id: deviceId.value,
          photo_ids: [photoId.value],
        });
        if (resp.code !== 200) throw new Error(resp.message || "删除失败");

        uni.showToast({ title: "已删除到回收站", icon: "none" });
        // 通知列表刷新后返回
        uni.$emit("photo-deleted", { device_id: deviceId.value, photo_id: photoId.value });
        setTimeout(() => {
          uni.navigateBack();
        }, 300);
      } catch (error) {
        uni.showToast({ title: (error as any)?.message || "删除失败", icon: "none" });
      } finally {
        uni.hideLoading();
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
  deviceId.value = (options?.device_id as string) || "";
  deviceName.value = decodeURIComponent((options?.device_name as string) || "相机设备");
  const urlParam = decodeURIComponent((options?.url as string) || "");
  photoUrl.value = urlParam && urlParam !== "undefined" && urlParam !== "null" ? urlParam : "/static/logo.png";
  uploadTime.value = decodeURIComponent((options?.upload_time as string) || "");
  width.value = options?.width ? Number(options.width) : null;
  height.value = options?.height ? Number(options.height) : null;
  format.value = (options?.format as string) || "";
  const parsedSize = Number(options?.file_size);
  fileSize.value = Number.isFinite(parsedSize) && parsedSize > 0 ? parsedSize : null;
});
</script>
