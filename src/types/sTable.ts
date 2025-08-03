import { gnlCpy } from '@lib/utils'

export default class STable {
  key: string
  name: string
  form: object

  constructor() {
    this.key = ''
    this.name = ''
    this.form = {}
  }

  reset() {
    this.key = ''
    this.name = ''
    this.form = {}
  }

  static copy(src: any, tgt?: STable, force = false): STable {
    return gnlCpy(STable, src, tgt, { force })
  }
}
