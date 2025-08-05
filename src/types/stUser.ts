import { gnlCpy } from '@lib/utils'
import Auth from './stAuth'
import { BaseMapper } from '@lib/types/mapper'
import { cloneDeep } from 'lodash'

export default class StUser extends BaseMapper {
  key: string
  lgnIden: string // 登录标识
  password: string
  auth: Auth

  constructor() {
    super()
    this.key = ''
    this.lgnIden = ''
    this.password = ''
    this.auth = new Auth()
  }

  reset() {
    super.reset()
    this.key = ''
    this.lgnIden = ''
    this.password = ''
    this.auth = new Auth()
  }

  static copy(src: any, tgt?: StUser, force = false) {
    return gnlCpy(StUser, src, tgt, { force, baseCpy: cloneDeep, cpyMapper: { auth: Auth.copy } })
  }
}
