<script setup lang="ts">
import type { ApiResult } from '@/types/common/apiResult'
import type { MesLot } from '@/types/production/mesLot'
import type { Aql } from '@/types/qc/aql.'
import type { CpInspection } from '@/types/qc/cpInspection'
import type { CpStandard } from '@/types/qc/cpStandard'
import type { E10Lot } from '@/types/qc/e10Lot'
import type { QcFinishedOp } from '@/types/qc/finishedOp'
import { zodAdapter } from '@wot-ui/ui'
import { z } from 'zod'
import { useGlobalLoading } from '@/composables/useGlobalLoading'
import { useGlobalToast } from '@/composables/useGlobalToast'
import http from '@/utils/request'

definePage({
  name: 'mesLotInspectionSave',
  style: {
    navigationBarTitleText: '巡检登记',
  },
})

const toast = useGlobalToast()
const loading = useGlobalLoading()
const btnLoading = ref(false)
const showLotCodePicker = ref(false)
const lotList = reactive<E10Lot[]>([])
const itemArray = reactive<any[]>([])
const form = reactive<CpInspection>({
  id: undefined,
  lotNo: '',
  lotCode: '',
  remark: '',
})
const currentMesLot = reactive<MesLot>({})// 生产批
const currentMaterialLot = reactive<E10Lot>({})// 物料批
const currentCpStandard = reactive<CpStandard>({})
const currentAql = reactive<Aql>({})
const zmArray = reactive<any[]>([])
const aqlArray = reactive<any[]>([])
const formRef = ref()
const schema = zodAdapter(
  z.object({
    lotCode: z.string().min(1, '请填写物料批'),
  }),
)
const levelOptions = reactive<any[]>([])
const zmOptions = [
  { label: 'A', value: 'A', sampleNums: 2 },
  { label: 'B', value: 'B', sampleNums: 3 },
  { label: 'C', value: 'C', sampleNums: 5 },
  { label: 'D', value: 'D', sampleNums: 8 },
  { label: 'E', value: 'E', sampleNums: 13 },
  { label: 'F', value: 'F', sampleNums: 20 },
  { label: 'G', value: 'G', sampleNums: 32 },
  { label: 'H', value: 'H', sampleNums: 50 },
  { label: 'J', value: 'J', sampleNums: 80 },
  { label: 'K', value: 'K', sampleNums: 125 },
  { label: 'L', value: 'L', sampleNums: 200 },
  { label: 'M', value: 'M', sampleNums: 315 },
  { label: 'N', value: 'N', sampleNums: 500 },
  { label: 'P', value: 'P', sampleNums: 800 },
  { label: 'Q', value: 'Q', sampleNums: 1250 },
  { label: 'R', value: 'R', sampleNums: 2000 },
]
const tabs = reactive<any[]>([])
const currentTab = ref<string>('外观')

const conclusionFlag = (row: any, key: string) => {
  const o = levelOptions.find(i => i.label === row.defectLevel)
  return Number(row.defectNums ?? 0) <= Number(o[`${key}AcNums`])
}
const levelText = (defectLevel: string) => {
  return levelOptions.find(i => i.label === defectLevel)?.value ?? '-'
}
// 根据取样数量获取字码(大于等于当前取样数量且小于下一个取样数量)
const getZmKeyByNums = (nums: number) => {
  const value = Number(nums) || 0
  if (!zmOptions.length)
    return ''

  for (let i = 0; i < zmOptions.length; i++) {
    const current = Number(zmOptions[i].sampleNums) || 0
    const next = i < zmOptions.length - 1
      ? (Number(zmOptions[i + 1].sampleNums) || Number.POSITIVE_INFINITY)
      : Number.POSITIVE_INFINITY

    if (value >= current && value < next)
      return zmOptions[i].value
  }

  return value < (Number(zmOptions[0].sampleNums) || 0)
    ? ''
    : zmOptions[zmOptions.length - 1].value
}
const confirmLot = (lotCode: string) => {
  const e10Lot = lotList.find(i => i.lotCode === lotCode)

  Object.assign(currentMaterialLot, e10Lot)
  const wgNums = Number(e10Lot?.wgNums ?? 0) || 0
  const gnNums = Number(e10Lot?.gnNums ?? 0) || 0
  const wgKey = getZmKeyByNums(wgNums)
  const gnKey = getZmKeyByNums(gnNums)

  tabs.length = 0
  tabs.push({ label: '外观', key: 'wg', value: wgNums, wgKey, types: ['外观检验'] })
  tabs.push({ label: '功能', key: 'gn', value: gnNums, gnKey, types: ['功能检验'] })

  for (const level_ of levelOptions) {
    const wgArr = aqlArray.filter(i => Number(i.step) === Number(level_.value))
    if (wgArr && wgArr[0]) {
      level_.wgAcNums = wgArr[0][wgKey]
    }
    const gnArr = aqlArray.filter(i => Number(i.step) === Number(level_.value))
    if (gnArr && gnArr[0]) {
      level_.gnAcNums = gnArr[0][gnKey]
    }
  }
}
const initMesLotMaterialLotAql = async (lotNo: string) => {
  const lotArray: E10Lot[] = await http.get(`/qc/e10Lot/all`, { lotNo })
  lotList.length = 0
  lotList.push(...lotArray)

  const lotRes: ApiResult<MesLot> = await http.get(`/production/mesLot/getByLotNo/${lotNo}`)
  if (lotRes.code === 200 && lotRes.data) {
    Object.assign(currentMesLot, lotRes.data)

    const cpStandardRes: ApiResult<CpStandard> = await http.get(`/qc/cpStandard/${currentMesLot.productNo}`)
    if (cpStandardRes.code === 200 && cpStandardRes.data) {
      const data = cpStandardRes.data
      Object.assign(currentCpStandard, data)
      if (data.levelOptions) {
        levelOptions.length = 0
        levelOptions.push(...JSON.parse(data.levelOptions))
        const aqlRes: ApiResult<Aql> = await http.get(`/qc/aql/1`)
        if (aqlRes.code === 200 && aqlRes.data) {
          const aqlData = aqlRes.data
          Object.assign(currentAql, data)
          if (aqlData.zmArray) {
            zmArray.length = 0
            zmArray.push(...JSON.parse(aqlData.zmArray))
          }
          if (aqlData.aqlArray) {
            aqlArray.length = 0
            aqlArray.push(...JSON.parse(aqlData.aqlArray))
          }
        }
      }
    }
  }
}
const init = async (id: number) => {
  if (id) {
    loading.loading('加载中...')
    try {
      const res: ApiResult<CpInspection> = await http.get(`/qc/cpInspection/${id}`)
      if (res.code === 200 && res.data) {
        const data = res.data
        form.id = data.id
        form.lotNo = data.lotNo || ''
        form.lotCode = data.lotCode || ''
        form.remark = data.remark || ''

        if (data && data.itemArray) {
          itemArray.length = 0
          itemArray.push(...JSON.parse(data?.itemArray))
        }

        await initMesLotMaterialLotAql(form.lotNo)
        await confirmLot(form.lotCode)
      }
    }
    finally {
      loading.close()
    }
  }
}
const initItem = async (lotNo: string) => {
  if (lotNo) {
    form.lotNo = lotNo
    loading.loading('加载中...')

    await initMesLotMaterialLotAql(lotNo)

    const array: any[] = []
    if (currentMesLot.opNo === 'GB') {
      const gzRes: ApiResult<QcFinishedOp> = await http.get(`/qc/finishedOp/getByParams`, { erpCode: currentMesLot.productNo, opNo: 'GZ' })
      if (gzRes.code === 200 && gzRes.data && gzRes.data.itemArray) {
        const tempArray = JSON.parse(gzRes.data?.itemArray)
        for (const item of tempArray) {
          const exists = array.some(i => i.id === item.id && i.type === item.type && i.label === item.label && i.standard === item.standard && i.method === item.method)
          if (!exists) {
            array.push(item)
          }
        }
      }
      const bzRes: ApiResult<QcFinishedOp> = await http.get(`/qc/finishedOp/getByParams`, { erpCode: currentMesLot.productNo, opNo: 'BZ' })
      if (bzRes.code === 200 && bzRes.data && bzRes.data.itemArray) {
        const tempArray = JSON.parse(bzRes.data?.itemArray)
        for (const item of tempArray) {
          const exists = array.some(i => i.id === item.id && i.type === item.type && i.label === item.label && i.standard === item.standard && i.method === item.method)
          if (!exists) {
            array.push(item)
          }
        }
      }
    }
    else {
      const params = { erpCode: currentMesLot.productNo, opNo: currentMesLot.opNo }
      const finishedOpRes: ApiResult<QcFinishedOp> = await http.get(`/qc/finishedOp/getByParams`, params)
      if (finishedOpRes.code === 200 && finishedOpRes.data && finishedOpRes.data.itemArray) {
        const tempArray = JSON.parse(finishedOpRes.data?.itemArray)
        for (const item of tempArray) {
          array.push(item)
        }
      }
    }

    itemArray.length = 0
    itemArray.push(...array
      .sort((a, b) => {
        const typeCompare = String(a.type ?? '').localeCompare(String(b.type ?? ''), 'zh-CN')
        if (typeCompare !== 0)
          return typeCompare
        return String(a.label ?? '').localeCompare(String(b.label ?? ''), 'zh-CN')
      })
      .map(item => ({
        ...item,
        defectNums: item.defectNums ?? 0,
      })))

    loading.close()
  }
}

const submit = async () => {
  const formRes = await formRef.value?.validate()
  if (formRes.valid) {
    btnLoading.value = true
    try {
      const params: CpInspection = {
        id: form.id,
        lotNo: form.lotNo,
        lotCode: form.lotCode,
        remark: form.remark,
      }

      params.itemArray = JSON.stringify(itemArray)

      const res: ApiResult<any> = form.id
        ? await http.put('/qc/cpInspection', params)
        : await http.post('/qc/cpInspection', params)

      if (res.code === 200) {
        toast.success({
          msg: form.id ? '修改成功' : '新增成功',
          closed() {
            uni.navigateBack().then(() => {
              uni.$emit('refreshMesLotInspection')
              uni.$emit('refreshMesLot')
            })
          },
        })
      }
      else {
        toast.error(res.msg || '提交失败')
      }
    }
    finally {
      btnLoading.value = false
    }
  }
}

let eventChannel: UniApp.EventChannel | null = null

onLoad(() => {
  const instance = getCurrentInstance() as any
  const pageVm = instance?.proxy as any
  eventChannel = pageVm?.getOpenerEventChannel?.() ?? null
  eventChannel?.on('init', init)
  eventChannel?.on('initItem', initItem)
})

onUnload(() => {
  eventChannel?.off('init', init)
  eventChannel?.off('initItem', initItem)
  eventChannel = null
})
</script>

<template>
  <wd-select-picker
    v-model="form.lotCode"
    v-model:visible="showLotCodePicker"
    type="radio"
    :columns="lotList"
    label-key="lotCode"
    value-key="lotCode"
    @confirm="confirmLot($event.value)"
  />

  <wd-form ref="formRef" :model="form" :schema="schema" :title-width="110">
    <wd-form-item title="生产批" prop="lotNo">
      {{ form.lotNo }}
    </wd-form-item>
    <wd-form-item
      title="物料批"
      prop="lotCode"
      :value="form.lotCode"
      is-link
      placeholder="请选择物料批"
      @click="showLotCodePicker = true"
    />
    <wd-form-item title="备注" prop="remark">
      <wd-input v-model="form.remark" />
    </wd-form-item>
  </wd-form>

  <wd-tabs v-model="currentTab">
    <block v-for="tab in tabs" :key="tab.label">
      <wd-tab :title="`${tab.label}(${tab.value})`">
        <wd-divider>质量限</wd-divider>
        <view v-if="levelOptions.length" class="aql-grid">
          <view class="aql-grid__row aql-grid__row--head">
            <view class="aql-grid__cell aql-grid__cell--left" />
            <view v-for="item in levelOptions" :key="`level_h_${item.label}`" class="aql-grid__cell">
              {{ item.label === '0' ? '零缺陷 (0)' : item.label === 'A' ? '严重缺陷 (A)' : item.label === 'B' ? '主要缺陷 (B)' : item.label === 'C' ? '轻微缺陷 (C)' : item.label }}
            </view>
          </view>
          <view class="aql-grid__row">
            <view class="aql-grid__cell aql-grid__cell--left">
              缺陷等级
            </view>
            <view v-for="item in levelOptions" :key="`level_v_${item.label}`" class="aql-grid__cell">
              {{ item.value ?? '-' }}
            </view>
          </view>
          <view class="aql-grid__row">
            <view class="aql-grid__cell aql-grid__cell--left">
              AC
            </view>
            <view v-for="item in levelOptions" :key="`level_v_${item.label}`" class="aql-grid__cell">
              {{ item[`${tab.key}AcNums`] ?? '-' }}
            </view>
          </view>
        </view>

        <wd-divider>检验项目</wd-divider>

        <wd-table :data="itemArray.filter(i => tab.types.includes(i.type))">
          <wd-table-column prop="" label="" fixed align="center" :width="50">
            <template #value>
              <wd-icon name="minus-circle" />
            </template>
          </wd-table-column>
          <wd-table-column prop="type" label="检验类别" fixed align="center" :width="100" />
          <wd-table-column prop="label" label="检验项目" align="center" :width="180" />
          <wd-table-column prop="standard" label="检验标准" align="center" :width="320" />
          <wd-table-column prop="defectLevel" label="缺陷等级" align="center" :width="100" />
          <wd-table-column prop="" label="AQL值" align="center" :width="80">
            <template #value="{ row }">
              {{ levelText(row.defectLevel) }}
            </template>
          </wd-table-column>
          <wd-table-column prop="defectNums" label="次品数量" align="center" :width="120">
            <template #value="{ row }">
              <wd-input v-model="row.defectNums" type="number" />
            </template>
          </wd-table-column>
          <wd-table-column prop="" label="结论" align="center" :width="120">
            <template #value="{ row }">
              <text v-if="conclusionFlag(row, tab.key)" class="result-text result-text--pass">
                合格
              </text>
              <text v-else class="result-text result-text--fail">
                不合格
              </text>
            </template>
          </wd-table-column>
        </wd-table>
      </wd-tab>
    </block>
  </wd-tabs>

  <view class="bottom-btn">
    <wd-button block :loading="btnLoading" @click="submit">
      提交
    </wd-button>
  </view>
</template>

<style lang="scss" scoped>
.aql-grid {
  border: 1rpx solid var(--wot-border-color-lighter, #e4e7ed);
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
  background: var(--wot-bg-color, #ffffff);
}

.aql-grid__row {
  display: flex;
}

.aql-grid__row + .aql-grid__row {
  border-top: 1rpx solid var(--wot-border-color-lighter, #e4e7ed);
}

.aql-grid__row--head {
  background: var(--wot-fill-color-light, #f5f7fa);
}

.aql-grid__cell {
  flex: 1;
  min-height: 72rpx;
  padding: 10rpx 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 24rpx;
  line-height: 1.4;
  color: var(--wot-text-title, #303133);
  background: var(--wot-bg-color, #ffffff);
  border-right: 1rpx solid var(--wot-border-color-lighter, #e4e7ed);
}

.aql-grid__cell:last-child {
  border-right: none;
}

.aql-grid__cell--left {
  font-weight: 600;
  color: var(--wot-text-title, #303133);
  background: var(--wot-bg-color-page, #f7f8fa);
}

.result-text {
  font-weight: 600;
}

.result-text--pass {
  color: var(--wot-color-success, #67c23a);
}

.result-text--fail {
  color: var(--wot-color-danger, #f56c6c);
}
</style>
