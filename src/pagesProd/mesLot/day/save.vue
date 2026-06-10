<script setup lang="ts">
import type { ApiResult } from '@/types/common/apiResult'
import type { MesLotDayLine } from '@/types/production/mesLotDayLine'
import dayjs from 'dayjs'
import { useGlobalLoading } from '@/composables/useGlobalLoading'
import { useGlobalToast } from '@/composables/useGlobalToast'
import http from '@/utils/request'

definePage({
  name: 'mesLotDaySave',
  style: {
    navigationBarTitleText: '生产排班登记',
  },
})

const toast = useGlobalToast()
const loading = useGlobalLoading()
const btnLoading = ref(false)
const showWorkDatePicker = ref(false)
const form = reactive<MesLotDayLine>({
  id: undefined,
  lotNo: '',
  lotCode: '',
  workDate: '',
  sailings: '',
  lineNo: '',
  openJson: '',
  closeJson: '',
  firstJson: '',
  inspectionJson: '',
})
const workDateText = computed(() => {
  if (!form.workDate)
    return ''
  if (typeof form.workDate === 'number')
    return dayjs(form.workDate).format('YYYY-MM-DD')
  return form.workDate
})

const init = async (id: number) => {
  if (!id)
    return
  loading.loading('加载中...')
  try {
    const res: ApiResult<MesLotDayLine> = await http.get(`/production/mesLotDayLine/${id}`)
    if (res.code === 200 && res.data) {
      form.id = res.data.id
      form.lotNo = res.data.lotNo || ''
      form.lotCode = res.data.lotCode || ''
      form.workDate = res.data.workDate ? String(res.data.workDate).slice(0, 10) : ''
      form.sailings = res.data.sailings || ''
      form.lineNo = res.data.lineNo || ''
      form.openJson = res.data.openJson || ''
      form.closeJson = res.data.closeJson || ''
      form.firstJson = res.data.firstJson || ''
      form.inspectionJson = res.data.inspectionJson || ''
    }
  }
  finally {
    loading.close()
  }
}

const initItem = async (lotNo: string) => {
  if (lotNo)
    form.lotNo = lotNo
}

const showSailingsPicker = ref(false)
const sailingsOptions = [
  { value: '0', label: '白班' },
  { value: '1', label: '晚班' },
]

const submit = async () => {
  if (!form.lotCode || !form.workDate || !form.sailings || !form.lineNo)
    return

  btnLoading.value = true
  try {
    const payload = {
      id: form.id,
      lotNo: form.lotNo,
      lotCode: form.lotCode,
      workDate: form.workDate,
      sailings: form.sailings,
      lineNo: form.lineNo,
      openJson: form.openJson,
      closeJson: form.closeJson,
      firstJson: form.firstJson,
      inspectionJson: form.inspectionJson,
    }
    const res: ApiResult<any> = form.id
      ? await http.put('/production/mesLotDayLine', payload)
      : await http.post('/production/mesLotDayLine', payload)

    if (res.code === 200) {
      toast.success({
        msg: form.id ? '修改成功' : '新增成功',
        closed() {
          uni.navigateBack().then(() => {
            uni.$emit('refreshMesLotDay')
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
    v-model="form.sailings"
    v-model:visible="showSailingsPicker"
    type="radio"
    :columns="sailingsOptions"
  />
  <wd-datetime-picker
    v-model="form.workDate"
    v-model:visible="showWorkDatePicker"
    type="date"
  />
  <wd-form :model="form" :title-width="110">
    <wd-form-item title="生产批" prop="lotNo">
      {{ form.lotNo }}
    </wd-form-item>
    <wd-form-item title="物料批" prop="lotCode">
      <wd-input v-model="form.lotCode" />
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
      :value="getOptionsLabel(sailingsOptions, form.sailings)"
      is-link
      prop="sailings"
      @click="showSailingsPicker = true"
    />
    <wd-form-item title="线号" prop="lineNo">
      <wd-input v-model="form.lineNo" />
    </wd-form-item>
  </wd-form>

  <view class="bottom-btn">
    <wd-button block :loading="btnLoading" @click="submit">
      提交
    </wd-button>
  </view>
</template>

<style lang="scss" scoped>
</style>
