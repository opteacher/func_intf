import { getProp, gnlCpy } from '@lib/utils'

export type NumOrAll = number | '*'

export class AuCond {
  relate: keyof typeof relDict
  prop: string
  compare: keyof typeof cmpDict
  value: any

  constructor() {
    this.relate = '&&'
    this.prop = ''
    this.compare = '=='
    this.value = undefined
  }

  reset() {
    this.relate = '&&'
    this.prop = ''
    this.compare = '=='
    this.value = undefined
  }

  static copy(src: any, tgt?: AuCond, force = false) {
    return gnlCpy(AuCond, src, tgt, { force })
  }
}

export const cmpDict = {
  '==': '等于',
  '!=': '不等于'
}

export const relDict = {
  '&&': '与',
  '||': '或',
  '!': '非'
}

export interface AuthInterface {
  addable: boolean
  deletable: boolean
  delOnlyOwn: boolean
  updatable: boolean
  updOnlyOwn: boolean
  queriable: boolean
  qryOnlyOwn: boolean
  canAddNum: NumOrAll
  canDelRows: AuCond[]
  canUpdRows: AuCond[]
  canQryRows: AuCond[]
  reset(): void
}

export default class Auth implements AuthInterface {
  addable: boolean
  deletable: boolean
  delOnlyOwn: boolean
  updatable: boolean
  updOnlyOwn: boolean
  queriable: boolean
  qryOnlyOwn: boolean
  canAddNum: NumOrAll
  canDelRows: AuCond[]
  canUpdRows: AuCond[]
  canQryRows: AuCond[]
  static _cmpDict = {
    '==': (record: any, cond: AuCond) => getProp(record, cond.prop) === cond.value,
    '!=': (record: any, cond: AuCond) => getProp(record, cond.prop) !== cond.value
  }
  static _relDict = {
    '&&': (record: any, former: boolean, cond: AuCond) =>
      former && Auth._cmpDict[cond.compare](record, cond),
    '||': (record: any, former: boolean, cond: AuCond) =>
      former || Auth._cmpDict[cond.compare](record, cond),
    '!': (record: any, former: boolean, cond: AuCond) =>
      former && !Auth._cmpDict[cond.compare](record, cond)
  }

  constructor() {
    this.addable = true
    this.deletable = true
    this.delOnlyOwn = true
    this.updatable = true
    this.updOnlyOwn = true
    this.queriable = true
    this.qryOnlyOwn = false
    this.canAddNum = 1
    this.canDelRows = []
    this.canUpdRows = []
    this.canQryRows = [new AuCond()]
  }

  reset() {
    this.addable = true
    this.deletable = true
    this.delOnlyOwn = true
    this.updatable = true
    this.updOnlyOwn = true
    this.queriable = true
    this.qryOnlyOwn = false
    this.canAddNum = 1
    this.canDelRows = []
    this.canUpdRows = []
    this.canQryRows = [new AuCond()]
  }

  canOperRow(oper: 'canDelRows' | 'canUpdRows' | 'canQryRows', record: any): boolean {
    return this[oper].reduce(
      (ret: boolean, cond: AuCond) => Auth._relDict[cond.relate](record, ret, cond),
      true
    )
  }

  canOperRows(oper: 'canDelRows' | 'canUpdRows' | 'canQryRows', records: any[]) {
    if (!this[oper].length) {
      return []
    } else if (!this[oper][0].prop && !this[oper][0].value) {
      return ['*']
    }
    return records.filter(record => this.canOperRow(oper, record))
  }

  static copy(src: any, tgt?: Auth, force = false): Auth {
    return gnlCpy(Auth, src, tgt, {
      force,
      cpyMapper: {
        canDelRows: AuCond.copy,
        canUpdRows: AuCond.copy,
        canQryRows: AuCond.copy
      }
    })
  }
}
