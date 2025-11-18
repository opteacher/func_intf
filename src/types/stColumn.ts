import { BaseMapper } from '@lib/types/mapper'
import { cloneDeep } from 'lodash'

export default class StColumn extends BaseMapper {
  required: boolean

  constructor() {
    super()
    this.required = false
  }

  reset() {
    super.reset()
    this.required = false
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
