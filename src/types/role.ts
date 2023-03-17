import { gnlCpy } from '@/utils'
import { v4 } from 'uuid'

export default class Role {
  key: string
  name: string
  policy: string

  constructor() {
    this.key = ''
    this.name = ''
    this.policy = ''
  }

  reset() {
    this.key = ''
    this.name = ''
    this.policy = ''
  }

  static copy(src: any, tgt?: Role, force = false) {
    return gnlCpy(Role, Object.assign({ key: v4() }, src), tgt, { force })
  }
}
