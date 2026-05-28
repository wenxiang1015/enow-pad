<script setup lang="ts">
import type { ApiResult } from '@/types/common/apiResult'
import type { MesLot } from '@/types/production/mesLot'
import type { Aql } from '@/types/qc/aql.'
import type { CpInspection } from '@/types/qc/cpInspection'
import type { CpStandard } from '@/types/qc/cpStandard'
import type { E10Lot } from '@/types/qc/e10Lot'
import { zodAdapter } from '@wot-ui/ui'
import { z } from 'zod'
import { useGlobalLoading } from '@/composables/useGlobalLoading'
import { useGlobalToast } from '@/composables/useGlobalToast'
import http from '@/utils/request'

// definePage({
//   name: 'mesLotInspectionSave',
//   style: {
//     navigationBarTitleText: '巡检登记',
//   },
// })

const toast = useGlobalToast()
const loading = useGlobalLoading()
const btnLoading = ref(false)
const showLotCodePicker = ref(false)
const lotList = reactive<E10Lot[]>([])
const itemArray = reactive<any[]>([])
const qbArray = reactive<any[]>([])// 启泵测试
const jhlArray = reactive<any[]>([])// 净含量
const form = reactive<CpInspection>({
  id: undefined,
  lotNo: '',
  lotCode: '',
  remark: '',
  wgConclusion: '合格',
  gnConclusion: '合格',
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
const gzlTypeOptions = [
  { label: '只填净重', value: '0' },
  { label: '净重+瓶重(毛重系统计算)', value: '1' },
  { label: '瓶重+毛重(净重系统计算)', value: '2' },
]

const navigateBack = () => {
  uni.navigateBack()
}
const computeGzlRow = (row: any) => {
  const values = Object.keys(row)
    .filter(key => key.startsWith('c_'))
    .map(key => row[key])
    .filter(value => value !== '' && value !== null && value !== undefined)
    .map(value => Number(value))
    .filter(value => !Number.isNaN(value))

  if (!values.length) {
    row.max = undefined
    row.min = undefined
    row.avg = undefined
    return
  }

  row.max = Math.max(...values)
  row.min = Math.min(...values)
  row.avg = Number((values.reduce((sum, current) => sum + current, 0) / values.length).toFixed(2))
}

const clampByLotLimit = (value: number) => {
  const upper = Number(currentMaterialLot.upperLimit)
  const lower = Number(currentMaterialLot.lowerLimit)

  if (Number.isNaN(value))
    return undefined

  if (!Number.isNaN(lower) && value < lower)
    return lower
  if (!Number.isNaN(upper) && value > upper)
    return upper
  return value
}

const computeGzlColumn = (colIndex: number) => {
  const bwRow = jhlArray.find(i => i.value === 'bw')
  const gwRow = jhlArray.find(i => i.value === 'gw')
  const nwRow = jhlArray.find(i => i.value === 'nw')
  const vRow = jhlArray.find(i => i.value === 'v')
  const key = `c_${colIndex}`

  const bw = Number(bwRow?.[key])
  const gw = Number(gwRow?.[key])
  const nw = Number(nwRow?.[key])

  let computedNw: number | undefined

  // gzlType=0: 只填净重 -> 直接使用净重，仅计算体积
  if (currentMaterialLot.gzlType === '0') {
    if (!Number.isNaN(nw))
      computedNw = nw
  }

  // gzlType=2: 瓶重 + 毛重 -> 净重 = 毛重 - 瓶重
  if (currentMaterialLot.gzlType === '2') {
    if (!Number.isNaN(bw) && !Number.isNaN(gw))
      computedNw = Number((gw - bw).toFixed(2))
  }

  // gzlType=1: 净重 + 瓶重 -> 毛重 = 净重 + 瓶重
  if (currentMaterialLot.gzlType === '1') {
    if (!Number.isNaN(bw) && !Number.isNaN(nw)) {
      const computedGw = Number((nw + bw).toFixed(2))
      if (gwRow)
        gwRow[key] = computedGw
      computedNw = nw
    }
  }

  if (nwRow)
    nwRow[key] = computedNw

  const gravity = Number(currentMaterialLot.gravity)
  if (vRow) {
    if (computedNw !== undefined && !Number.isNaN(gravity) && gravity !== 0)
      vRow[key] = Number((computedNw / gravity).toFixed(2))
    else
      vRow[key] = undefined
  }

  for (const row of jhlArray)
    computeGzlRow(row)
}
// 校验上下限(TODO 也是因为 wd-input 内部的组件交互性,这里的只有第一次显示成红色了,暂时不用了)
// const checkGzlInputError = (row: any, colIndex: number) => {
//   const key = `c_${colIndex}`
//   const value = Number(row[key])
//   const upper = Number(currentMaterialLot.upperLimit)
//   const lower = Number(currentMaterialLot.lowerLimit)

//   if (Number.isNaN(value))
//     return false

//   return (
//     (!Number.isNaN(lower) && value < lower)
//     || (!Number.isNaN(upper) && value > upper)
//   )
// }

const handleGzlInput = (row: any, colIndex: number) => {
  const key = `c_${colIndex}`
  const num = Number(row[key])
  if (Number.isNaN(num)) {
    row[key] = undefined
  }
  else {
    // TODO 因为 wd-input 内部的组件交互性,这里的赋值不起作用,暂时先不处理,目前用错误样式提示出来了
    row[key] = clampByLotLimit(Number(num.toFixed(2)))
  }
  // console.log(row[key])
  computeGzlColumn(colIndex)
}
const computeRow = (row: any, key: string) => {
  const o = levelOptions.find(i => i.label === row.defectLevel)
  row.conclusion = Number(row.defectNums ?? 0) <= Number(o[`${key}AcNums`]) ? '合格' : '不合格'
  let conclusion = '合格'
  for (const item of itemArray) {
    if (item.type === row.type && item.label === row.label) {
      conclusion = item.conclusion
      break
    }
  }
  form[`${key}Conclusion`] = conclusion
}
const addItem = (array: any[]) => {
  array.push({
    value: '',
  })
}
const delItem = (array: any[], index: number) => {
  array.splice(index, 1)
}
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
  tabs.push({ label: '外观', key: 'wg', value: wgNums, wgKey, types: ['外观检验', '感官指标'] })
  tabs.push({ label: '功能', key: 'gn', value: gnNums, gnKey, types: ['功能检验', '包装防护'] })

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
  // 改成从批次中获取当时的项目,不在实时获取最新的检测项目
  const array: any[] = currentMaterialLot.itemArray ? JSON.parse(currentMaterialLot.itemArray) : []
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
  for (const item of itemArray) { // 初始化结论
    item.conclusion = null
  }

  // 获取灌装量采集次数(类型只在页面渲染时使用)
  const gzlTypeArray = [
    { label: '毛重', value: 'gw' },
    { label: '瓶重', value: 'bw' },
    { label: '净重', value: 'nw' },
    { label: '体积', value: 'v' },
  ]
  jhlArray.length = 0
  for (const item of gzlTypeArray) {
    const o = {
      label: item.label,
      value: item.value,
      min: undefined,
      max: undefined,
      avg: undefined,
    }
    for (let i = 0; i < currentMaterialLot.gzlCount; i++) {
      o[`c_${i}`] = undefined
    }
    jhlArray.push(o)
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
        if (data) {
          form.id = data.id
          form.lotNo = data.lotNo || ''
          form.lotCode = data.lotCode || ''
          form.remark = data.remark || ''

          await initMesLotMaterialLotAql(form.lotNo)
          await confirmLot(form.lotCode)
          // 顺序不要动
          if (data.itemArray) {
            itemArray.length = 0
            itemArray.push(...JSON.parse(data?.itemArray))
          }

          if (data.jhlArray) {
            jhlArray.length = 0
            jhlArray.push(...JSON.parse(data?.jhlArray))
          }

          if (data.qbArray) {
            qbArray.length = 0
            qbArray.push(...JSON.parse(data?.qbArray))
          }
        }
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

    // if (currentMesLot.opNo === 'GB') {
    //   const gzRes: ApiResult<QcFinishedOp> = await http.get(`/qc/finishedOp/getByParams`, { erpCode: currentMesLot.productNo, opNo: 'GZ' })
    //   if (gzRes.code === 200 && gzRes.data && gzRes.data.itemArray) {
    //     const tempArray = JSON.parse(gzRes.data?.itemArray)
    //     for (const item of tempArray) {
    //       const exists = array.some(i => i.itemId === item.itemId)
    //       if (!exists) {
    //         array.push(item)
    //       }
    //     }
    //   }
    //   const bzRes: ApiResult<QcFinishedOp> = await http.get(`/qc/finishedOp/getByParams`, { erpCode: currentMesLot.productNo, opNo: 'BZ' })
    //   if (bzRes.code === 200 && bzRes.data && bzRes.data.itemArray) {
    //     const tempArray = JSON.parse(bzRes.data?.itemArray)
    //     for (const item of tempArray) {
    //       const exists = array.some(i => i.itemId === item.itemId)
    //       if (!exists) {
    //         array.push(item)
    //       }
    //     }
    //   }
    // }
    // else {
    //   const params = { erpCode: currentMesLot.productNo, opNo: currentMesLot.opNo }
    //   const finishedOpRes: ApiResult<QcFinishedOp> = await http.get(`/qc/finishedOp/getByParams`, params)
    //   if (finishedOpRes.code === 200 && finishedOpRes.data && finishedOpRes.data.itemArray) {
    //     const tempArray = JSON.parse(finishedOpRes.data?.itemArray)
    //     for (const item of tempArray) {
    //       array.push(item)
    //     }
    //   }
    // }

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
        wgConclusion: form.wgConclusion,
        gnConclusion: form.gnConclusion,
      }

      params.itemArray = JSON.stringify(itemArray)
      params.qbArray = JSON.stringify(qbArray)
      params.jhlArray = JSON.stringify(jhlArray)

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
const addMaterialLot = () => {
  uni.navigateTo({
    url: '/pagesProd/mesLot/lot/save',
    success: (res) => {
      res.eventChannel.emit('initItem', form.lotNo)
    },
  })
}

let eventChannel: UniApp.EventChannel | null = null

onLoad(() => {
  const instance = getCurrentInstance() as any
  const pageVm = instance?.proxy as any
  eventChannel = pageVm?.getOpenerEventChannel?.() ?? null
  eventChannel?.on('init', init)
  eventChannel?.on('initItem', initItem)

  uni.$on('refreshMesLotLot', async () => {
    const lotArray: E10Lot[] = await http.get(`/qc/e10Lot/all`, { lotNo: form.lotNo ?? '' })
    lotList.length = 0
    lotList.push(...lotArray)
  })
})

onUnload(() => {
  eventChannel?.off('init', init)
  eventChannel?.off('initItem', initItem)
  eventChannel = null
  uni.$off('refreshMesLotLot')
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
  <wd-navbar title="巡检登记">
    <template #left>
      <wd-icon name="left" class="wd-navbar__arrow" @click="navigateBack" />
    </template>
    <template #right>
      <wd-button v-if="form.lotNo" type="primary" size="small" plain @click="addMaterialLot">
        添加物料批
      </wd-button>
    </template>
  </wd-navbar>
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
              <wd-input v-model="row.defectNums" type="number" @input="computeRow(row, tab.key)" />
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

        <view class="conclusion-panel">
          <text class="conclusion-panel__label">
            当前页结论：
          </text>
          <text
            class="conclusion-panel__value"
            :class="form[`${tab.key}Conclusion`] === '合格' ? 'conclusion-panel__value--pass' : form[`${tab.key}Conclusion`] === '不合格' ? 'conclusion-panel__value--fail' : ''"
          >
            {{ form[`${tab.key}Conclusion`] || '-' }}
          </text>
        </view>
      </wd-tab>
    </block>
    <wd-tab key="qb" title="启泵测试">
      <wd-button>
        <wd-icon name="plus-circle" color="var(--wot-success-main)" @click="addItem(qbArray)" />
      </wd-button>
      <wd-table :data="qbArray">
        <wd-table-column prop="productNo" label="删除" align="center" width="10%">
          <template #value="{ index }">
            <wd-icon name="minus-circle" color="var(--wot-error-main)" @click="delItem(qbArray, index)" />
          </template>
        </wd-table-column>
        <wd-table-column
          prop="value"
          label="数值"
          align="center"
          width="90%"
        >
          <template #value="{ row }">
            <wd-input v-model="row.value" type="number" />
          </template>
        </wd-table-column>
      </wd-table>
    </wd-tab>
    <wd-tab key="jhl" title="净含量">
      <view class="jhl-info-row">
        <text class="jhl-info-item">
          灌装量采集类型：{{ getOptionsLabel(gzlTypeOptions, currentMaterialLot.gzlType) || '-' }}
        </text>
        <text class="jhl-info-item">
          比重：{{ currentMaterialLot.gravity ?? '-' }}
        </text>
        <text class="jhl-info-item">
          上限: {{ currentMaterialLot.upperLimit ?? '-' }}
        </text>
        <text class="jhl-info-item">
          下限：{{ currentMaterialLot.lowerLimit ?? '-' }}
        </text>
      </view>

      <!-- 只填净重 -->
      <wd-table v-if="currentMaterialLot.gzlType === '0'" :data="jhlArray.filter(i => ['nw', 'v'].includes(i.value))">
        <wd-table-column
          prop="label"
          label="项目"
          align="center"
          :width="100"
        />
        <wd-table-column
          v-for="i in currentMaterialLot.gzlCount"
          :key="`c_${i}`"
          :prop="`c_${i}`"
          :label="`${i}次`"
          align="center"
          :width="120"
        >
          <template #value="{ row }">
            <wd-input
              v-if="['nw'].includes(row.value)"
              v-model="row[`c_${i}`]"
              type="number"
              size="mini"

              @input="handleGzlInput(row, i)"
            />
            <text v-else>
              {{ row[`c_${i}`] }}
            </text>
          </template>
        </wd-table-column>
        <wd-table-column
          prop="max"
          label="最大值"
          align="center"
          :width="100"
        />
        <wd-table-column
          prop="min"
          label="最小值"
          align="center"
          :width="100"
        />
        <wd-table-column
          prop="avg"
          label="平均值"
          align="center"
          :width="100"
        />
      </wd-table>
      <!-- 净重+瓶重(毛重系统计算) -->
      <wd-table v-if="currentMaterialLot.gzlType === '1'" :data="jhlArray">
        <wd-table-column
          prop="label"
          label="项目"
          align="center"
          :width="100"
        />
        <wd-table-column
          v-for="i in currentMaterialLot.gzlCount"
          :key="`c_${i}`"
          :prop="`c_${i}`"
          :label="`${i}次`"
          align="center"
          :width="120"
        >
          <template #value="{ row }">
            <wd-input
              v-if="['bw', 'nw'].includes(row.value)"
              v-model="row[`c_${i}`]"
              type="number"
              size="mini"

              @input="handleGzlInput(row, i)"
            />
            <text v-else>
              {{ row[`c_${i}`] }}
            </text>
          </template>
        </wd-table-column>
        <wd-table-column
          prop="max"
          label="最大值"
          align="center"
          :width="100"
        />
        <wd-table-column
          prop="min"
          label="最小值"
          align="center"
          :width="100"
        />
        <wd-table-column
          prop="avg"
          label="平均值"
          align="center"
          :width="100"
        />
      </wd-table>
      <!-- 瓶重+毛重(净重系统计算) -->
      <wd-table v-if="currentMaterialLot.gzlType === '2'" :data="jhlArray">
        <wd-table-column
          prop="label"
          label="项目"
          align="center"
          :width="100"
        />
        <wd-table-column
          v-for="i in currentMaterialLot.gzlCount"
          :key="`c_${i}`"
          :prop="`c_${i}`"
          :label="`${i}次`"
          align="center"
          :width="120"
        >
          <template #value="{ row }">
            <wd-input
              v-if="['gw', 'bw'].includes(row.value)"
              v-model="row[`c_${i}`]"
              type="number"
              size="mini"

              @input="handleGzlInput(row, i)"
            />
            <text v-else>
              {{ row[`c_${i}`] }}
            </text>
          </template>
        </wd-table-column>
        <wd-table-column
          prop="max"
          label="最大值"
          align="center"
          :width="100"
        />
        <wd-table-column
          prop="min"
          label="最小值"
          align="center"
          :width="100"
        />
        <wd-table-column
          prop="avg"
          label="平均值"
          align="center"
          :width="100"
        />
      </wd-table>
    </wd-tab>
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

.conclusion-panel {
  margin: 16rpx 0 8rpx;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  background: var(--wot-fill-color-light, #f5f7fa);
  display: flex;
  align-items: center;
  border: 1rpx solid var(--wot-border-color-lighter, #e4e7ed);
}

.conclusion-panel__label {
  font-size: 26rpx;
  color: var(--wot-text-secondary, #606266);
}

.conclusion-panel__value {
  margin-left: 12rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--wot-text-title, #303133);
}

.conclusion-panel__value--pass {
  color: var(--wot-color-success, #67c23a);
}

.conclusion-panel__value--fail {
  color: var(--wot-color-danger, #f56c6c);
}

.jhl-info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  padding: 16rpx 20rpx;
  margin: 12rpx 0 16rpx;
  border-radius: 12rpx;
  background: var(--wot-fill-color-light, #f5f7fa);
  border: 1rpx solid var(--wot-border-color-lighter, #e4e7ed);
}

.jhl-info-item {
  color: var(--wot-text-title, #303133);
  font-size: 26rpx;
  line-height: 1.6;
  font-weight: 500;
}
</style>
