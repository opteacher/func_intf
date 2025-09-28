import { gnlCpy } from '@lib/utils'

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

  constructor() {
    this.addable = true
    this.deletable = true
    this.delOnlyOwn = true
    this.updatable = true
    this.updOnlyOwn = true
    this.queriable = true
    this.qryOnlyOwn = false
    this.canAddNum = 1
    this.canDelRows = [new AuCond()]
    this.canUpdRows = [new AuCond()]
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
    this.canDelRows = [new AuCond()]
    this.canUpdRows = [new AuCond()]
    this.canQryRows = [new AuCond()]
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
