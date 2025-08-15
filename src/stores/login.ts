import StUser from '@/types/stUser'
import { defineStore } from 'pinia'
import api from '@/api'
import router from '../router'

export const useLoginStore = defineStore('login', {
  state: () => ({ user: null as StUser | null }),
  actions: {
    logout() {
      this.user = null
    },
    isLogined() {
      return this.user != null
    },
    async login(user: StUser) {
      this.user = await api.shareTable
        .user(router.currentRoute.value.query.tid as string)
        .login(user)
    }
  }
})
