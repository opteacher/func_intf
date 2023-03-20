import { gnlCpy } from '@lib/utils'

export default class Login {
  roleId: string
  secretId: string

  constructor() {
    this.roleId = ''
    this.secretId = ''
  }

  reset() {
    this.roleId = ''
    this.secretId = ''
  }

  static copy(src: any, tgt?: Login, force = false) {
    return gnlCpy(Login, src, tgt, { force })
  }
}
