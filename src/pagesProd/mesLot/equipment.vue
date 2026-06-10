<script setup lang="ts">
import type { ApiResult } from '@/types/common/apiResult'
import type { MesLot } from '@/types/production/mesLot'
import dayjs from 'dayjs'
import { useGlobalToast } from '@/composables/useGlobalToast'
import { useAuthStore } from '@/store/authStore'
import http from '@/utils/request'

const toast = useGlobalToast()
const authStore = useAuthStore()

definePage({
  name: 'mesLotEquipment',
  style: {
    navigationBarTitleText: '设备点检',
  },
})

const btnLoading = ref(false)
const mesLot = reactive<MesLot>({})
const form = reactive<any>({
  opUser: '',
  opTime: '',
})
const itemArray = reactive<any[]>([])
const equipmentList = reactive<any[]>([])
const currentRow = ref<any>({})
const showEquipmentPicker = ref(false)

const selectOptions = (row: any) => {
  currentRow.value = row
  showEquipmentPicker.value = true
}
const init = async (id: number) => {
  btnLoading.value = true
  try {
    const res: ApiResult<MesLot> = await http.get(`/production/mesLot/${id}`)
    if (res.code === 200 && res.data) {
      const data = res.data
      Object.assign(mesLot, data)

      if (data.type === 'production') {
        const res: any[] = await http.get('/production/equipment/all')
        if (res && res.length > 0) {
          equipmentList.length = 0
          equipmentList.push(...res)
        }
      }
      if (data.type === 'makeUp') {
        const res: any[] = await http.get('/sop/makeEquipment/all')
        if (res && res.length > 0) {
          equipmentList.length = 0
          equipmentList.push(...res)
        }
      }
      if (data.equipmentJson) {
        const json = JSON.parse(data.equipmentJson)
        form.opUser = json.opUser
        form.opTime = json.opTime
        itemArray.length = 0
        itemArray.push(...json.array)
      }
    }
  }
  finally {
    btnLoading.value = false
  }
}
const submit = async () => {
  const jsonForm: any = Object.assign({}, form)
  jsonForm.opUser = authStore.user?.nickName ?? ''
  jsonForm.opTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  jsonForm.array = itemArray

  try {
    btnLoading.value = true
    const res: ApiResult<any> = await http.put('/production/mesLot', {
      id: mesLot.id,
      equipmentJson: JSON.stringify(jsonForm),
    })

    if (res.code === 200) {
      toast.success({
        msg: '提交成功',
        closed() {
          uni.navigateBack().then(() => {
            uni.$emit('refreshMesLot')
          })
        },
      })
    }
    else {
      toast.error(res.msg)
    }
  }
  catch (error) {
    console.log(error)
  }
  finally {
    btnLoading.value = false
  }
}
const addItem = () => {
  itemArray.push({ equipmentNo: '' })
}
const scanAddItem = async () => {
  try {
    const res = await uni.scanCode({
      scanType: ['qrCode', 'barCode'],
    })

    const rawCode = (res?.result || '').trim()
    if (!rawCode) {
      toast.error('未识别到设备编号')
      return
    }

    const equipmentNo = rawCode.replace(/\s+/g, '')
    if (!equipmentNo) {
      toast.error('设备编号不能为空')
      return
    }

    itemArray.push({ equipmentNo })
    toast.success(`已添加设备：${equipmentNo}`)
  }
  catch (error: any) {
    if (error?.errMsg?.includes('cancel')) {
      return
    }
    toast.error('扫码失败，请重试')
  }
}
const delItem = (index: number) => {
  itemArray.splice(index, 1)
}

let eventChannel: UniApp.EventChannel | null = null

onLoad(() => {
  const instance = getCurrentInstance() as any
  const pageVm = instance?.proxy as any
  eventChannel = pageVm?.getOpenerEventChannel?.() ?? null
  eventChannel?.on('init', init)
})

onUnload(() => {
  eventChannel = null
})
</script>

<template>
  <wd-select-picker
    v-model="currentRow.equipmentNo"
    v-model:visible="showEquipmentPicker"
    type="radio"
    :columns="equipmentList.map((item: any) => ({ value: item.equipmentNo, label: item.equipmentNo }))"
  />
  <view class="toolbar">
    <wd-button @click="addItem">
      <wd-icon name="plus-circle" color="var(--wot-success-main)" />
    </wd-button>
    <wd-button @click="scanAddItem">
      <wd-icon name="scan" color="var(--wot-theme-color)" />
    </wd-button>
  </view>
  <wd-table :data="itemArray">
    <wd-table-column prop="equipmentNo" label="删除" align="center" width="10%">
      <template #value="{ index }">
        <wd-icon name="minus-circle" color="var(--wot-error-main)" @click="delItem(index)" />
      </template>
    </wd-table-column>
    <wd-table-column
      prop="equipmentNo"
      label="设备编号"
      align="center"
      width="90%"
    >
      <template #value="{ row }">
        <view style="cursor: pointer;" @click="selectOptions(row)">
          <text v-if="row.equipmentNo">
            {{ row.equipmentNo }}
          </text>
          <text v-else :style="{ color: 'var(--wot-text-secondary)' }">
            请选择
          </text>
        </view>
      </template>
    </wd-table-column>
  </wd-table>

  <view class="bottom-btn">
    <wd-button :loading="btnLoading" block @click="submit">
      提交
    </wd-button>
  </view>
</template>

<style scoped lang="scss">
.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
</style>
