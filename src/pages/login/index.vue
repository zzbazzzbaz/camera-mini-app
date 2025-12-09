<template>
  <view class="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white flex flex-col">
    <view class="px-8 pt-16 pb-10 flex-1 flex flex-col">
      <view class="text-xs uppercase tracking-[0.2em] text-slate-400">Camera Cloud</view>
      <view class="mt-3 text-3xl font-semibold">连接你的相机</view>
      <view class="mt-2 text-3xl font-semibold text-emerald-300">随时查看云端照片</view>
      <view class="mt-3 text-sm text-slate-300 leading-relaxed">
        微信授权登录后即可绑定相机设备，实时查看、下载与删除云端照片。
      </view>

      <view class="mt-10 bg-white/10 border border-white/10 rounded-2xl p-5">
        <view class="flex items-center">
          <view class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 text-xl font-semibold">
            云
          </view>
          <view class="ml-4">
            <view class="text-base font-semibold">云端相册</view>
            <view class="text-xs text-slate-300 mt-1">设备上传 · 缩略图加载 · 原图预览</view>
          </view>
        </view>
        <view class="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-200">
          <view class="px-3 py-2 bg-white/5 rounded-xl border border-white/10">序列号绑定</view>
          <view class="px-3 py-2 bg-white/5 rounded-xl border border-white/10">照片回收站</view>
          <view class="px-3 py-2 bg-white/5 rounded-xl border border-white/10">批量下载/删除</view>
          <view class="px-3 py-2 bg-white/5 rounded-xl border border-white/10">签名链接安全</view>
        </view>
      </view>

      <button
        class="mt-10 w-full py-3 rounded-2xl text-lg font-semibold bg-emerald-500 text-white active__bg-emerald-600"
        :loading="loading"
        :disabled="loading"
        @tap="handleLogin"
      >
        微信授权登录
      </button>

      <view class="mt-3 text-xs text-slate-300 flex items-center">
        <view class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2"></view>
        登录即表示同意
        <text class="ml-1 underline decoration-emerald-400" @tap="openPolicy">隐私协议</text>
        <text class="mx-1 text-slate-500">/</text>
        <text class="underline decoration-emerald-400" @tap="openPolicy">用户协议</text>
      </view>
    </view>

    <view class="px-8 pb-10">
      <view class="text-xs text-slate-400">为微信小程序优化 · Tailwind CSS · 云端存储</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { login } from "@/api/auth";

const loading = ref(false);

const handleLogin = async () => {
  if (loading.value) return;
  loading.value = true;
  uni.showLoading({ title: "登录中...", mask: true });
  try {
    let userProfile: UniApp.GetUserProfileRes["userInfo"] | null = null;
    try {
      userProfile = await new Promise<UniApp.GetUserProfileRes["userInfo"]>((resolve, reject) => {
        uni.getUserProfile({
          desc: "用于完善用户资料",
          success: (res) => resolve(res.userInfo),
          fail: reject,
        });
      });
    } catch (err) {
      console.warn("getUserProfile failed, continue login without profile:", err);
    }

    const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({
        provider: "weixin",
        success: resolve,
        fail: reject,
      });
    });

    if (!loginRes.code) {
      throw new Error("未获取到登录 code");
    }

    const res = await login({
      code: loginRes.code,
      ...(userProfile
        ? {
            nickname: userProfile.nickName,
            avatar_url: userProfile.avatarUrl,
          }
        : {}),
    });
    if (!res?.data?.token) throw new Error(res?.message || "登录失败");

    // 显示登录成功提示
    await new Promise<void>((resolve) => {
      uni.showToast({
        title: "登录成功",
        icon: "success",
        success: () => resolve(),
        fail: () => resolve(),
      });
    });

    // 跳转到设备列表页
    await new Promise<void>((resolve, reject) => {
      uni.reLaunch({
        url: "/pages/device/list",
        success: () => resolve(),
        fail: reject,
      });
    });
  } catch (error) {
    uni.showToast({ title: (error as any)?.message || "登录失败，请重试", icon: "none" });
  } finally {
    uni.hideLoading();
    loading.value = false;
  }
};

const openPolicy = () => {
  uni.showToast({ title: "协议内容待接入", icon: "none" });
};
</script>
