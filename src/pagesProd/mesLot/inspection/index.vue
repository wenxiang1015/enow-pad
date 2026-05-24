<script setup lang="ts">
import type { ApiResult } from '@/types/common/apiResult'
import type { TableData } from '@/types/common/tableData'
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
const showSearch = ref(true)
const currentLotNo = ref<string>()

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
      lotNo: currentLotNo.value,
    }
    const res: TableData<CpInspection> = await http.get('/qc/cpInspection/list', params)
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

const navigateToSave = (row?: CpInspection) => {
  uni.navigateTo({
    url: '/pagesProd/mesLot/inspection/save',
    success: (res) => {
      if (row) {
        res.eventChannel.emit('init', Number(row?.id))
      }
      else {
        res.eventChannel.emit('initItem', currentLotNo.value)
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
    <wd-form-item title="生产批" prop="lotNo">
      <wd-input v-model="queryParams.lotNo" />
    </wd-form-item>
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
    <wd-table-column prop="lotNo" label="生产批" fixed align="center" :width="220" />
    <wd-table-column prop="lotCode" label="物料批" fixed align="center" :width="220" />
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
