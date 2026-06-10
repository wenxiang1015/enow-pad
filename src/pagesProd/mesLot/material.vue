<script setup lang="ts">
import type { SpanMethodParams } from '@wot-ui/ui/components/wd-table/types'
import type { ApiResult } from '@/types/common/apiResult'
import type { E10IssueReceiptSummaryVo } from '@/types/e10/e10IssueReceiptSummaryVo'
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
const itemArray = reactive<any[]>([])// 物料汇总
const lldTabs = reactive<any[]>([])// 领料单
const currentTab = ref<string>('')

const setModXlyNumsRowSpan = (list: any[]) => {
  const rowspanMap = new Map<string, number>()
  list.forEach((item) => {
    const key = item.itemCode
    rowspanMap.set(key, (rowspanMap.get(key) || 0) + 1)
  })

  const seen = new Set<string>()
  list.forEach((item) => {
    const key = item.itemCode
    if (seen.has(key)) {
      item.itemCodeRowSpan = 0
      return
    }

    item.itemCodeRowSpan = rowspanMap.get(key) || 1
    seen.add(key)
  })
}

const calcXlDiff = (list: any[]) => {
  const sumMap = new Map<string, { issue: number, receipt: number }>()

  list.forEach((item) => {
    const key = item.itemCode
    const current = sumMap.get(key) || { issue: 0, receipt: 0 }
    current.issue += Number(item.e10IssueNums) || 0
    current.receipt += Number(item.e10ReceiptNums) || 0
    sumMap.set(key, current)
  })

  list.forEach((item) => {
    const key = item.itemCode
    const sum = sumMap.get(key) || { issue: 0, receipt: 0 }
    const modXlyNums = Number(item.modXlyNums) || 0
    item.xlDiff = (sum.issue - sum.receipt) - modXlyNums
  })
}

const calcXtDiff = (list: any[]) => {
  const sumMap = new Map<string, { up: number, down: number, issue: number, receipt: number }>()

  list.forEach((item) => {
    const key = item.itemCode
    const current = sumMap.get(key) || { up: 0, down: 0, issue: 0, receipt: 0 }
    current.up += Number(item.mesUpNums) || 0
    current.down += Number(item.mesDownNums) || 0
    current.issue += Number(item.e10IssueNums) || 0
    current.receipt += Number(item.e10ReceiptNums) || 0
    sumMap.set(key, current)
  })

  list.forEach((item) => {
    const key = item.itemCode
    const sum = sumMap.get(key) || { up: 0, down: 0, issue: 0, receipt: 0 }
    const mesNet = sum.up - sum.down
    const e10Net = sum.issue - sum.receipt
    item.xtDiff = mesNet - e10Net
  })
}

const handleSpan = (params: SpanMethodParams) => {
  if (['modXlyNums', 'itemCode', 'itemName', 'xlDiff', 'xtDiff'].includes(params.column.prop)) {
    const rowspan = params.row.itemCodeRowSpan ?? 1
    return {
      rowspan,
      colspan: rowspan > 0 ? 1 : 0,
    }
  }
  return {
    rowspan: 1,
    colspan: 1,
  }
}
const refreshItemArray = async () => {
  const arr = mesLot.lotNo?.split('-')
  if (arr) {
    const params = {
      moNo: `${arr[0]}-${arr[1]}`,
    }
    const itemList: E10IssueReceiptSummaryVo[] = await http.get(`/e10/allMoLotCodeGroupLt`, params)
    itemArray.length = 0
    for (const item of itemList) {
      item.checked = false
    }
    setModXlyNumsRowSpan(itemList)
    calcXlDiff(itemList)
    calcXtDiff(itemList)
    itemArray.push(...itemList)

    const lldList: any[] = await http.get(`/e10/allIssueReceiptD`, params)
    lldTabs.length = 0
    const docNoSet = new Set<string>()
    lldList.forEach((item) => {
      item.checked = false
      docNoSet.add(item.docNo)
    })
    docNoSet.forEach((docNo) => {
      lldTabs.push({
        docNo,
        array: lldList.filter(item => item.docNo === docNo),
      })
    })
  }
}
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
        setModXlyNumsRowSpan(json.array || [])
        calcXlDiff(json.array || [])
        calcXtDiff(json.array || [])
        itemArray.push(...(json.array || []))
      }
      else {
        await refreshItemArray()
      }
    }
  }
  finally {
    btnLoading.value = false
  }
}
const scanAndCheck = async () => {
  try {
    const res = await uni.scanCode({
      scanType: ['qrCode', 'barCode'],
    })

    const rawCode = (res?.result || '').trim()
    if (!rawCode) {
      toast.error('未识别到条码内容')
      return
    }

    const itemCode = rawCode.split('#')[0]?.trim()
    if (!itemCode) {
      toast.error('条码格式不正确')
      return
    }

    for (const item of itemArray) {
      if (item.itemCode === itemCode) {
        item.checked = true
      }
    }

    for (const lld of lldTabs) {
      for (const item of lld.array) {
        if (item.itemCode === itemCode) {
          item.checked = true
        }
      }
    }
  }
  catch (error: any) {
    if (error?.errMsg?.includes('cancel')) {
      return
    }
    toast.error('扫码失败，请重试')
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
  <view class="toolbar">
    <wd-button @click="scanAndCheck">
      <wd-icon name="scan" color="var(--wot-theme-color)" />
    </wd-button>
    <wd-button @click="refreshItemArray">
      <wd-icon name="sync" color="var(--wot-success-main)" />
    </wd-button>
  </view>
  <wd-tabs :tabs="currentTab">
    <wd-tab key="summary" title="汇总">
      <wd-table :data="itemArray" :span-method="handleSpan">
        <wd-table-column
          prop=""
          label="核料"
          align="center"
          fixed
        >
          <template #value="{ row }">
            <wd-checkbox v-model="row.checked" />
          </template>
        </wd-table-column>
        <wd-table-column
          prop="itemCode"
          label="品号"
          align="center"
        />
        <wd-table-column
          prop="itemName"
          label="品名"
          align="center"
          width="320"
        />
        <wd-table-column
          prop="lotCode"
          label="批号"
          align="center"
          width="150"
        />
        <wd-table-column
          prop="modXlyNums"
          label="e10工单累计需领用量"
          align="center"
          width="180"
        />
        <wd-table-column
          prop="e10IssueNums"
          label="e10累计领料量"
          align="center"
          width="150"
        />
        <wd-table-column
          prop="e10ReceiptNums"
          label="e10累计退料量"
          align="center"
          width="150"
        />
        <wd-table-column
          prop="xlDiff"
          label="需领差异"
          align="center"
          width="120"
        >
          <template #value="{ row }">
            <text :style="Number(row.xlDiff) !== 0 ? 'color: #f56c6c;' : ''">
              {{ row.xlDiff }}
            </text>
          </template>
        </wd-table-column>
        <wd-table-column
          prop="mesUpNums"
          label="mes累计上料量"
          align="center"
          width="150"
        />
        <wd-table-column
          prop="mesDownNums"
          label="mes累计下料量"
          align="center"
          width="150"
        />
        <wd-table-column
          prop="xtDiff"
          label="系统差异"
          align="center"
          width="120"
        >
          <template #value="{ row }">
            <text :style="Number(row.xtDiff) !== 0 ? 'color: #f56c6c;' : ''">
              {{ row.xtDiff }}
            </text>
          </template>
        </wd-table-column>
      </wd-table>
    </wd-tab>
    <wd-tab v-for="(lld, i) in lldTabs" :key="i" :title="lld.docNo">
      <wd-table :data="lld.array">
        <wd-table-column
          prop=""
          label="核料"
          align="center"
          fixed
        >
          <template #value="{ row }">
            <wd-checkbox v-model="row.checked" />
          </template>
        </wd-table-column>
        <wd-table-column prop="docNo" width="180" label="领料单号" align="center" />
        <wd-table-column prop="itemCode" width="100" label="品号" align="center" />
        <wd-table-column prop="itemName" width="320" label="品名" align="center" />
        <wd-table-column prop="lotCode" width="160" label="批次" align="center" />
        <wd-table-column prop="nums" width="100" label="领料数量" align="center" />
        <wd-table-column prop="issueComment" width="200" label="领料说明" align="center" />
        <wd-table-column prop="createBy" width="100" label="领料人" align="center" />
        <wd-table-column prop="createDate" width="240" label="领料时间" align="center" />
      </wd-table>
    </wd-tab>
  </wd-tabs>

  <view class="bottom-btn">
    <wd-button :loading="btnLoading" block @click="submit">
      提交
    </wd-button>
  </view>
</template>

<style scoped lang="scss">
</style>
