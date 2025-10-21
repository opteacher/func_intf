import { gnlCpy } from '@lib/utils'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

export type Decimal = { $numberDecimal: string }

export default class FstRcd {
  key: string
  dyjkmc: string
  dyip: string
  kssj: Dayjs
  jssj: Dayjs
  cxrxm: string
  cxrzjhm: string
  cxrbmhz: string
  hcxm: string
  hczjhm: string
  hcrq: Dayjs
  lon: number
  lat: number
  deptCode: string

  constructor() {
    this.key = ''
    this.dyjkmc = ''
    this.dyip = ''
    this.kssj = dayjs()
    this.jssj = dayjs()
    this.cxrxm = ''
    this.cxrzjhm = ''
    this.cxrbmhz = ''
    this.hcxm = ''
    this.hczjhm = ''
    this.hcrq = dayjs()
    this.lon = -1
    this.lat = -1
    this.deptCode = ''
  }

  reset() {
    this.key = ''
    this.dyjkmc = ''
    this.dyip = ''
    this.kssj = dayjs()
    this.jssj = dayjs()
    this.cxrxm = ''
    this.cxrzjhm = ''
    this.cxrbmhz = ''
    this.hcxm = ''
    this.hczjhm = ''
    this.hcrq = dayjs()
    this.lon = -1
    this.lat = -1
    this.deptCode = ''
  }

  static copy(src: any, tgt?: FstRcd, force = false): FstRcd {
    tgt = gnlCpy(FstRcd, src, tgt, { force, ignProps: ['lon', 'lat'] })
    if (force || src.lon) {
      if ('$numberDecimal' in src.lon) {
        tgt.lon = parseFloat(src.lon['$numberDecimal'])
      } else if (typeof src.lon === 'number') {
        tgt.lon = src.lon
      } else {
        tgt.lon = 0
      }
    }
    if (force || src.lat) {
      if ('$numberDecimal' in src.lat) {
        tgt.lat = parseFloat(src.lat['$numberDecimal'])
      } else if (typeof src.lat === 'number') {
        tgt.lat = src.lat
      } else {
        tgt.lat = 0
      }
    }
    return tgt
  }
}
