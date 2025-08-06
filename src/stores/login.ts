import { defineStore } from 'pinia'

export const useLoginStore = defineStore('login', {
  state: () => ({ token: '' }),
  actions: {
    logout() {
      this.token = ''
    }
  }
})
