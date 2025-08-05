import { gnlCpy } from '@lib/utils'
import Auth from './stAuth'

export default class StUser {
  key: string
  lgnIden: string // 登录标识
  password: string
  auth: Auth

  constructor() {
    this.key = ''
    this.lgnIden = ''
    this.password = ''
    this.auth = new Auth()
  }

  reset() {
    this.key = ''
    this.lgnIden = ''
    this.password = ''
    this.auth = new Auth()
  }

  static copy(src: any, tgt?: StUser, force = false) {
    return gnlCpy(StUser, src, tgt, { force, cpyMapper: { auth: Auth.copy } })
  }
}
