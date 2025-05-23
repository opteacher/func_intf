import { gnlCpy } from '@lib/utils'
import dayjs, { Dayjs } from 'dayjs'

export default class PdfRcd {
  key: string
  orgFile: string
  pcsFile?: string
  upldTime: Dayjs
  pcsdTime: Dayjs
  status: 'succeed' | 'processing' | 'failed'
  url?: string
  pid?: string
  src?: string

  constructor() {
    this.key = ''
    this.orgFile = ''
    this.upldTime = dayjs(null)
    this.pcsdTime = dayjs(null)
    this.status = 'processing'
  }

  reset() {
    this.key = ''
    this.orgFile = ''
    this.pcsFile = undefined
    this.upldTime = dayjs(null)
    this.pcsdTime = dayjs(null)
    this.status = 'processing'
    this.url = undefined
    this.pid = undefined
    this.src = undefined
  }

  static copy(src: any, tgt?: PdfRcd, force = false) {
    return gnlCpy(PdfRcd, src, tgt, { force })
  }
}
