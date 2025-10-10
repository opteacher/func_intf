import { gnlCpy } from '@lib/utils'
import { cloneDeep } from 'lodash'

export default class StRcd {
  key: string
  raw: object
  fkUser: string
  fkStable: string

  constructor() {
    this.key = ''
    this.raw = {}
    this.fkUser = ''
    this.fkStable = ''
  }

  reset() {
    this.key = ''
    this.raw = {}
    this.fkUser = ''
    this.fkStable = ''
  }

  static copy(src: any, tgt?: StRcd, force = false) {
    return gnlCpy(StRcd, src, tgt, { force, cpyMapper: { raw: cloneDeep } })
  }
}
