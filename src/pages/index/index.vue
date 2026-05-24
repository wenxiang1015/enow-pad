<script setup lang="ts">
import { hasPerms, navTo } from '@/utils/tools'

definePage({
  name: 'home',
  layout: 'tabbar',
  style: {
    navigationStyle: 'custom',
  },
})
const {
  theme,
  toggleTheme,
  currentThemeColor,
  showThemeColorSheet,
  themeColorOptions,
  openThemeColorPicker,
  closeThemeColorPicker,
  selectThemeColor,
} = useManualTheme()

const isDark = computed(() => theme.value === 'dark')

// 处理主题色选择
function handleThemeColorSelect(option: any) {
  selectThemeColor(option)
}
</script>

<template>
  <wd-navbar title="首页">
    <template #left>
      <view class="flex items-center gap-2">
        <text class="text-3 wot-text-text-secondary">
          暗黑
        </text>
        <wd-switch
          :model-value="isDark"
          active-text="开"
          inactive-text="关"
          @change="({ value }) => toggleTheme(value ? 'dark' : 'light')"
        />
      </view>
    </template>
    <template #right>
      <wd-button round variant="plain" size="small" @click="openThemeColorPicker">
        <view class="flex items-center gap-2">
          <view
            class="h-4 w-4 rounded-full"
            :style="{ backgroundColor: currentThemeColor.primary }"
          />
          <text>{{ currentThemeColor.name }}</text>
        </view>
      </wd-button>
    </template>
  </wd-navbar>
  <view class="box-border py-3">
    <view class="mx-3">
      <view class="grid grid-cols-3 gap-3">
        <view class="rounded-2 bg-white p-4 text-center shadow-sm dark:bg-[var(--wot-dark-background2)]">
          <view class="mx-auto mb-2 h-16 w-16 flex items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/40">
            <text class="ali-icon ali-shenqing text-8 text-orange-500" />
          </view>
          <view class="text-3.5 font-bold wot-text-text-main">
            申请
          </view>
        </view>
        <view class="rounded-2 bg-white p-4 text-center shadow-sm dark:bg-[var(--wot-dark-background2)]">
          <view class="mx-auto mb-2 h-16 w-16 flex items-center justify-center rounded-full bg-green-50 dark:bg-green-950/40">
            <text class="ali-icon ali-shenhe text-8 text-green-500" />
          </view>
          <view class="text-3.5 font-bold wot-text-text-main">
            审核
          </view>
        </view>
        <view class="rounded-2 bg-white p-4 text-center shadow-sm dark:bg-[var(--wot-dark-background2)]">
          <view class="mx-auto mb-2 h-16 w-16 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40">
            <text class="ali-icon ali-wodedaiban text-8 text-blue-500" />
          </view>
          <view class="text-3.5 font-bold wot-text-text-main">
            代办
          </view>
        </view>
      </view>
    </view>

    <view class="mx-3" style="margin-top: 10px;">
      <view class="grid grid-cols-2 gap-3">
        <view
          v-if="hasPerms('production:mesLot:list')"
          class="rounded-2 bg-white p-4 text-center shadow-sm dark:bg-[var(--wot-dark-background2)]"
          @click="navTo('/pagesProd/mesLot/index')"
        >
          <view class="mx-auto mb-2 h-16 w-16 flex items-center justify-center rounded-full" :style="{ backgroundColor: `${currentThemeColor.primary}1A` }">
            <text class="ali-icon ali-shengchanguocheng-shengchanzhihang-weixuan text-8" :style="{ color: currentThemeColor.primary }" />
          </view>
          <view class="mb-1 text-3.5 font-bold wot-text-text-main">
            生产过程
          </view>
          <view class="text-2.5 wot-text-text-auxiliary">
            进入生产批次管理
          </view>
        </view>
        <view
          v-if="hasPerms('production:mesLot:list')"
          class="rounded-2 bg-white p-4 text-center shadow-sm dark:bg-[var(--wot-dark-background2)]"
          @click="navTo('/pagesProd/mesLot/index')"
        >
          <view class="mx-auto mb-2 h-16 w-16 flex items-center justify-center rounded-full" :style="{ backgroundColor: `${currentThemeColor.primary}1A` }">
            <text class="ali-icon ali-zhiliangxunjianxiang text-8" :style="{ color: currentThemeColor.primary }" />
          </view>
          <view class="mb-1 text-3.5 font-bold wot-text-text-main">
            品质巡检
          </view>
          <view class="text-2.5 wot-text-text-auxiliary">
            进入品质巡检
          </view>
        </view>
        <view
          v-if="hasPerms('production:mesLot:list')"
          class="rounded-2 bg-white p-4 text-center shadow-sm dark:bg-[var(--wot-dark-background2)]"
          @click="navTo('/pagesProd/mesLot/index')"
        >
          <view class="mx-auto mb-2 h-16 w-16 flex items-center justify-center rounded-full" :style="{ backgroundColor: `${currentThemeColor.primary}1A` }">
            <text class="ali-icon ali-xiangmuguanli text-8" :style="{ color: currentThemeColor.primary }" />
          </view>
          <view class="mb-1 text-3.5 font-bold wot-text-text-main">
            设备点检
          </view>
          <view class="text-2.5 wot-text-text-auxiliary">
            进入设备点检
          </view>
        </view>
        <view
          v-if="hasPerms('production:mesLot:list')"
          class="rounded-2 bg-white p-4 text-center shadow-sm dark:bg-[var(--wot-dark-background2)]"
          @click="navTo('/pagesProd/mesLot/index')"
        >
          <view class="mx-auto mb-2 h-16 w-16 flex items-center justify-center rounded-full" :style="{ backgroundColor: `${currentThemeColor.primary}1A` }">
            <text class="ali-icon ali-shengchanguocheng-shengchanzhihang-weixuan text-8" :style="{ color: currentThemeColor.primary }" />
          </view>
          <view class="mb-1 text-3.5 font-bold wot-text-text-main">
            物料点检
          </view>
          <view class="text-2.5 wot-text-text-auxiliary">
            进入物料点检
          </view>
        </view>
      </view>
    </view>

    <!-- 主题色选择 ActionSheet -->
    <wd-action-sheet
      v-model="showThemeColorSheet"
      title="选择主题色"
      :close-on-click-action="true"
      @cancel="closeThemeColorPicker"
    >
      <view class="px-4 pb-4">
        <view
          v-for="option in themeColorOptions"
          :key="option.value"
          class="flex items-center justify-between border-b py-3 wot-border-border-main last:border-b-0"
          @click="handleThemeColorSelect(option)"
        >
          <view class="flex items-center gap-3">
            <view
              class="h-6 w-6 border-2 rounded-full wot-border-border-main"
              :style="{ backgroundColor: option.primary }"
            />
            <text class="text-4 wot-text-text-main">
              {{ option.name }}
            </text>
          </view>
          <wd-icon
            v-if="currentThemeColor.value === option.value"
            name="check"
            :color="option.primary"
            size="20px"
          />
        </view>
      </view>
      <wd-gap :height="50" />
    </wd-action-sheet>
  </view>
</template>
