import { gnlCpy } from '@lib/utils'
import Auth from './stAuth'
import { BaseMapper, type MapperType } from '@lib/types/mapper'
import { cloneDeep } from 'lodash'

export default class StUser {
  key: string
  lgnIden: string // 登录标识
  password: string
  extra: object
  auth: Auth
  propForm: MapperType

  constructor() {
    this.key = ''
    this.lgnIden = ''
    this.password = ''
    this.extra = {}
    this.auth = new Auth()
    this.propForm = new BaseMapper()
  }

  reset() {
    this.key = ''
    this.lgnIden = ''
    this.password = ''
    this.extra = {}
    this.auth = new Auth()
    this.propForm = new BaseMapper()
  }

  static copy(src: any, tgt?: StUser, force = false) {
    return gnlCpy(StUser, src, tgt, { force, cpyMapper: { auth: Auth.copy, propForm: cloneDeep } })
  }
}
