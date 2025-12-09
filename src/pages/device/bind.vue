<template>
  <view class="min-h-screen bg-slate-50 px-4 py-5">
    <view class="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
      <view class="text-lg font-semibold text-slate-900">绑定设备</view>
      <view class="mt-1 text-sm text-slate-500">输入相机序列号并可选命名</view>

      <view class="mt-6">
        <view class="text-sm text-slate-700 mb-2">设备序列号</view>
        <input
          class="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
          type="text"
          placeholder="例如：CAM-20250108-A3F9E2B1"
          :value="serialNumber"
          @input="onSerialInput"
        />
        <view class="mt-1 text-[12px]" :class="serialValid ? 'text-emerald-600' : 'text-amber-600'">
          {{ serialValid ? "序列号格式正确" : "需以 CAM- 开头，允许大写字母和数字" }}
        </view>
      </view>

      <view class="mt-5">
        <view class="text-sm text-slate-700 mb-2">设备名称（可选）</view>
        <input
          class="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
          type="text"
          placeholder="默认：相机设备"
          :value="deviceName"
          @input="onDeviceNameInput"
        />
      </view>

      <view class="mt-5 flex items-center justify-between">
        <view>
          <view class="text-sm text-slate-700">我是所有者</view>
          <view class="text-[12px] text-slate-500 mt-1">开启后将以所有者身份绑定</view>
        </view>
        <switch :checked="isOwner" color="#10b981" @change="onOwnerChange" />
      </view>

      <button
        class="mt-7 w-full py-3 rounded-xl text-white text-base font-semibold bg-emerald-500 active__bg-emerald-600 disabled:bg-slate-300"
        :disabled="!serialValid || submitting"
        :loading="submitting"
        @tap="handleBind"
      >
        绑定
      </button>

      <view class="mt-4 text-[12px] text-slate-500 leading-relaxed">
        - 首次绑定会自动创建设备记录。<br />
        - 若提示 1001，请确认相机已上传至少一张照片。<br />
        - 若提示 1002，表示该设备已绑定，无需重复操作。
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const serialNumber = ref("");
const deviceName = ref("");
const isOwner = ref(true);
const submitting = ref(false);

const serialValid = computed(() => /^CAM-[A-Z0-9-]{6,30}$/.test(serialNumber.value));

const onSerialInput = (event: any) => {
  serialNumber.value = (event.detail.value as string).toUpperCase();
};

const onDeviceNameInput = (event: any) => {
  deviceName.value = (event.detail?.value as string) || "";
};

const onOwnerChange = (event: any) => {
  isOwner.value = !!event.detail?.value;
};

const handleBind = async () => {
  if (!serialValid.value || submitting.value) return;
  submitting.value = true;
  uni.showLoading({ title: "绑定中...", mask: true });
  try {
    const payload = {
      serial_number: serialNumber.value,
      device_name: deviceName.value.trim() || undefined,
      is_owner: isOwner.value ? 1 : 0,
    };
    void payload;
    // TODO: 调用 /api/device/bind 接口
    await new Promise((resolve) => setTimeout(resolve, 600));
    uni.showToast({ title: "绑定成功", icon: "success" });
    setTimeout(() => {
      uni.navigateBack();
    }, 400);
  } catch (error) {
    uni.showToast({ title: "绑定失败，请重试", icon: "none" });
  } finally {
    submitting.value = false;
    uni.hideLoading();
  }
};
</script>
