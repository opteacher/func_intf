import StUser from '@/types/stUser'
import { defineStore } from 'pinia'
import api from '@/api'

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
      this.user = await api.shareTable.user.login(user)
    }
  }
})
