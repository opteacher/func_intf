import { gnlCpy } from '@lib/utils'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

const initDtTm = dayjs('1970-00-00 00:00:00:000')

export class ExcState {
  notEnough: boolean
  qryFreq: string[][]
  samePos: string[][]
  samePsn: string[][]

  constructor() {
    this.notEnough = false
    this.qryFreq = []
    this.samePos = []
    this.samePsn = []
  }

  reset() {
    this.notEnough = false
    this.qryFreq = []
    this.samePos = []
    this.samePsn = []
  }

  static copy(src: any, tgt?: ExcState, force = false): ExcState {
    return gnlCpy(ExcState, src, tgt, { force })
  }
}

export default class FstRes {
  key: string
  no: number
  name: string
  institution: string
  date: Dayjs
  begTime: Dayjs
  endTime: Dayjs
  qNum: number
  pNum: number
  cNum: number
  exStat: ExcState

  constructor() {
    this.key = ''
    this.no = -1
    this.name = ''
    this.institution = ''
    this.date = initDtTm
    this.begTime = initDtTm
    this.endTime = initDtTm
    this.qNum = 0
    this.pNum = 0
    this.cNum = 0
    this.exStat = new ExcState()
  }

  reset() {
    this.key = ''
    this.no = -1
    this.name = ''
    this.institution = ''
    this.date = initDtTm
    this.begTime = initDtTm
    this.endTime = initDtTm
    this.qNum = 0
    this.pNum = 0
    this.cNum = 0
    this.exStat.reset()
  }

  static copy(src: any, tgt?: FstRes, force = false): FstRes {
    return gnlCpy(FstRes, src, tgt, { force, cpyMapper: { exStat: ExcState.copy } })
  }
}
