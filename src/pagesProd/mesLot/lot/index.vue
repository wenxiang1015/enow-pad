<script setup lang="ts">
import type { ApiResult } from '@/types/common/apiResult'
import type { TableData } from '@/types/common/tableData'
import type { E10Lot } from '@/types/qc/e10Lot'
import { useGlobalToast } from '@/composables/useGlobalToast'
import http from '@/utils/request'

definePage({
  name: 'mesLotCode',
  style: {
    navigationBarTitleText: '物料批',
  },
})

const toast = useGlobalToast()
const btnLoading = ref(false)
const showSearch = ref(true)
const currentLotNo = ref<string>()
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  lotNo: '',
  lotCode: '',
})
const dataArray = ref<E10Lot[]>([])
const total = ref(0)
const gzlTypeOptions = [
  { label: '只填净重', value: '0' },
  { label: '净重+瓶重(毛重系统计算)', value: '1' },
  { label: '瓶重+毛重(净重系统计算)', value: '2' },
]

const getList = async () => {
  btnLoading.value = true
  try {
    const params = {
      ...queryParams,
      lotNo: currentLotNo.value,
    }
    const res: TableData<E10Lot> = await http.get('/qc/e10Lot/list', params)
    dataArray.value = res?.rows ?? []
    total.value = res?.total ?? 0
  }
  finally {
    btnLoading.value = false
  }
}

const init = async (lotNo: string) => {
  currentLotNo.value = lotNo
  await getList()
}

const handleQuery = async () => {
  queryParams.pageNum = 1
  await getList()
}

const resetQuery = async () => {
  queryParams.lotNo = ''
  queryParams.lotCode = ''
  await handleQuery()
}

const pageChange = async (e: any) => {
  queryParams.pageNum = e.value
  await getList()
}

const navigateToSave = (row?: E10Lot) => {
  uni.navigateTo({
    url: '/pagesProd/mesLot/lot/save',
    success: (res) => {
      if (row?.id) {
        res.eventChannel.emit('init', Number(row.id))
      }
      else {
        res.eventChannel.emit('initItem', currentLotNo.value)
      }
    },
  })
}

const handleDelete = async (row: E10Lot) => {
  if (!row.id)
    return
  uni.showModal({
    title: '提示',
    content: `是否确认删除物料批编号为"${row.id}"的数据项？`,
    success: async (modalRes) => {
      if (!modalRes.confirm)
        return
      btnLoading.value = true
      try {
        const res: ApiResult<any> = await http.delete(`/qc/e10Lot/${row.id}`)
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
  uni.$on('refreshMesLotLot', getList)
  const instance = getCurrentInstance() as any
  const pageVm = instance?.proxy as any
  eventChannel = pageVm?.getOpenerEventChannel?.() ?? null
  eventChannel?.on('init', init)
})

onUnload(() => {
  uni.$off('refreshMesLotLot', getList)
  eventChannel?.off('init', init)
  eventChannel = null
})
</script>

<template>
  <view class="show_search_row">
    <wd-button size="small" plain @click="showSearch = !showSearch">
      {{ showSearch ? '收起筛选' : '展开筛选' }}
    </wd-button>
    <view>
      <wd-button size="small" :loading="btnLoading" @click="handleQuery">
        刷新
      </wd-button>
    </view>
  </view>

  <wd-form v-if="showSearch" :model="queryParams" :title-width="110">
    <wd-form-item title="物料批" prop="lotCode">
      <wd-input v-model="queryParams.lotCode" />
    </wd-form-item>
    <view class="filter-actions">
      <wd-button size="small" plain @click="navigateToSave()">
        新增
      </wd-button>
      <view class="filter-actions-right">
        <wd-button size="small" @click="resetQuery">
          重置
        </wd-button>
        <wd-button size="small" @click="handleQuery">
          查询
        </wd-button>
      </view>
    </view>
  </wd-form>

  <wd-table :data="dataArray">
    <wd-table-column prop="lotCode" label="物料批" fixed align="center" :width="160" />
    <wd-table-column prop="wgNums" label="外观抽样" align="center" :width="120" />
    <wd-table-column prop="gnNums" label="功能抽样" align="center" :width="120" />
    <wd-table-column prop="opNo" label="作业站" align="center" :width="120" />
    <wd-table-column prop="gzlType" label="灌装量采集类型" align="center" :width="180">
      <template #value="{ row }">
        {{ getOptionsLabel(gzlTypeOptions, row.gzlType) }}
      </template>
    </wd-table-column>
    <wd-table-column prop="gzlCount" label="灌装量采集次数" align="center" :width="180" />
    <wd-table-column prop="upperLimit" label="上限" align="center" :width="120" />
    <wd-table-column prop="lowerLimit" label="下限" align="center" :width="120" />
    <wd-table-column prop="gravity" label="比重" align="center" :width="120" />
    <wd-table-column prop="requirements" label="巡检要求" align="left" :width="240" />
    <wd-table-column prop="createBy" label="创建人" align="center" :width="120" />
    <wd-table-column prop="createTime" label="创建时间" align="center" :width="220" />
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
.show_search_row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
}

.filter-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.filter-actions-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
}
</style>
