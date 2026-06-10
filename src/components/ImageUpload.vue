<script setup lang="ts">
import type { ImageMode } from '@wot-ui/ui/components/wd-img/types'
import type { UploadFileType } from '@wot-ui/ui/components/wd-upload/types'
import type { UploadExtraConfig } from '@/utils/request'
import http from '@/utils/request'

interface Props {
  action?: string
  accept?: UploadFileType
  imageMode?: ImageMode
  name?: string
  successStatus?: number[]
  timeout?: number
  headers?: Record<string, string>
  formData?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  action: '/common/upload',
  accept: 'image',
  imageMode: 'aspectFill',
  name: 'file',
  successStatus: () => [200],
  headers: () => ({}),
  formData: () => ({}),
})

interface SimpleFileItem {
  name: string
  url: string
}

const fileList = defineModel<SimpleFileItem[]>({ default: () => [] })
const uploadFileList = computed<any[]>({
  get: () => fileList.value.map(item => ({
    name: item.name,
    url: item.url,
  })),
  set: (val) => {
    fileList.value = (val || []).map((item) => {
      const remoteUrl = item?.response?.url || item?.response?.data?.url || item?.url
      return {
        name: item.name,
        url: remoteUrl,
      }
    })
  },
})

const uploadMethod = async (file: any, formData: Record<string, any>, options: any) => {
  const extra: UploadExtraConfig = {
    headers: {
      ...props.headers,
      ...(options.header || {}),
    },
    formData: {
      ...props.formData,
      ...(formData || {}),
    },
    timeout: props.timeout ?? options.timeout,
    skipLoading: true,
  }

  try {
    const data = await http.upload(props.action!, file.url, props.name || options.name || 'file', extra)
    options.onSuccess(
      {
        data,
        statusCode: props.successStatus?.[0] ?? 200,
      },
      file,
      formData,
    )
  }
  catch (err) {
    options.onError(err, file, formData)
  }
}
</script>

<template>
  <wd-upload
    v-model:file-list="uploadFileList"
    :accept="accept"
    :image-mode="imageMode"
    :action="action"
    :success-status="successStatus"
    :upload-method="uploadMethod"
  />
</template>
