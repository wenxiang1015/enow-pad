import type { Router } from '@wot-ui/router'
import { useGlobalToast } from '@/composables/useGlobalToast'
import { useAuthStore } from '@/store/authStore'

/**
 * Public routes (no login): route `name` from each page's definePage({ name }).
 * Add a string here for any page that should stay reachable without a token.
 *
 * Example: export const authRouteWhitelist: string[] = ['login', 'about']
 */
export const authRouteWhitelist: string[] = [
  'login',
]

function isWhitelisted(name?: string) {
  if (!name)
    return false
  return authRouteWhitelist.includes(name)
}

/**
 * Auth guard: same idea as enow-app - block without token unless whitelisted;
 * if already logged in and opening login, send user to home.
 *
 * Note (@wot-ui/router): first screen from pages.json is opened by uni-app directly.
 * Route sync uses onLoad/onShow -> syncRouteFromPage(), which only runs afterEach,
 * not beforeEach. So we also enforce auth in afterEach for cold start (e.g. H5 localhost).
 */
export function setupAuthRouterGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (authStore.isLogin) {
      if (to.name === 'login') {
        next({ name: 'home', navType: 'replaceAll' })
        return
      }
      next()
      return
    }

    if (isWhitelisted(to.name as string | undefined)) {
      next()
      return
    }

    if (to.name !== 'login') {
      const toast = useGlobalToast()
      toast.info('\u8BF7\u5148\u767B\u5F55')
    }

    next({ name: 'login' })
  })

  router.afterEach((to) => {
    const authStore = useAuthStore()

    if (authStore.isLogin) {
      if (to.name === 'login')
        router.replaceAll({ name: 'home' })
      return
    }

    if (isWhitelisted(to.name as string | undefined))
      return

    const toast = useGlobalToast()
    toast.info('\u8BF7\u5148\u767B\u5F55')
    router.replaceAll({ name: 'login' })
  })
}
