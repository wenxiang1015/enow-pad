<script setup lang="ts">
import { useAuthStore } from '@/store/authStore'

const authStore = useAuthStore()

definePage({
  name: 'about',
  layout: 'tabbar',
  style: {
    navigationStyle: 'custom',
  },
})

const logOut = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        authStore.clearSession()
        uni.reLaunch({ url: '/pages/login' })
      }
    },
  })
}
</script>

<template>
  <wd-navbar title="我的">
    <template #right>
      <wd-button type="primary" size="small" plain @click="logOut">
        退出
      </wd-button>
    </template>
  </wd-navbar>
  <view class="min-h-screen py-3" />
</template>
