<template>
  <view
    class="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100"
    @tap="handleTap"
  >
    <image
      :src="photo.thumbnail_url || '/static/logo.png'"
      mode="aspectFill"
      class="w-full h-48"
      :lazy-load="true"
    />

    <view class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-black/0 p-3">
      <view class="text-xs text-white font-medium">{{ photo.upload_time?.replace('T', ' ') }}</view>
      <view v-if="photo.format" class="text-[11px] text-white/80 mt-1">
        {{ photo.format?.toUpperCase() }} · {{ photo.width || "--" }}×{{ photo.height || "--" }}
      </view>
    </view>

    <view v-if="photo.is_deleted" class="absolute top-2 left-2 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px]">
      回收站
    </view>

    <view
      v-if="selectable"
      class="absolute top-2 right-2 w-7 h-7 rounded-full border border-white/70 bg-black/30 flex items-center justify-center"
      :class="selected ? 'bg-emerald-500 border-emerald-500' : ''"
    >
      <text class="text-white text-sm" v-if="selected">✔</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { PhotoItem } from "@/types";

const props = defineProps<{
  photo: PhotoItem;
  selectable?: boolean;
  selected?: boolean;
}>();

const emit = defineEmits<{
  (event: "tap", photo: PhotoItem): void;
}>();

const handleTap = () => {
  emit("tap", props.photo);
};
</script>
