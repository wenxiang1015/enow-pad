import { defineStore } from 'pinia'

/** Minimal user payload from /user/login */
export interface AuthUser {
  userId?: number
  userName?: string
  nickName?: string
  [key: string]: unknown
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: undefined as string | undefined,
    user: null as AuthUser | null,
    perms: [] as string[],
    roles: [] as string[],
  }),
  getters: {
    isLogin: state => !!state.token,
  },
  actions: {
    setSession(payload: { token: string, user: AuthUser, perms: string[], roles: string[] }) {
      this.token = payload.token
      this.user = payload.user
      this.perms = payload.perms
      this.roles = payload.roles
    },
    clearSession() {
      this.token = undefined
      this.user = null
      this.perms = []
      this.roles = []
    },
  },
})
