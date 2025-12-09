<template>
  <view class="min-h-screen bg-slate-50">
  <view class="sticky top-0 z-10 bg-white/95 border-b border-slate-100">
      <view class="px-4 pt-3 pb-3 flex items-start justify-between">
        <view>
          <view class="text-base font-semibold text-slate-900">{{ deviceName || "照片列表" }}</view>
          <view class="text-[12px] text-slate-500 mt-1">已加载 {{ filteredPhotos.length }} 张 · 下拉刷新</view>
        </view>
        <view class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 rounded-full bg-slate-100 text-xs text-slate-700"
            @tap="toggleSelectMode"
          >
            {{ multiSelect ? "退出多选" : "多选" }}
          </button>
          <button
            class="px-3 py-1.5 rounded-full bg-emerald-500 text-xs text-white"
            @tap="() => setFilter(filter === 'active' ? 'deleted' : 'active')"
          >
            {{ filter === "active" ? "回收站" : "返回全部" }}
          </button>
        </view>
      </view>

      <view class="px-4 pb-3 flex items-center gap-2">
        <view :class="chipClass('active')" @tap="setFilter('active')">全部</view>
        <view :class="chipClass('deleted')" @tap="setFilter('deleted')">回收站</view>
        <view class="ml-auto text-[12px] text-slate-500">照片倒序 · 支持批量删除/下载</view>
      </view>
    </view>

    <view class="px-4 pt-3 pb-24">
      <view v-if="loading" class="text-center text-slate-500 mt-12">加载中...</view>

      <view v-else-if="!filteredPhotos.length" class="flex flex-col items-center mt-14 text-slate-500">
        <view class="w-16 h-16 rounded-2xl bg-white shadow flex items-center justify-center text-2xl text-emerald-500">
          📷
        </view>
        <view class="mt-3 text-slate-900 font-semibold">暂无照片</view>
        <view class="mt-1 text-sm">确认相机已联网并上传</view>
        <button class="mt-4 px-4 py-2 rounded-full bg-slate-900 text-white text-xs" @tap="refreshList">
          重新加载
        </button>
      </view>

      <view v-else class="grid grid-cols-2 gap-3">
        <PhotoTile
          v-for="item in filteredPhotos"
          :key="item.photo_id"
          :photo="item"
          :selectable="multiSelect"
          :selected="selectedIds.includes(item.photo_id)"
          @tap="handleTileTap"
        />
      </view>

      <view v-if="loadingMore" class="text-center text-slate-500 mt-3 text-sm">加载更多...</view>
      <view v-else-if="!hasMore" class="text-center text-slate-400 mt-3 text-xs">已加载全部</view>
    </view>

    <view
      v-if="multiSelect"
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between"
    >
      <view class="text-sm text-slate-700">已选 {{ selectedIds.length }} 张</view>
      <view class="flex items-center gap-2">
        <button
          class="px-4 py-2 rounded-full bg-amber-500 text-white text-xs disabled:bg-slate-200"
          :disabled="!selectedIds.length"
          @tap="handleDelete"
        >
          删除
        </button>
        <button
          class="px-4 py-2 rounded-full bg-emerald-600 text-white text-xs disabled:bg-slate-200"
          :disabled="!selectedIds.length"
          @tap="handleDownload"
        >
          下载
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { onLoad, onReachBottom, onPullDownRefresh } from "@dcloudio/uni-app";
import PhotoTile from "@/components/PhotoTile.vue";
import type { PhotoItem } from "@/types";
import { fetchPhotoList, deletePhotos, downloadPhotos } from "@/api/photo";

const deviceId = ref("");
const deviceName = ref("");
const photos = ref<PhotoItem[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const hasMore = ref(true);
const filter = ref<"active" | "deleted">("active");
const multiSelect = ref(false);
const selectedIds = ref<string[]>([]);

const filteredPhotos = computed(() =>
  photos.value.filter((item) =>
    filter.value === "deleted" ? item.is_deleted === 1 : item.is_deleted !== 1
  )
);

const chipClass = (key: "active" | "deleted") =>
  `px-3 py-1.5 rounded-full text-xs font-medium border ${
    filter.value === key
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-white text-slate-600 border-slate-200"
  }`;

const page = ref(1);
const pageSize = ref(20);

const fetchPhotos = async (reset = true) => {
  if (reset) {
    loading.value = true;
    hasMore.value = true;
    page.value = 1;
  } else {
    loadingMore.value = true;
  }

  try {
    const res = await fetchPhotoList({
      device_id: deviceId.value,
      page: page.value,
      page_size: pageSize.value,
      include_deleted: filter.value === "deleted",
    });
    if (res.code !== 200 || !res.data) {
      throw new Error(res.message || "加载失败");
    }
    const list = res.data.items || [];
    photos.value = reset ? list : [...photos.value, ...list];
    hasMore.value = !!res.data.has_more;
    if (res.data.has_more) {
      page.value += 1;
    }
  } catch (error) {
    uni.showToast({ title: (error as any)?.message || "加载失败", icon: "none" });
  } finally {
    loading.value = false;
    loadingMore.value = false;
    uni.stopPullDownRefresh();
  }
};

const setFilter = (key: "active" | "deleted") => {
  filter.value = key;
  selectedIds.value = [];
  fetchPhotos(true);
};

const toggleSelectMode = () => {
  multiSelect.value = !multiSelect.value;
  if (!multiSelect.value) selectedIds.value = [];
};

const toggleSelect = (id: string) => {
  if (!multiSelect.value) return;
  const exists = selectedIds.value.includes(id);
  selectedIds.value = exists
    ? selectedIds.value.filter((item) => item !== id)
    : [...selectedIds.value, id];
};

const handleTileTap = (photo: PhotoItem) => {
  if (multiSelect.value) {
    toggleSelect(photo.photo_id);
    return;
  }

  if (photo.is_deleted === 1) {
    uni.showToast({ title: "照片在回收站，无法预览", icon: "none" });
    return;
  }

  const query = [
    `photo_id=${photo.photo_id}`,
    `device_id=${deviceId.value}`,
    `device_name=${encodeURIComponent(deviceName.value)}`,
    `url=${encodeURIComponent(photo.original_url || photo.thumbnail_url)}`,
    `upload_time=${encodeURIComponent(photo.upload_time)}`,
    `width=${photo.width || ""}`,
    `height=${photo.height || ""}`,
    `format=${photo.format || ""}`,
    `file_size=${photo.file_size || ""}`,
  ].join("&");

  uni.navigateTo({ url: `/pages/photo/detail?${query}` });
};

const handleDelete = () => {
  if (!selectedIds.value.length) return;
  uni.showModal({
    title: "确认删除",
    content: `将选中 ${selectedIds.value.length} 张移至回收站，30 天后自动清除`,
    success: (res) => {
      if (res.confirm) {
        deletePhotos({
          device_id: deviceId.value,
          photo_ids: selectedIds.value,
        })
          .then((resp) => {
            if (resp.code !== 200) throw new Error(resp.message || "删除失败");
            photos.value = photos.value.map((item) =>
              selectedIds.value.includes(item.photo_id)
                ? { ...item, is_deleted: 1 }
                : item
            );
            selectedIds.value = [];
            uni.showToast({ title: "已移动到回收站", icon: "none" });
          })
          .catch((err) => {
            uni.showToast({ title: (err as any)?.message || "删除失败", icon: "none" });
          });
      }
    },
  });
};

const handleDownload = () => {
  if (!selectedIds.value.length) return;
  downloadPhotos({
    device_id: deviceId.value,
    photo_ids: selectedIds.value.join(","),
  })
    .then((res) => {
      if (res.code !== 200) throw new Error(res.message || "获取链接失败");
      res.data?.links?.forEach((link) => {
        uni.downloadFile({
          url: link.download_url,
          success: () => {},
          fail: () => {
            uni.showToast({ title: "下载失败", icon: "none" });
          },
        });
      });
      uni.showToast({ title: "正在下载", icon: "none" });
    })
    .catch((err) => {
      uni.showToast({ title: (err as any)?.message || "获取链接失败", icon: "none" });
    });
};

const refreshList = () => {
  fetchPhotos(true);
};

const loadMore = async () => {
  if (!hasMore.value || loadingMore.value) return;
  await fetchPhotos(false);
};

onLoad((options) => {
  deviceId.value = (options?.device_id as string) || "";
  deviceName.value = decodeURIComponent((options?.name as string) || "照片列表");
});

onMounted(() => {
  fetchPhotos(true);
});

onReachBottom(() => {
  loadMore();
});

onPullDownRefresh(() => {
  fetchPhotos(true);
});
</script>
