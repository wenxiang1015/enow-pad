<script setup lang="ts">
import type { ApiResult } from '@/types/common/apiResult'
import type { Options } from '@/types/common/options'
import type { E10Lot } from '@/types/qc/e10Lot'
import { zodAdapter } from '@wot-ui/ui'
import { z } from 'zod'
import { useGlobalLoading } from '@/composables/useGlobalLoading'
import { useGlobalToast } from '@/composables/useGlobalToast'
import http from '@/utils/request'

definePage({
  name: 'mesLotLotSave',
  style: {
    navigationBarTitleText: '物料批登记',
  },
})

const toast = useGlobalToast()
const loading = useGlobalLoading()
const btnLoading = ref(false)
const gzlTypeOptions = [
  { label: '只填净重', value: '0' },
  { label: '净重+瓶重(毛重系统计算)', value: '1' },
  { label: '瓶重+毛重(净重系统计算)', value: '2' },
]
const showLotCodePicker = ref(false)
const showGzlTypePicker = ref(false)
type PickerModelValue = string | number | boolean | (string | number | boolean)[]
type E10LotForm = E10Lot & { gzlType: PickerModelValue }
const form = reactive<E10LotForm>({
  id: undefined,
  lotNo: '',
  lotCode: '',
  wgNums: undefined,
  gnNums: undefined,
  opNo: '',
  gzlType: '0',
  gzlCount: 10,
  qbCount: undefined,

  upperLimit: undefined,
  lowerLimit: undefined,
  gravity: undefined,
  requirements: '1.频率：2小时/1次。2.功能抽样量：净含量、配套性、气密性等测试、耐压测试（铝膜袋类：80pcs/台，其他：10pcs/次）。3.外观抽样量：铝膜袋类200片/次，唇釉/水乳膏霜类125PCS/次。4.如有客户特殊需求，按照客户特殊需求执行。',
  remark: '',
})
const lotCodeList = reactive<Options[]>([])

const formRef = ref()
const schema = zodAdapter(
  z.object({
    lotCode: z.string().min(1, '请填写物料批'),
    wgNums: z.any().refine(value => value !== '' && value !== null && value !== undefined, '请填写外观抽样'),
    gnNums: z.any().refine(value => value !== '' && value !== null && value !== undefined, '请填写功能抽样'),
    gzlType: z.string().min(1, '请填写净含量采集类型'),
    gzlCount: z.any().refine(value => value !== '' && value !== null && value !== undefined, '请填写净含量样品数量'),
    qbCount: z.any().refine(value => value !== '' && value !== null && value !== undefined, '请填写启泵采集次数'),
    upperLimit: z.any().refine(value => value !== '' && value !== null && value !== undefined, '请填写上限'),
    lowerLimit: z.any().refine(value => value !== '' && value !== null && value !== undefined, '请填写下限'),
    gravity: z.any().refine(value => value !== '' && value !== null && value !== undefined, '请填写比重'),
    requirements: z.string().min(1, '请填写巡检要求'),
  }),
)

const initOptions = async () => {
  const list: string[] = await http.get(`/sc/verification/allLotCode/${form.lotNo}`)
  lotCodeList.length = 0
  list.forEach((item) => {
    lotCodeList.push({
      label: item,
      value: item,
    })
  })
  return []
}
const init = async (id: number) => {
  if (!id)
    return
  loading.loading('加载中...')
  try {
    const res: ApiResult<E10Lot> = await http.get(`/qc/e10Lot/${id}`)
    if (res.code === 200 && res.data) {
      form.id = res.data.id
      form.lotNo = res.data.lotNo || ''
      form.lotCode = res.data.lotCode || ''
      form.wgNums = res.data.wgNums
      form.gnNums = res.data.gnNums
      form.opNo = res.data.opNo || ''
      form.gzlType = res.data.gzlType || '0'
      form.gzlCount = res.data.gzlCount
      form.qbCount = res.data.qbCount

      form.upperLimit = res.data.upperLimit
      form.lowerLimit = res.data.lowerLimit
      form.gravity = res.data.gravity
      form.requirements = res.data.requirements || ''
      form.remark = res.data.remark || ''

      await initOptions()
    }
  }
  finally {
    loading.close()
  }
}

const initItem = async (lotNo: string) => {
  if (lotNo) {
    form.lotNo = lotNo
    await initOptions()
  }
}

const submit = async () => {
  const formRes = await formRef.value?.validate()
  if (!formRes.valid)
    return

  btnLoading.value = true
  try {
    const payload = {
      id: form.id,
      lotNo: form.lotNo,
      lotCode: form.lotCode,
      wgNums: form.wgNums,
      gnNums: form.gnNums,
      requirements: form.requirements,
      opNo: form.opNo,
      gzlType: form.gzlType,
      gzlCount: form.gzlCount,
      qbCount: form.qbCount,

      upperLimit: form.upperLimit,
      lowerLimit: form.lowerLimit,
      gravity: form.gravity,
      remark: form.remark,
    }
    const res: ApiResult<any> = form.id
      ? await http.put('/qc/e10Lot', payload)
      : await http.post('/qc/e10Lot', payload)

    if (res.code === 200) {
      toast.success({
        msg: form.id ? '修改成功' : '新增成功',
        closed() {
          uni.navigateBack().then(() => {
            uni.$emit('refreshMesLot')
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
    v-model="form.gzlType"
    v-model:visible="showGzlTypePicker"
    type="radio"
    :columns="gzlTypeOptions"
  />
  <wd-select-picker
    v-model="form.lotCode"
    v-model:visible="showLotCodePicker"
    type="radio"
    :columns="lotCodeList"
  />
  <wd-form ref="formRef" :model="form" :schema="schema" :title-width="110">
    <wd-form-item title="生产批" prop="lotNo">
      {{ form.lotNo }}
    </wd-form-item>
    <!-- <wd-form-item
      title="物料批"
      :value="form.lotCode"
      is-link
      prop="lotCode"
      @click="showLotCodePicker = true"
    /> -->
    <wd-form-item title="物料批" prop="lotCode">
      <wd-input v-model="form.lotCode" />
    </wd-form-item>
    <wd-form-item title="外观抽样" prop="wgNums">
      <wd-input v-model="form.wgNums" type="number" />
    </wd-form-item>
    <wd-form-item title="功能抽样" prop="gnNums">
      <wd-input v-model="form.gnNums" type="number" />
    </wd-form-item>
    <wd-form-item
      title="净含量采集类型"
      :value="getOptionsLabel(gzlTypeOptions, form.gzlType)"
      is-link
      prop="gzlType"
      @click="showGzlTypePicker = true"
    />
    <wd-form-item title="净含量样品数量" prop="gzlCount">
      <wd-input v-model="form.gzlCount" type="number" />
    </wd-form-item>
    <wd-form-item title="采集次数" prop="qbCount">
      <wd-input v-model="form.qbCount" type="number" />
    </wd-form-item>
    <wd-form-item title="上限" prop="upperLimit">
      <wd-input v-model="form.upperLimit" type="number" />
    </wd-form-item>
    <wd-form-item title="下限" prop="lowerLimit">
      <wd-input v-model="form.lowerLimit" type="number" />
    </wd-form-item>
    <wd-form-item title="比重" prop="gravity">
      <wd-input v-model="form.gravity" type="number" />
    </wd-form-item>
    <wd-form-item title="巡检要求" prop="requirements">
      <wd-textarea v-model="form.requirements" />
    </wd-form-item>
    <wd-form-item title="备注" prop="remark">
      <wd-textarea v-model="form.remark" />
    </wd-form-item>
  </wd-form>

  <view class="bottom-btn">
    <wd-button block :loading="btnLoading" @click="submit">
      提交
    </wd-button>
  </view>
</template>
