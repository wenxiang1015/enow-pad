<script setup lang="ts">
import type { ApiResult } from '@/types/common/apiResult'
import type { TableData } from '@/types/common/tableData'
import type { MesLotDayLine } from '@/types/production/mesLotDayLine'
import type { CpInspection } from '@/types/qc/cpInspection'
import { useGlobalToast } from '@/composables/useGlobalToast'
import http from '@/utils/request'

definePage({
  name: 'mesLotInspection',
  style: {
    navigationBarTitleText: '品质巡检',
  },
})

const toast = useGlobalToast()
const btnLoading = ref(false)
const dayId = ref<string>()
const currentDayLine = reactive<MesLotDayLine>({})
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  lotNo: '',
  lotCode: '',
})
const dataArray = ref<CpInspection[]>([])
const total = ref(0)

const getList = async () => {
  btnLoading.value = true
  try {
    const params = {
      ...queryParams,
      dayId: dayId.value,
    }
    const res: TableData<CpInspection> = await http.get('/qc/cpInspection/list', params)
    dataArray.value = res?.rows ?? []
    total.value = res?.total ?? 0
  }
  finally {
    btnLoading.value = false
  }
}
const init = async (id: string) => {
  dayId.value = id
  const dayRes: ApiResult<MesLotDayLine> = await http.get(`/production/mesLotDayLine/${id}`)
  if (dayRes.code === 200 && dayRes.data) {
    Object.assign(currentDayLine, dayRes.data)
  }
  await getList()
}
const pageChange = async (e: any) => {
  queryParams.pageNum = e.value
  await getList()
}
const navigateToSave = (row?: CpInspection) => {
  uni.navigateTo({
    url: '/pagesProd/mesLot/inspection/save',
    success: (res) => {
      if (row) {
        res.eventChannel.emit('init', Number(row?.id))
      }
      else {
        res.eventChannel.emit('initItem', Number(dayId.value))
      }
    },
  })
}
const handleDelete = async (row: CpInspection) => {
  if (!row.id)
    return
  uni.showModal({
    title: '提示',
    content: `是否确认删除品质巡检编号为"${row.id}"的数据项？`,
    success: async (modalRes) => {
      if (!modalRes.confirm)
        return
      btnLoading.value = true
      try {
        const res: ApiResult<any> = await http.delete(`/qc/cpInspection/${row.id}`)
        if (res.code === 200) {
          toast.success('删除成功')
          await getList()
          uni.$emit('refreshMesLot')
        }
        else {
          toast.error(res.msg || '删除失败')
        }
      }
      finally {
        btnLoading.value = false
      }
    },
  })
}

let eventChannel: UniApp.EventChannel | null = null

onLoad(() => {
  uni.$on('refreshMesLotInspection', getList)
  const instance = getCurrentInstance() as any
  const pageVm = instance?.proxy as any
  eventChannel = pageVm?.getOpenerEventChannel?.() ?? null
  eventChannel?.on('init', init)
})

onUnload(() => {
  uni.$off('refreshMesLotInspection', getList)
  eventChannel?.off('init', init)
  eventChannel = null
})
</script>

<template>
  <view class="info-box">
    <view class="info-item">
      <view class="info-item-label">
        生产批
      </view>
      <view class="info-item-value">
        {{ currentDayLine.lotNo }}
      </view>
    </view>
  </view>
  <view class="info-box">
    <view class="info-item">
      <view class="info-item-label">
        物料批
      </view>
      <view class="info-item-value">
        {{ currentDayLine.lotCode }}
      </view>
    </view>
  </view>
  <view class="info-box">
    <view class="info-item">
      <view class="info-item-label">
        日期
      </view>
      <view class="info-item-value">
        {{ currentDayLine.workDate }}
      </view>
    </view>
  </view>
  <view class="info-box">
    <view class="info-item">
      <view class="info-item-label">
        班次
      </view>
      <view class="info-item-value">
        {{ currentDayLine.sailings }}
      </view>
    </view>
  </view>
  <view class="info-box">
    <view class="info-item">
      <view class="info-item-label">
        线号
      </view>
      <view class="info-item-value">
        {{ currentDayLine.lineNo }}
      </view>
    </view>
    <view class="info-item">
      <view class="info-item-label">
        品号
      </view>
      <view class="info-item-value">
        {{ currentDayLine.productNo }}
      </view>
    </view>
    <view class="info-item">
      <view class="info-item-label">
        品名
      </view>
      <view class="info-item-value">
        {{ currentDayLine.productName }}
      </view>
    </view>
  </view>
  <wd-button size="small" block @click="navigateToSave()">
    添加
  </wd-button>
  <wd-table :data="dataArray">
    <wd-table-column prop="createBy" label="填写人" align="center" :width="220" />
    <wd-table-column prop="createTime" label="填写时间" align="center" :width="220" />
    <wd-table-column prop="id" label="操作" align="center" :width="220">
      <template #value="{ row }">
        <wd-button size="small" @click="navigateToSave(row)">
          修改
        </wd-button>
        <wd-button size="small" custom-class="delete-btn" @click="handleDelete(row)">
          删除
        </wd-button>
      </template>
    </wd-table-column>
  </wd-table>

  <wd-pagination v-model="queryParams.pageNum" :total="total" @change="pageChange" />
</template>

<style lang="scss" scoped>
</style>
