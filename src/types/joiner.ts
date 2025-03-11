import { gnlCpy } from '@lib/utils'

export default class Joiner {
  name: string
  department: string
  post: string
  phone: string
  topic: string

  constructor() {
    this.name = ''
    this.department = ''
    this.post = ''
    this.phone = ''
    this.topic = ''
  }

  reset() {
    this.name = ''
    this.department = ''
    this.post = ''
    this.phone = ''
    this.topic = ''
  }

  static copy(src: any, tgt?: Joiner, force = false) {
    return gnlCpy(src, tgt, { force })
  }
}
