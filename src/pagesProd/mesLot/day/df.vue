<script setup lang="ts">
import type { ApiResult } from '@/types/common/apiResult'
import type { Options } from '@/types/common/options'
import type { MesLotDayLine } from '@/types/production/mesLotDayLine'
import type { ProductionTemplate } from '@/types/production/productionTemplate'
import dayjs from 'dayjs'
import { useGlobalLoading } from '@/composables/useGlobalLoading'
import { useGlobalToast } from '@/composables/useGlobalToast'
import { useAuthStore } from '@/store/authStore'
import http from '@/utils/request'

const toast = useGlobalToast()
const authStore = useAuthStore()
definePage({
  name: 'mesLotDayLineDf',
  style: {
    navigationBarTitleText: '',
  },
})
class DfItemEntity {
  type?: 0
  options?: Options[] = []
  label?: string
  value?: string | number
  standard?: string
  condition?: string
  subLabel?: string
  remark?: string
}

const showConclusionPicker = ref(false)
const radioFlag = ref(true)
const loading = useGlobalLoading()
const btnLoading = ref(false)
const form = reactive<any>({
  opUser: '',
  opTime: '',
  auditUser: '',
  auditTime: '',
  conclusion: '',
  rejectReason: '',
})
const mesLotDayLine = reactive<MesLotDayLine>({})
const itemArray = reactive<DfItemEntity[]>([])
const typeOptions = [
  { label: '开线', value: 'open' },
  { label: '清洁', value: 'clean' },
  { label: '消毒', value: 'disinfection' },
  { label: '清洁消毒复核', value: 'rev' },
  { label: '首件', value: 'first' },
  { label: '清线', value: 'close' },
]
const conclusionOptions: Options[] = [
  { label: '符合', value: '符合' },
  { label: '不符合', value: '不符合' },
]
const hgOptions: Options[] = [
  { label: '合格', value: '合格' },
  { label: '不合格', value: '不合格' },
]
const currentType = ref<string>('')
const currentOptions = reactive<Options[]>([])
const currentRow = ref<DfItemEntity>(new DfItemEntity())
const currentKey = ref<string>('value')
const auditFlag = ref(false)
const isAuditMode = computed(() => auditFlag.value)

const currentTypeLabel = computed(() => {
  return typeOptions.find(item => item.value === currentType.value)?.label ?? '生产过程控制'
})

const selectOptions = (row: Record<string, any>, options: Options[] = conclusionOptions, type: number = 1, key: string = 'value') => {
  currentKey.value = key
  for (const item of options) { // 模板里面的数据只有label
    item.value = item.label
  }
  currentRow.value = row
  if (options) {
    currentOptions.length = 0
    currentOptions.push(...options)
  }
  if (type === 1) {
    radioFlag.value = true
  }
  else {
    radioFlag.value = false
  }
  showConclusionPicker.value = true
}
type MesLotDayLineJsonKey = 'openJson' | 'cleanJson' | 'disinfectionJson' | 'revJson' | 'firstJson' | 'closeJson'

const getMesLotDayLineJsonKey = (type: string): MesLotDayLineJsonKey => {
  const keyMap: Record<string, MesLotDayLineJsonKey> = {
    open: 'openJson',
    clean: 'cleanJson',
    disinfection: 'disinfectionJson',
    rev: 'revJson',
    first: 'firstJson',
    close: 'closeJson',
  }
  return keyMap[type] ?? 'openJson'
}

const init = async (obj: any) => {
  auditFlag.value = !!obj.auditFlag
  currentType.value = obj.type
  uni.setNavigationBarTitle({ title: currentTypeLabel.value })
  loading.loading('加载中...')
  const res: ApiResult<MesLotDayLine> = await http.get(`/production/mesLotDayLine/${obj.id}`)
  if (res.code === 200 && res.data) {
    const data: MesLotDayLine = res.data
    Object.assign(mesLotDayLine, data)
    const jsonKey = getMesLotDayLineJsonKey(currentType.value)
    const currentJson = (data as Record<string, any>)[jsonKey]
    if (currentJson) {
      const json = JSON.parse(currentJson)
      form.opUser = json.opUser || ''
      form.opTime = json.opTime || ''
      form.auditUser = json.auditUser || ''
      form.auditTime = json.auditTime || ''
      form.conclusion = json.conclusion || ''
      form.rejectReason = json.rejectReason || ''
      itemArray.length = 0
      itemArray.push(...json.array.map((item: any) => Object.assign(new DfItemEntity(), item)))
    }
    else {
      const templateRes: ApiResult<ProductionTemplate> = await http.get(`/production/template/${obj.type}`)
      if (templateRes.code === 200 && templateRes.data) {
        const templateData: ProductionTemplate = templateRes.data
        const tempArray = JSON.parse(templateData.itemArray)
        itemArray.length = 0
        itemArray.push(...tempArray.map((item: any) => Object.assign(new DfItemEntity(), item)))
      }
    }
  }
  loading.close()
}
const submit = async () => {
  if (isAuditMode.value)
    return
  const jsonForm: any = Object.assign({}, form)
  jsonForm.opUser = authStore.user?.nickName ?? ''
  jsonForm.opTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  jsonForm.array = itemArray

  try {
    btnLoading.value = true
    const res: ApiResult<any> = await http.put('/production/mesLotDayLine', {
      id: mesLotDayLine.id,
      [`${currentType.value}Json`]: JSON.stringify(jsonForm),
    })

    if (res.code === 200) {
      toast.success({
        msg: '提交成功',
        closed() {
          uni.navigateBack().then(() => {
            uni.$emit('refreshMesLotDay')
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
const audit = async (conclusion: string) => {
  if (!isAuditMode.value)
    return
  if (conclusion === '不符合' && !form.rejectReason?.trim()) {
    toast.warning({ msg: '请填写拒绝原因' })
    return
  }
  const jsonForm: any = Object.assign({}, form)
  jsonForm.conclusion = conclusion
  jsonForm.auditUser = authStore.user?.nickName ?? ''
  jsonForm.auditTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  jsonForm.opUser = jsonForm.opUser || authStore.user?.nickName || ''
  jsonForm.opTime = jsonForm.opTime || dayjs().format('YYYY-MM-DD HH:mm:ss')
  jsonForm.array = itemArray

  try {
    btnLoading.value = true
    const res: ApiResult<any> = await http.put('/production/mesLotDayLine', {
      id: mesLotDayLine.id,
      [`${currentType.value}Json`]: JSON.stringify(jsonForm),
    })

    if (res.code === 200) {
      toast.success({
        msg: '审核成功',
        closed() {
          uni.navigateBack().then(() => {
            uni.$emit('refreshMesLotDay')
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
  eventChannel?.off('init', init)
  eventChannel = null
})
</script>

<template>
  <wd-select-picker
    v-model="currentRow[currentKey as keyof DfItemEntity] as string | number | boolean | (string | number | boolean)[]"
    v-model:visible="showConclusionPicker"
    :type="radioFlag ? 'radio' : 'checkbox'"
    :columns="currentOptions"
  />
  <view v-if="['open', 'close'].includes(currentType)">
    <wd-table :data="itemArray">
      <wd-table-column
        prop="standard"
        label="检查内容及要求"
        align="center"
        :width="320"
      />
      <wd-table-column
        prop="value"
        label="检查结果"
        align="center"
        :width="180"
      >
        <template #value="{ row }">
          <view :class="{ 'page-mes-df__readonly': isAuditMode }" @click="!isAuditMode && selectOptions(row)">
            <text v-if="row.value" :style="{ color: row.value === '符合' ? 'var(--wot-success-main)' : 'var(--wot-danger-main)' }">
              {{ row.value }}
            </text>
            <text v-else :style="{ color: 'var(--wot-text-secondary)' }">
              请选择
            </text>
          </view>
        </template>
      </wd-table-column>
      <wd-table-column
        prop="remark"
        label="情况说明"
        align="center"
      >
        <template #value="{ row }">
          <wd-input v-model="row.remark" :disabled="isAuditMode" />
        </template>
      </wd-table-column>
    </wd-table>
  </view>
  <view v-else-if="['clean', 'disinfection'].includes(currentType)">
    <wd-table :data="itemArray">
      <wd-table-column
        prop="label"
        label="步骤"
        align="center"
        :width="120"
      />
      <wd-table-column
        prop="value"
        label="标准要求"
        align="center"
        :width="320"
      >
        <template #value="{ row }">
          <text v-if="row.type === 0">
            <wd-input v-model="row.value" :disabled="isAuditMode" />
          </text>
          <view
            v-if="[1, 2].includes(row.type)"
            :style="{ color: 'var(--wot-primary-5)' }"
            @click="!isAuditMode && selectOptions(row, row.options, row.type)"
          >
            <text v-if="row.value && row.value.length">
              <text v-if="CommonUtil.isArray(row.value)">
                {{ row.value.join(',') }}
              </text>
              <text v-else>
                {{ row.value }}
              </text>
            </text>
            <text v-else :style="{ color: 'var(--wot-text-secondary)' }">
              请选择
            </text>
          </view>
        </template>
      </wd-table-column>
      <wd-table-column
        prop="remark"
        label="执行记录"
        align="center"
        :width="500"
      >
        <template #value="{ row }">
          <wd-input v-model="row.remark" :disabled="isAuditMode">
            <template #suffix>
              <wd-button size="small" type="success" :disabled="isAuditMode" @click="row.remark = '已执行'">
                已执行
              </wd-button>
            </template>
          </wd-input>
        </template>
      </wd-table-column>
    </wd-table>
  </view>
  <view v-else-if="['rev'].includes(currentType)">
    <wd-table :data="itemArray">
      <wd-table-column
        prop="label"
        label="检查项目"
        align="center"
        :width="120"
      />
      <wd-table-column
        prop="value"
        label="接受标准"
        align="center"
        :width="320"
      >
        <template #value="{ row }">
          {{ row.standard }}
          <text v-if="row.type === 0" />
          <view
            v-if="[1, 2].includes(row.type)"
            :style="{ color: 'var(--wot-primary-5)' }"
            @click="!isAuditMode && selectOptions(row, row.options, row.type)"
          >
            <text v-if="row.value && row.value.length">
              <text v-if="CommonUtil.isArray(row.value)">
                {{ row.value.join(',') }}
              </text>
              <text v-else>
                {{ row.value }}
              </text>
            </text>
            <text v-else :style="{ color: 'var(--wot-text-secondary)' }">
              请选择
            </text>
          </view>
        </template>
      </wd-table-column>
      <wd-table-column
        prop="remark"
        label="检查结果"
        align="center"
        :width="500"
      >
        <template #value="{ row }">
          <view :style="{ cursor: isAuditMode ? 'default' : 'pointer' }" @click="!isAuditMode && selectOptions(row, hgOptions, 1, 'remark')">
            <text v-if="row.remark" :style="{ color: row.remark === '合格' ? 'var(--wot-success-main)' : 'var(--wot-danger-main)' }">
              {{ row.remark }}
            </text>
            <text v-else :style="{ color: 'var(--wot-text-secondary)' }">
              请选择
            </text>
          </view>
        </template>
      </wd-table-column>
    </wd-table>
  </view>
  <view v-else-if="['first'].includes(currentType)">
    <wd-table :data="itemArray">
      <wd-table-column
        prop="label"
        label="确认项目"
        align="center"
        :width="150"
      />
      <wd-table-column
        prop="standard"
        label="确认标准"
        align="center"
        :width="320"
      />
      <wd-table-column
        prop="value"
        label="检查结果"
        align="center"
        :width="180"
      >
        <template #value="{ row }">
          <view @click="selectOptions(row)">
            <text v-if="row.value" :style="{ color: row.value === '符合' ? 'var(--wot-success-main)' : 'var(--wot-danger-main)' }">
              {{ row.value }}
            </text>
            <text v-else :style="{ color: 'var(--wot-text-secondary)' }">
              请选择
            </text>
          </view>
        </template>
      </wd-table-column>
    </wd-table>
  </view>
  <view v-if="isAuditMode && form.opTime" class="audit-info">
    <wd-cell title="制单人" :value="form.opUser || '-'" />
    <wd-cell title="制单时间" :value="form.opTime || '-'" />
    <wd-cell title="审核人" :value="form.auditUser || '-'" />
    <wd-cell title="审核时间" :value="form.auditTime || '-'" />
    <wd-cell title="审核结论" :value="form.conclusion || '-'" />
    <wd-cell v-if="form.conclusion === '不符合'" title="拒绝原因" :value="form.rejectReason || '-'" />
  </view>
  <view v-if="isAuditMode && form.opTime" class="audit-reason">
    <wd-input v-model="form.rejectReason" placeholder="拒绝时请填写原因" :disabled="btnLoading" />
  </view>
  <view class="bottom-btn">
    <template v-if="isAuditMode">
      <view v-if="form.opUser" class="flex-wrapper">
        <wd-button :loading="btnLoading" type="success" @click="audit('符合')">
          符合
        </wd-button>
        <wd-button :loading="btnLoading" type="danger" @click="audit('不符合')">
          不符合
        </wd-button>
      </view>
    </template>
    <wd-button v-else :loading="btnLoading" block @click="submit">
      提交
    </wd-button>
  </view>
</template>

<style lang="scss" scoped>
.flex-wrapper {
  display: flex;
  gap: 16rpx;
  justify-content: space-around;
  align-items: center;
}

.page-mes-df__readonly {
  pointer-events: none;
}

.audit-info {
  margin-bottom: 20rpx;
}

.audit-reason {
  margin-bottom: 20rpx;
}

.bottom-btn {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
</style>
