<script setup lang="ts">
import type { ApiResult } from '@/types/common/apiResult'
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
  upperLimit: undefined,
  lowerLimit: undefined,
  gravity: undefined,
  requirements: '',
  remark: '',
})

const formRef = ref()
const schema = zodAdapter(
  z.object({
    lotCode: z.string().min(1, '请填写物料批'),
    wgNums: z.any().refine(value => value !== '' && value !== null && value !== undefined, '请填写外观抽样'),
    gnNums: z.any().refine(value => value !== '' && value !== null && value !== undefined, '请填写功能抽样'),
    gzlType: z.string().min(1, '请填写灌装量采集类型'),
    gzlCount: z.any().refine(value => value !== '' && value !== null && value !== undefined, '请填写灌装量采集次数'),
    upperLimit: z.any().refine(value => value !== '' && value !== null && value !== undefined, '请填写上限'),
    lowerLimit: z.any().refine(value => value !== '' && value !== null && value !== undefined, '请填写下限'),
    gravity: z.any().refine(value => value !== '' && value !== null && value !== undefined, '请填写比重'),
    requirements: z.string().min(1, '请填写巡检要求'),
  }),
)

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
      form.upperLimit = res.data.upperLimit
      form.lowerLimit = res.data.lowerLimit
      form.gravity = res.data.gravity
      form.requirements = res.data.requirements || ''
      form.remark = res.data.remark || ''
    }
  }
  finally {
    loading.close()
  }
}

const initItem = (lotNo: string) => {
  if (lotNo)
    form.lotNo = lotNo
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
            uni.$emit('refreshMesLotLot')
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
  <wd-form ref="formRef" :model="form" :schema="schema" :title-width="110">
    <wd-form-item title="生产批" prop="lotNo">
      {{ form.lotNo }}
    </wd-form-item>
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
      title="灌装量采集类型"
      :value="getOptionsLabel(gzlTypeOptions, form.gzlType)"
      is-link
      prop="gzlType"
      @click="showGzlTypePicker = true"
    />
    <wd-form-item title="灌装量采集次数" prop="gzlCount">
      <wd-input v-model="form.gzlCount" type="number" />
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
      <wd-input v-model="form.requirements" />
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
