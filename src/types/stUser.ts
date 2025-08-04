import { gnlCpy } from '@lib/utils'
import Auth from './stAuth'

export default class StUser {
  key: string
  email: string
  password: string
  auth: Auth

  constructor() {
    this.key = ''
    this.email = ''
    this.password = ''
    this.auth = new Auth()
  }

  reset() {
    this.key = ''
    this.email = ''
    this.password = ''
    this.auth = new Auth()
  }

  static copy(src: any, tgt?: StUser, force = false) {
    return gnlCpy(StUser, src, tgt, { force, cpyMapper: { auth: Auth.copy } })
  }
}
