import { useAuthStore } from '@/store/authStore'

interface Dict {
  dictValue: string
  dictLabel: string
  [key: string]: unknown
}

export const filterParams = (obj: any) => {
  const _newPar: any = {}
  for (const key in obj) {
    // 如果对象属性的值不为空，就保留该属性；这里做了限制：属性值为 0 或 false 也保留，且全部为空格的字符串视为无效。
    if (
      (obj[key] === 0 || obj[key] === false || obj[key])
      && obj[key].toString().replace(/(^\s*)|(\s*$)/g, '') !== ''
      && key !== 'page'
      && key !== 'limit'
    ) {
      _newPar[key] = obj[key]
    }
  }
  return _newPar
}

export const navTo = (url: string) => {
  uni.navigateTo({
    url,
  })
}

export const previewImg = (url?: string) => {
  if (url) {
    uni.previewImage({
      urls: [url],
    })
  }
}

export const getDictOptions = (dictType: string) => {
  const dictData: any = uni.getStorageSync('dict_data')
  if (dictData) {
    return dictData[dictType]
  }
}

export const getDictData = (dictType: string) => {
  const array = getDictOptions(dictType)
  if (array && array[0]) {
    return array.map((i: Dict) => {
      return {
        value: i.dictValue,
        text: i.dictLabel,
      }
    })
  }
}

export const getDictLabel = (dictType: string, dictValue: string) => {
  if (dictValue) {
    const dictData = uni.getStorageSync('dict_data')
    const array = dictData[dictType].filter(
      (i: Dict) => i.dictValue === dictValue,
    )
    if (Array.isArray(array) && array[0]) {
      return array[0].dictLabel
    }
  }
}

export const getDictLabels = (dictType: string, dictValue: string) => {
  if (dictValue) {
    const vals = dictValue.split(',')
    if (vals.length > 0) {
      const labelArray = []
      for (const v of vals) {
        labelArray.push(getDictLabel(dictType, v))
      }
      if (labelArray.length > 0) {
        return labelArray.join(',')
      }
    }
  }
}

export const getOptionsLabel = (array: Array<any>, value: string) => {
  const arr = array.filter(i => i.value === value)
  if (arr && arr[0]) {
    return arr[0].label
  }
  else {
    return ''
  }
}

export const getOptionsLabels = (array: Array<any>, value: string) => {
  if (value) {
    const vals = value.split(',')
    if (vals.length > 0) {
      const labelArray = []
      for (const v of vals) {
        labelArray.push(getOptionsLabel(array, v))
      }
      if (labelArray.length > 0) {
        return labelArray.join(',')
      }
    }
  }
  const arr = array.filter(i => i.value === value)
  if (arr && arr[0]) {
    return arr[0].label
  }
}

export const resetForm = (obj: any) => {
  const keys = Object.keys(obj)
  for (const key of keys) {
    obj[key] = undefined
  }
}

/**
 * 将总秒数转换成 分：秒
 * @param seconds - 秒
 */
export const secondToMinute = (seconds: number) => {
  const SECONDS_A_MINUTE = 60
  const minuteNum = Math.floor(seconds / SECONDS_A_MINUTE)
  const second = seconds - minuteNum * SECONDS_A_MINUTE
  return `${minuteNum}分${second}秒`
}

/**
 * 根据日期计算年龄
 */
export const getAge = (val: any) => {
  const currentYear = new Date().getFullYear()
  const calculationYear = new Date(val).getFullYear()
  const wholeTime = currentYear + val.substring(4)
  const calculationAge = currentYear - calculationYear

  // 判断是否过了生日
  if (new Date().getTime() > new Date(wholeTime).getTime()) {
    return calculationAge
  }
  else {
    return calculationAge - 1
  }
}

export const hasPerms = (perms: string) => {
  const authStore = useAuthStore()
  const userPerms = authStore.perms || []
  if (userPerms) {
    return userPerms.includes(perms)
  }
  return false
}

export const hasRole = (roles: string) => {
  const authStore = useAuthStore()
  const userRoles = authStore.roles || []
  if (userRoles) {
    return userRoles.includes(roles)
  }
  return false
}
