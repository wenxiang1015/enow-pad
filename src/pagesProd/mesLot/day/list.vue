<script setup lang="ts">
import type { Options } from '@/types/common/options'
import type { TableData } from '@/types/common/tableData'
import type { MesLot } from '@/types/production/mesLot'
import type { MesLotDayLine } from '@/types/production/mesLotDayLine'
import dayjs from 'dayjs'
import http from '@/utils/request'

interface JsonValue {
  conclusion?: string
}

definePage({
  name: 'mesLotDay',
  style: {
    navigationBarTitleText: '生产排班列表',
  },
})

const btnLoading = ref(false)
const showSearch = ref(true)
const currentLotNo = ref<string>()
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  lotNo: '',
  lotCode: '',
  workDate: '',
  sailings: '',
  lineNo: '',
})
const dataArray = ref<MesLotDayLine[]>([])
const total = ref(0)
const showWorkDatePicker = ref(false)
const showSailingsPicker = ref(false)
const sailingsOptions: Options[] = [
  { value: '0', label: '白班' },
  { value: '1', label: '晚班' },
]

const getJsonConclution = (value?: string) => {
  if (!value)
    return ''
  try {
    return (JSON.parse(value) as JsonValue).conclusion || ''
  }
  catch {
    return ''
  }
}
const navigateTo = (row: MesLot, type: string) => {
  uni.navigateTo({
    url: '/pagesProd/mesLot/day/df',
    success: (res) => {
      const params = {
        id: row.id,
        type,
        auditFlag: false,
      }
      if (hasRole('app:production:qc') && type !== 'rev') {
        params.auditFlag = true
      }
      res.eventChannel.emit('init', params)
    },
  })
}
const navigateToInspection = (row: MesLot) => {
  uni.navigateTo({
    url: '/pagesProd/mesLot/inspection/index',
    success: (res) => {
      res.eventChannel.emit('init', row.lotNo)
    },
  })
}
const workDateText = computed(() => {
  if (!queryParams.workDate)
    return ''
  if (typeof queryParams.workDate === 'number')
    return dayjs(queryParams.workDate).format('YYYY-MM-DD')
  return queryParams.workDate
})
const getList = async () => {
  btnLoading.value = true
  try {
    const params = {
      ...queryParams,
      lotNo: currentLotNo.value,
    }
    const res: TableData<MesLotDayLine> = await http.get('/production/mesLotDayLine/list', params)
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
  queryParams.workDate = ''
  queryParams.sailings = ''
  queryParams.lineNo = ''
  await handleQuery()
}

const pageChange = async (e: any) => {
  queryParams.pageNum = e.value
  await getList()
}

let eventChannel: UniApp.EventChannel | null = null

onLoad(() => {
  uni.$on('refreshMesLotDay', getList)
  const instance = getCurrentInstance() as any
  const pageVm = instance?.proxy as any
  eventChannel = pageVm?.getOpenerEventChannel?.() ?? null
  eventChannel?.on('init', init)
})

onUnload(() => {
  uni.$off('refreshMesLotDay', getList)
  eventChannel?.off('init', init)
  eventChannel = null
})
</script>

<template>
  <wd-select-picker
    v-model="queryParams.sailings"
    v-model:visible="showSailingsPicker"
    type="radio"
    :columns="sailingsOptions"
  />
  <wd-datetime-picker
    v-model="queryParams.workDate"
    v-model:visible="showWorkDatePicker"
    type="date"
  />
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
    <wd-form-item
      title="日期"
      prop="workDate"
      is-link
      :value="workDateText"
      @click="showWorkDatePicker = true"
    />
    <wd-form-item
      title="班次"
      :value="getOptionsLabel(sailingsOptions, queryParams.sailings)"
      is-link
      prop="sailings"
      @click="showSailingsPicker = true"
    />
    <wd-form-item title="线号" prop="lineNo">
      <wd-input v-model="queryParams.lineNo" />
    </wd-form-item>
    <view class="filter-actions">
      <!-- <wd-button size="small" plain @click="navigateToSave()">
        新增
      </wd-button> -->
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
    <wd-table-column prop="lotNo" label="生产批" fixed align="center" :width="160" />
    <wd-table-column prop="lotCode" label="物料批" align="center" :width="160" />
    <wd-table-column prop="workDate" label="日期" align="center" :width="140" />
    <wd-table-column prop="sailings" label="班次" align="center" width="120px">
      <template #value="{ row: item }">
        {{ getOptionsLabel(sailingsOptions, item.sailings) || "-" }}
      </template>
    </wd-table-column>
    <wd-table-column prop="lineNo" label="线号" align="center" :width="120" />
    <wd-table-column prop="openJson" label="开线" align="center" :width="120">
      <template #value="{ row }">
        <view @click="navigateTo(row, 'open')">
          <wd-icon v-if="getJsonConclution(row.openJson) === '符合'" name="check" color="var(--wot-success-main)" />
          <wd-icon v-else-if="getJsonConclution(row.openJson) === '不符合'" name="close" color="var(--wot-danger-main)" />
          <wd-icon v-else-if="row.openJson" name="stamp" color="var(--wot-warning-main)" />
          <wd-icon v-else name="edit" color="var(--wot-text-secondary)" />
        </view>
      </template>
    </wd-table-column>
    <wd-table-column prop="firstJson" label="首件" align="center" :width="120">
      <template #value="{ row }">
        <view @click="navigateTo(row, 'first')">
          <wd-icon v-if="getJsonConclution(row.firstJson) === '符合'" name="check" color="var(--wot-success-main)" />
          <wd-icon v-else-if="getJsonConclution(row.firstJson) === '不符合'" name="close" color="var(--wot-danger-main)" />
          <wd-icon v-else-if="row.firstJson" name="stamp" color="var(--wot-warning-main)" />
          <wd-icon v-else name="edit" color="var(--wot-text-secondary)" />
        </view>
      </template>
    </wd-table-column>
    <wd-table-column prop="closeJson" label="清线" align="center" :width="120">
      <template #value="{ row }">
        <view @click="navigateTo(row, 'close')">
          <wd-icon v-if="getJsonConclution(row.closeJson) === '符合'" name="check" color="var(--wot-success-main)" />
          <wd-icon v-else-if="getJsonConclution(row.closeJson) === '不符合'" name="close" color="var(--wot-danger-main)" />
          <wd-icon v-else-if="row.closeJson" name="stamp" color="var(--wot-warning-main)" />
          <wd-icon v-else name="edit" color="var(--wot-text-secondary)" />
        </view>
      </template>
    </wd-table-column>
    <wd-table-column
      v-if="hasRole('app:production:qc')"
      prop=""
      label="品质巡检"
      align="center"
      width="100px"
    >
      <template #value="{ row: item }">
        <view v-if="['101', '102'].includes(item.mb005) && item.opNo" @click="navigateToInspection(item)">
          <wd-icon v-if="item.inspectionJson" name="check" color="var(--wot-success-main)" />
          <wd-icon v-else name="edit" color="var(--wot-text-secondary)" />
        </view>
      </template>
    </wd-table-column>
    <wd-table-column prop="createBy" label="创建人" align="center" :width="120" />
    <wd-table-column prop="createTime" label="创建时间" align="center" :width="220" />
    <!-- <wd-table-column prop="id" label="操作" align="center" :width="220">
      <template #value="{ row }">
        <wd-button size="small" @click="navigateToSave(row)">
          修改
        </wd-button>
        <wd-button size="small" custom-class="delete-btn" @click="handleDelete(row)">
          删除
        </wd-button>
      </template>
    </wd-table-column> -->
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
