import { BaseMapper } from '@lib/types/mapper'
import { gnlCpy } from '@lib/utils'

export default class StColumn extends BaseMapper {
  required: boolean
  reqErrMsg: string

  constructor() {
    super()
    this.required = true
    this.reqErrMsg = '必须输入或选择有效值！'
  }

  reset() {
    super.reset()
    this.required = true
    this.reqErrMsg = '必须输入或选择有效值！'
  }

  static copy(src: any, tgt?: StColumn, force = false) {
    return gnlCpy(StColumn, src, tgt, { force, baseCpy: () => new BaseMapper() })
  }
}
