import { gnlCpy } from '@lib/utils'

export default class FmDsgn {
  cstmForm: string
  edtMapper: any
  sbtToRes: boolean

  constructor() {
    this.cstmForm = ''
    this.edtMapper = {}
    this.sbtToRes = false
  }

  reset() {
    this.cstmForm = ''
    this.edtMapper = {}
    this.sbtToRes = false
  }

  static copy(src: any, tgt?: FmDsgn, force = false) {
    return gnlCpy(FmDsgn, src, tgt, { force })
  }
}
