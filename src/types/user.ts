import { gnlCpy } from '@lib/utils'
import dayjs, { Dayjs } from 'dayjs'

export default class User {
  key: string
  role: string
  creation_time: Dayjs

  constructor() {
    this.key = ''
    this.role = ''
    this.creation_time = dayjs()
  }

  reset() {
    this.key = ''
    this.role = ''
    this.creation_time = dayjs()
  }

  static copy(src: any, tgt?: User, force = false) {
    return gnlCpy(User, src, tgt, { force })
  }
}
