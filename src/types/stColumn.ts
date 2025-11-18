import { BaseMapper } from '@lib/types/mapper'
import { cloneDeep } from 'lodash'

export default class StColumn extends BaseMapper {
  required: boolean
  reqErrMsg: string

  constructor() {
    super()
    this.required = false
    this.reqErrMsg = ''
  }

  reset() {
    super.reset()
    this.required = false
    this.reqErrMsg = ''
  }

  static copy(src: any, tgt?: StColumn, force = false) {
    if (src) {
      tgt = cloneDeep(src)
    } else if (force) {
      tgt = new StColumn()
    }
    return tgt
  }
}
