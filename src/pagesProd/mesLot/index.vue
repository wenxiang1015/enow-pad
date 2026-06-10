<script setup lang="ts">
import type { Options } from '@/types/common/options'
import type { TableData } from '@/types/common/tableData'
import type { MesLot } from '@/types/production/mesLot'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import { reactive, ref } from 'vue'
import http from '@/utils/request'
import { getOptionsLabel, hasRole } from '@/utils/tools'

// definePage({
//   name: 'mesLot',
//   style: {
//     navigationBarTitleText: 'mes生产批',
//     enablePullDownRefresh: true,
//   },
// })

const showFactoryPicker = ref(false)
const showMb005Picker = ref(false)
const showTypePicker = ref(false)
const showWipDatePicker = ref(false)
const factoryOptions: Options[] = [
  { value: 'COMPANY_YN', label: '宜侬' },
  { value: 'COMPANY_YC', label: '瀛彩' },
]
const mb005Options: Options[] = [
  { label: '生产辅料', value: '109' },
  { label: '预制原料', value: '108' },
  { label: '预制包材', value: '107' },
  { label: '原料', value: '105' },
  { label: '包材', value: '104' },
  { label: '半成品', value: '103' },
  { label: '裸装品', value: '102' },
  { label: '成品', value: '101' },
]
const typeOptions: Options[] = [
  { value: 'production', label: '生产' },
  { value: 'makeUp', label: '配制' },
]
// alova 查询条件不支持嵌套 params
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  lotNo: '',
  factory: '',
  mb005: '',
  roNo: '',
  productNo: '',
  productName: '',
  customerNo: '',
  type: '',
  scheduleCode: '',
  startTime: '',
  endTime: '',
})
const wipDateRange = ref<[string, string]>(['', ''])
const dataArray = reactive<MesLot[]>([])
const total = ref(0)
const btnLoading = ref(false)
const showSearch = ref(false)
const auditTypeOptions = [
  { label: '清洁', value: 'clean' },
  { label: '消毒', value: 'disinfection' },
  { label: '所有', value: '' },
]
const auditTypeCountMap = reactive<Record<string, number>>({})
const currentType = ref<string>('')// 审核查询类型

const navigateToLot = (row: MesLot) => {
  uni.navigateTo({
    url: '/pagesProd/mesLot/lot/index',
    success: (res) => {
      res.eventChannel.emit('init', row.lotNo)
    },
  })
}
const navigateToDay = (row: MesLot) => {
  uni.navigateTo({
    url: '/pagesProd/mesLot/day/list',
    success: (res) => {
      res.eventChannel.emit('init', row.lotNo)
    },
  })
}
const navigateToEquipment = (row: MesLot) => {
  uni.navigateTo({
    url: '/pagesProd/mesLot/equipment',
    success: (res) => {
      res.eventChannel.emit('init', row.id)
    },
  })
}
const navigateToMaterial = (row: MesLot) => {
  uni.navigateTo({
    url: '/pagesProd/mesLot/material',
    success: (res) => {
      res.eventChannel.emit('init', row.id)
    },
  })
}
const navigateTo = (row: MesLot, type: string) => {
  uni.navigateTo({
    url: '/pagesProd/mesLot/df',
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
const getList = async () => {
  btnLoading.value = true
  try {
    const params = {
      ...queryParams,
      startTime: wipDateRange.value[0]
        ? dayjs(wipDateRange.value[0]).format('YYYY-MM-DD')
        : '',
      endTime: wipDateRange.value[1]
        ? dayjs(wipDateRange.value[1]).format('YYYY-MM-DD')
        : '',
      auditType: '',
    }
    if (currentType.value) {
      params.auditType = currentType.value
    }
    const [listRes, countRes] = await Promise.all([
      http.get('/production/mesLot/list', params) as Promise<TableData<MesLot>>,
      http.get('/production/mesLot/auditTypeCount') as Promise<Record<string, number>>,
    ])
    dataArray.length = 0
    for (const item of listRes?.rows || []) {
      item.openJson = item.openJson ? JSON.parse(item.openJson) : ''
      item.cleanJson = item.cleanJson ? JSON.parse(item.cleanJson) : ''
      item.disinfectionJson = item.disinfectionJson ? JSON.parse(item.disinfectionJson) : ''
      item.revJson = item.revJson ? JSON.parse(item.revJson) : ''
      item.firstJson = item.firstJson ? JSON.parse(item.firstJson) : ''
      item.closeJson = item.closeJson ? JSON.parse(item.closeJson) : ''
    }
    if (countRes.code === 200 && countRes.data) {
      const data = countRes.data
      auditTypeCountMap.open = data.open || 0
      auditTypeCountMap.clean = data.clean || 0
      auditTypeCountMap.disinfection = data.disinfection || 0
      auditTypeCountMap.first = data.first || 0
      auditTypeCountMap.close = data.close || 0
    }
    dataArray.push(...(listRes?.rows || []))
    total.value = listRes?.total
  }
  finally {
    btnLoading.value = false
  }
}
const handleQuery = async () => {
  queryParams.pageNum = 1
  await getList()
}
const currentTypeChange = async () => {
  await handleQuery()
}
const resetQuery = async () => {
  queryParams.lotNo = ''
  queryParams.factory = ''
  queryParams.mb005 = ''
  queryParams.roNo = ''
  queryParams.productNo = ''
  queryParams.productName = ''
  queryParams.customerNo = ''
  queryParams.type = ''
  queryParams.scheduleCode = ''
  queryParams.startTime = ''
  queryParams.endTime = ''
  wipDateRange.value = ['', '']
  await handleQuery()
}
const pageChange = async (e: any) => {
  queryParams.pageNum = e.value
  await getList()
}
const handleRefresh = async () => {
  await getList()
  uni.stopPullDownRefresh()
}

onLoad(async () => {
  uni.$on('refreshMesLot', handleRefresh)
  await getList()
})
onUnload(() => {
  uni.$off('refreshMesLot')
})
onPullDownRefresh(handleRefresh)
</script>

<template>
  <wd-select-picker
    v-model="queryParams.factory"
    v-model:visible="showFactoryPicker"
    type="radio"
    :columns="factoryOptions"
  />
  <wd-select-picker
    v-model="queryParams.mb005"
    v-model:visible="showMb005Picker"
    type="radio"
    :columns="mb005Options"
  />
  <wd-select-picker
    v-model="queryParams.type"
    v-model:visible="showTypePicker"
    type="radio"
    :columns="typeOptions"
  />
  <wd-datetime-picker
    v-model="wipDateRange"
    v-model:visible="showWipDatePicker"
  />
  <view class="show_search_row">
    <wd-button size="small" plain @click="showSearch = !showSearch">
      {{ showSearch ? "收起筛选" : "展开筛选" }}
    </wd-button>
    <wd-button size="small" :loading="btnLoading" @click="handleQuery">
      刷新
    </wd-button>
  </view>

  <wd-form v-if="showSearch" :model="queryParams" :title-width="110">
    <wd-form-item title="批次" prop="lotNo">
      <wd-input v-model="queryParams.lotNo" />
    </wd-form-item>
    <wd-form-item
      title="工厂"
      :value="getOptionsLabel(factoryOptions, queryParams.factory)"
      is-link
      prop="factory"
      @click="showFactoryPicker = true"
    />
    <wd-form-item
      title="工单类型"
      :value="getOptionsLabel(mb005Options, queryParams.mb005)"
      is-link
      prop="mb005"
      @click="showMb005Picker = true"
    />
    <wd-form-item title="MES订单号" prop="roNo">
      <wd-input v-model="queryParams.roNo" />
    </wd-form-item>
    <wd-form-item title="品号" prop="productNo">
      <wd-input v-model="queryParams.productNo" />
    </wd-form-item>
    <wd-form-item title="产品品名" prop="productName">
      <wd-input v-model="queryParams.productName" />
    </wd-form-item>
    <wd-form-item title="客户编号" prop="customerNo">
      <wd-input v-model="queryParams.customerNo" />
    </wd-form-item>
    <wd-form-item
      title="类型"
      :value="getOptionsLabel(typeOptions, queryParams.type)"
      is-link
      prop="type"
      @click="showTypePicker = true"
    />
    <wd-form-item title="工单编号" prop="scheduleCode">
      <wd-input v-model="queryParams.scheduleCode" />
    </wd-form-item>
    <wd-form-item
      title="开批日期"
      :value="`${queryParams.startTime}--${queryParams.endTime}`"
      is-link
      prop="startTime"
      @click="showWipDatePicker = true"
    />

    <view class="filter-actions">
      <wd-radio-group v-model="currentType" type="button" @change="currentTypeChange">
        <wd-badge
          v-for="item in auditTypeOptions"
          :key="item.value || 'all'"
          custom-class="badge"
          :value="item.value ? (auditTypeCountMap[item.value] || 0) : ''"
        >
          <wd-radio :value="item.value">
            {{ item.label }}
          </wd-radio>
        </wd-badge>
      </wd-radio-group>
      <view>
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
    <wd-table-column
      prop="lotNo"
      label="批次"
      fixed
      align="center"
      :width="180"
    />
    <wd-table-column
      prop="productNo"
      fixed
      label="品号"
      align="center"
      :width="80"
    />
    <wd-table-column prop="productName" fixed label="品名" :width="320">
      <template #value="{ row: item }">
        <view class="page-mes-lot__cell page-mes-lot__cell--left">
          <text class="page-mes-lot__cell-text">
            {{ item.productName || "-" }}
          </text>
        </view>
      </template>
    </wd-table-column>
    <wd-table-column prop="factory" label="工厂" align="center" width="120px">
      <template #value="{ row: item }">
        {{ getOptionsLabel(factoryOptions, item.factory) || "-" }}
      </template>
    </wd-table-column>
    <wd-table-column
      prop="wipTime"
      label="开批时间"
      align="center"
      :width="160"
    >
      <template #value="{ row }">
        {{ row.wipTime || "-" }}
      </template>
    </wd-table-column>
    <wd-table-column
      prop="customerOrderNo"
      label="sap订单号"
      align="center"
      :width="160"
    >
      <template #value="{ row }">
        {{ row.customerOrderNo || "-" }}
      </template>
    </wd-table-column>
    <wd-table-column prop="roNo" label="mes订单号" align="center" :width="160">
      <template #value="{ row }">
        {{ row.roNo && row.roNo !== "N/A" ? row.roNo : "-" }}
      </template>
    </wd-table-column>
    <wd-table-column
      prop="customerName"
      label="客户名称"
      align="center"
      :width="160"
    >
      <template #value="{ row }">
        {{ row.customerName || "-" }}
      </template>
    </wd-table-column>
    <wd-table-column
      prop="inNums"
      label="计划生产数量"
      align="center"
      :width="150"
    >
      <template #value="{ row }">
        {{ row.inNums ?? "-" }}
      </template>
    </wd-table-column>
    <wd-table-column prop="type" label="类型" align="center" width="120px">
      <template #value="{ row }">
        {{ getOptionsLabel(typeOptions, row.type) || "-" }}
      </template>
    </wd-table-column>
    <wd-table-column
      prop="moStartDate"
      label="工单开始日期"
      align="center"
      :width="160"
    />
    <wd-table-column
      prop="moEndDate"
      label="工单结束日期"
      align="center"
      :width="160"
    />
    <wd-table-column
      prop=""
      label="物料批"
      align="center"
      width="100px"
    >
      <template #value="{ row: item }">
        <view @click="navigateToLot(item)">
          <wd-icon name="edit" color="var(--wot-text-secondary)" />
        </view>
      </template>
    </wd-table-column>
    <wd-table-column
      prop=""
      label="生产排班"
      align="center"
      width="100px"
    >
      <template #value="{ row: item }">
        <view @click="navigateToDay(item)">
          <wd-icon name="list" color="var(--wot-text-secondary)" />
        </view>
      </template>
    </wd-table-column>
    <wd-table-column
      prop="cleanJson"
      label="清洁"
      align="center"
      width="100px"
    >
      <template #value="{ row }">
        <view @click="navigateTo(row, 'clean')">
          <template v-if="row.cleanJson && hasRole('app:production:qc')">
            <wd-icon v-if="row.cleanJson.conclusion === '符合'" name="check" color="var(--wot-success-main)" />
            <wd-icon v-else-if="row.cleanJson.conclusion === '不符合'" name="close" color="var(--wot-danger-main)" />
            <wd-icon v-else name="stamp" color="var(--wot-warning-main)" />
          </template>
          <wd-icon v-if="hasRole('app:production:prod')" name="edit" color="var(--wot-text-secondary)" />
        </view>
      </template>
    </wd-table-column>
    <wd-table-column
      prop="disinfectionJson"
      label="消毒"
      align="center"
      width="100px"
    >
      <template #value="{ row }">
        <view @click="navigateTo(row, 'disinfection')">
          <template v-if="row.disinfectionJson && hasRole('app:production:qc')">
            <wd-icon v-if="row.disinfectionJson.conclusion === '符合'" name="check" color="var(--wot-success-main)" />
            <wd-icon v-else-if="row.disinfectionJson.conclusion === '不符合'" name="close" color="var(--wot-danger-main)" />
            <wd-icon v-else name="stamp" color="var(--wot-warning-main)" />
          </template>
          <wd-icon v-if="hasRole('app:production:prod')" name="edit" color="var(--wot-text-secondary)" />
        </view>
      </template>
    </wd-table-column>
    <wd-table-column
      v-if="hasRole('app:production:qc')"
      prop="revJson"
      label="清洁消毒检查"
      align="center"
      width="120px"
    >
      <template #value="{ row }">
        <view @click="navigateTo(row, 'rev')">
          <template v-if="row.revJson">
            <wd-icon v-if="row.revJson.conclusion === '符合'" name="check" color="var(--wot-success-main)" />
            <wd-icon v-else-if="row.revJson.conclusion === '不符合'" name="close" color="var(--wot-danger-main)" />
            <wd-icon v-else name="stamp" color="var(--wot-warning-main)" />
          </template>
          <wd-icon v-else name="edit" color="var(--wot-text-secondary)" />
        </view>
      </template>
    </wd-table-column>
    <wd-table-column
      prop=""
      label="设备点检"
      align="center"
      width="100px"
    >
      <template #value="{ row }">
        <view @click="navigateToEquipment(row)">
          <wd-icon v-if="row.equipmentJson" name="check" color="var(--wot-success-main)" />
          <wd-icon v-else name="edit" color="var(--wot-text-secondary)" />
        </view>
      </template>
    </wd-table-column>
    <wd-table-column
      prop=""
      label="物料点检"
      align="center"
      width="100px"
    >
      <template #value="{ row }">
        <view @click="navigateToMaterial(row)">
          <wd-icon v-if="row.wlJson" name="check" color="var(--wot-success-main)" />
          <wd-icon v-else name="edit" color="var(--wot-text-secondary)" />
        </view>
      </template>
    </wd-table-column>
  </wd-table>

  <wd-pagination
    v-model="queryParams.pageNum"
    :total="total"
    @change="pageChange"
  />
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
</style>
