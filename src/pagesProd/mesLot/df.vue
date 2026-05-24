<script setup lang="ts">
import type { ApiResult } from '@/types/common/apiResult'
import type { Options } from '@/types/common/options'
import type { MesLot } from '@/types/production/mesLot'
import type { ProductionTemplate } from '@/types/production/productionTemplate'
import dayjs from 'dayjs'
import { useGlobalLoading } from '@/composables/useGlobalLoading'
import { useGlobalToast } from '@/composables/useGlobalToast'
import { useAuthStore } from '@/store/authStore'
import http from '@/utils/request'

const toast = useGlobalToast()
const authStore = useAuthStore()
definePage({
  name: 'mesLotDf',
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
})
const mesLot = reactive<MesLot>({})
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
type MesLotJsonKey = 'openJson' | 'cleanJson' | 'disinfectionJson' | 'revJson' | 'firstJson' | 'closeJson'

const getMesLotJsonKey = (type: string): MesLotJsonKey => {
  const keyMap: Record<string, MesLotJsonKey> = {
    open: 'openJson',
    clean: 'cleanJson',
    disinfection: 'disinfectionJson',
    inspection: 'revJson',
    first: 'firstJson',
    close: 'closeJson',
  }
  return keyMap[type] ?? 'openJson'
}

const init = async (obj: any) => {
  currentType.value = obj.type
  uni.setNavigationBarTitle({ title: currentTypeLabel.value })
  loading.loading('加载中...')
  const res: ApiResult<MesLot> = await http.get(`/production/mesLot/${obj.id}`)
  if (res.code === 200 && res.data) {
    const data: MesLot = res.data
    Object.assign(mesLot, data)
    const jsonKey = getMesLotJsonKey(currentType.value)
    const currentJson = data[jsonKey]
    if (currentJson) {
      const json = JSON.parse(currentJson)
      form.opUser = json.opUser
      form.opTime = json.opTime
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
  const jsonForm: any = Object.assign({}, form)
  jsonForm.opUser = authStore.user?.nickName ?? ''
  jsonForm.opTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  jsonForm.array = itemArray

  try {
    btnLoading.value = true
    const res: ApiResult<any> = await http.put('/production/mesLot', {
      id: mesLot.id,
      [`${currentType.value}Json`]: JSON.stringify(jsonForm),
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
      <wd-table-column
        prop="remark"
        label="情况说明"
        align="center"
      >
        <template #value="{ row }">
          <wd-input v-model="row.remark" />
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
            <wd-input v-model="row.value" />
          </text>
          <view
            v-if="[1, 2].includes(row.type)"
            :style="{ color: 'var(--wot-primary-5)' }"
            @click="selectOptions(row, row.options, row.type)"
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
          <wd-input v-model="row.remark">
            <template #suffix>
              <wd-button size="small" type="success" @click="row.remark = '已执行'">
                已执行
              </wd-button>
            </template>
          </wd-input>
        </template>
      </wd-table-column>
    </wd-table>
  </view>
  <view v-else-if="['inspection'].includes(currentType)">
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
          <text v-if="row.type === 0">
            {{ row.standard }}
          </text>
          <view
            v-if="[1, 2].includes(row.type)"
            :style="{ color: 'var(--wot-primary-5)' }"
            @click="selectOptions(row, row.options, row.type)"
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
          <view style="cursor: pointer;" @click="selectOptions(row, hgOptions, 1, 'remark')">
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
  <view class="bottom-btn">
    <wd-button :loading="btnLoading" block @click="submit">
      提交
    </wd-button>
  </view>
</template>
