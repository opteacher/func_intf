import { gnlCpy } from '@lib/utils'
import { cloneDeep } from 'lodash'

export default class StRcd {
  key: string
  raw: object
  fkUser: string

  constructor() {
    this.key = ''
    this.raw = {}
    this.fkUser = ''
  }

  reset() {
    this.key = ''
    this.raw = {}
    this.fkUser = ''
  }

  static copy(src: any, tgt?: StRcd, force = false) {
    return gnlCpy(StRcd, src, tgt, { force, cpyMapper: { raw: cloneDeep } })
  }
}
