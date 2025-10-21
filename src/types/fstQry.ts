import { gnlCpy } from '@lib/utils'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

export class ExceptConds {
  qryRate: number
  minPeople: number
  minCars: number
  minDist: number

  constructor() {
    this.qryRate = 10 // N秒一次
    this.minPeople = 20
    this.minCars = 10
    this.minDist = 0.0000000000001
  }

  reset() {
    this.qryRate = 10
    this.minPeople = 20
    this.minCars = 10
    this.minDist = 0.0000000000001
  }

  static copy(src: any, tgt?: ExceptConds, force = false): ExceptConds {
    return gnlCpy(ExceptConds, src, tgt, { force })
  }
}

export default class FstQry {
  names: string[]
  tmRange: [Dayjs, Dayjs]
  institution: string
  exceptConds: ExceptConds

  constructor() {
    this.names = []
    this.tmRange = [dayjs(), dayjs()]
    this.institution = ''
    this.exceptConds = new ExceptConds()
  }

  reset() {
    this.names = []
    this.tmRange[0] = dayjs()
    this.tmRange[1] = dayjs()
    this.institution = ''
    this.exceptConds.reset()
  }

  static copy(src: any, tgt?: FstQry, force = false): FstQry {
    return gnlCpy(FstQry, src, tgt, { force, cpyMapper: { exceptConds: ExceptConds.copy } })
  }
}
