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
  name: 'mesLotMaterial',
  style: {
    navigationBarTitleText: '物料点检',
  },
})

const btnLoading = ref(false)
const mesLot = reactive<MesLot>({})
const form = reactive<any>({
  opUser: '',
  opTime: '',
})
const itemArray = reactive<any[]>([])

const init = async (id: number) => {
  btnLoading.value = true
  try {
    const res: ApiResult<MesLot> = await http.get(`/production/mesLot/${id}`)
    if (res.code === 200 && res.data) {
      const data = res.data
      Object.assign(mesLot, data)
      if (data.wlJson) {
        const json = JSON.parse(data.wlJson)
        form.opUser = json.opUser
        form.opTime = json.opTime
        itemArray.length = 0
        itemArray.push(...(json.array || []))
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
      wlJson: JSON.stringify(jsonForm),
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
  itemArray.push({ productNo: '' })
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
  <wd-button>
    <wd-icon name="plus-circle" color="var(--wot-success-main)" @click="addItem" />
  </wd-button>
  <wd-table :data="itemArray">
    <wd-table-column prop="productNo" label="删除" align="center" width="10%">
      <template #value="{ index }">
        <wd-icon name="minus-circle" color="var(--wot-error-main)" @click="delItem(index)" />
      </template>
    </wd-table-column>
    <wd-table-column
      prop="productNo"
      label="品号"
      align="center"
      width="90%"
    >
      <template #value="{ row }">
        <wd-input v-model="row.productNo" placeholder="请输入品号" />
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

</style>
