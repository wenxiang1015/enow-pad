import type { RequestBody } from 'alova'
import { alovaInstance } from '@/api/core/instance'

/** Optional settings aligned with enow-app luch-request usage */
export interface HttpExtraConfig {
  headers?: Record<string, string>
  /** When true, skips uni.showLoading / uni.hideLoading */
  skipLoading?: boolean
  timeout?: number
}

function applyAuth(headers: Record<string, string>) {
  try {
    const authStr = uni.getStorageSync('auth')
    if (!authStr)
      return
    const auth = typeof authStr === 'string' ? JSON.parse(authStr as string) : authStr
    if (auth?.token)
      headers.Authorization = `EnowRequestBearer ${auth.token}`
    if (auth?.wxToken)
      headers.WxAuth = `WxBearer ${auth.wxToken}`
  }
  catch {
    // ignore invalid storage
  }
}

function buildHeaders(extra?: HttpExtraConfig) {
  const headers: Record<string, string> = { ...extra?.headers }
  applyAuth(headers)
  return headers
}

async function withLoading<T>(skipLoading: boolean | undefined, run: () => Promise<T>): Promise<T> {
  if (!skipLoading) {
    await uni.showLoading({ title: '加载中...', mask: true })
  }
  try {
    return await run()
  }
  finally {
    if (!skipLoading)
      uni.hideLoading()
  }
}

function baseConfig(extra?: HttpExtraConfig) {
  const cfg: { headers: Record<string, string>, timeout?: number } = {
    headers: buildHeaders(extra),
  }
  if (extra?.timeout !== undefined)
    cfg.timeout = extra.timeout
  return cfg
}

function asBody(data: unknown): RequestBody | undefined {
  return data as RequestBody | undefined
}

/**
 * Thin HTTP helper around Alova (same import style as enow-app: `import http from '@/utils/request'`).
 */
export const http = {
  get<T = unknown>(url: string, params?: Record<string, unknown>, extra?: HttpExtraConfig): Promise<T> {
    return withLoading(extra?.skipLoading, async () => {
      const method = alovaInstance.Get<T>(url, {
        params: params ?? {},
        ...baseConfig(extra),
      })
      return method.send() as Promise<T>
    })
  },

  post<T = unknown>(url: string, data?: unknown, extra?: HttpExtraConfig): Promise<T> {
    return withLoading(extra?.skipLoading, async () => {
      const method = alovaInstance.Post<T>(url, asBody(data), {
        ...baseConfig(extra),
      })
      return method.send() as Promise<T>
    })
  },

  put<T = unknown>(url: string, data?: unknown, extra?: HttpExtraConfig): Promise<T> {
    return withLoading(extra?.skipLoading, async () => {
      const method = alovaInstance.Put<T>(url, asBody(data), {
        ...baseConfig(extra),
      })
      return method.send() as Promise<T>
    })
  },

  patch<T = unknown>(url: string, data?: unknown, extra?: HttpExtraConfig): Promise<T> {
    return withLoading(extra?.skipLoading, async () => {
      const method = alovaInstance.Patch<T>(url, asBody(data), {
        ...baseConfig(extra),
      })
      return method.send() as Promise<T>
    })
  },

  delete<T = unknown>(url: string, params?: Record<string, unknown>, extra?: HttpExtraConfig): Promise<T> {
    return withLoading(extra?.skipLoading, async () => {
      const method = alovaInstance.Delete<T>(url, undefined, {
        params: params ?? {},
        ...baseConfig(extra),
      })
      return method.send() as Promise<T>
    })
  },
}

export default http
