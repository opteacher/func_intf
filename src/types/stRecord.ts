import { gnlCpy } from '@lib/utils'
import { cloneDeep } from 'lodash'

export default class StRcd {
  key: string
  raw: object

  constructor() {
    this.key = ''
    this.raw = {}
  }

  reset() {
    this.key = ''
    this.raw = {}
  }

  static copy(src: any, tgt?: StRcd, force = false) {
    return gnlCpy(StRcd, src, tgt, { force, cpyMapper: { raw: cloneDeep } })
  }
}
