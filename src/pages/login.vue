<script setup lang="ts">
import type { AuthUser } from '@/store/authStore'
import { useAuthStore } from '@/store/authStore'
import http from '@/utils/request'

definePage({
  name: 'login',
  style: {
    navigationBarTitleText: '登录',
  },
})

const LOGO_URL = 'https://enow.oss-cn-beijing.aliyuncs.com/images/20240521/1716270636193.png'

const GlobalToast = useGlobalToast()
const authStore = useAuthStore()

const form = reactive({
  userName: '',
  password: '',
})

const submitting = ref(false)

interface LoginResponse {
  code: number
  msg?: string
  token?: string
  user?: AuthUser
  perms?: string[]
}

async function submit() {
  const userName = form.userName.trim()
  const password = form.password
  if (!userName) {
    GlobalToast.error('请输入用户名')
    return
  }
  if (!password) {
    GlobalToast.error('请输入密码')
    return
  }

  submitting.value = true
  try {
    const res = await http.post<LoginResponse>(
      '/user/login',
      { userName, password },
      { skipLoading: true, timeout: 20000 },
    )
    if (res.code === 200 && res.token && res.user) {
      authStore.setSession({
        token: res.token,
        user: res.user,
        perms: res.perms ?? [],
      })
      GlobalToast.success('登录成功')
      uni.reLaunch({ url: '/pages/index/index' })
    }
    else {
      GlobalToast.error(res.msg || '登录失败')
    }
  }
  catch {
    // 错误提示由 handleAlovaError + GlobalToast 处理
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="login-page min-h-screen flex flex-col px-6 pb-10 pt-16">
    <view class="mb-10 flex flex-col items-center">
      <image
        :src="LOGO_URL"
        mode="widthFix"
        class="logo-img w-40"
      />
      <text class="mt-4 text-4.5 font-semibold wot-text-text-main">
        Enow
      </text>
      <text class="mt-1 text-center text-3 leading-relaxed wot-text-text-secondary">
        请使用账号登录
      </text>
    </view>

    <view class="login-card rounded-4 p-5 shadow-lg wot-bg-filled-oppo">
      <view class="mb-4">
        <text class="mb-2 block text-3.5 wot-text-text-secondary">
          用户名
        </text>
        <wd-input
          v-model="form.userName"
          placeholder="请输入用户名"
          clearable
          custom-class="login-input"
        />
      </view>
      <view class="mb-6">
        <text class="mb-2 block text-3.5 wot-text-text-secondary">
          密码
        </text>
        <wd-input
          v-model="form.password"
          placeholder="请输入密码"
          show-password
          clearable
          custom-class="login-input"
        />
      </view>
      <wd-button type="primary" size="large" round block :loading="submitting" @click="submit">
        登录
      </wd-button>
      <text class="mt-4 block text-center text-2.8 leading-relaxed wot-text-text-secondary">
        账号密码与 SAP 一致
      </text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.login-page {
  background: linear-gradient(
    165deg,
    rgba(120, 160, 200, 0.12) 0%,
    rgba(255, 255, 255, 0) 45%
  );
}

.login-card {
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.06);
}

:deep(.login-input) {
  border-radius: 16rpx;
}
</style>
