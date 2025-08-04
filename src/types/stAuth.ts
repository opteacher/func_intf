import { gnlCpy } from '@lib/utils'

export type NumOrAll = number | '*'

export interface AuthInterface {
  addable: boolean
  deletable: boolean
  delOnlyOwn: boolean
  updatable: boolean
  updOnlyOwn: boolean
  queriable: boolean
  qryOnlyOwn: boolean
  canAddNum: NumOrAll
  canDelRows: [NumOrAll, NumOrAll][]
  canUpdRowCells: [NumOrAll, NumOrAll][]
  canQryRowCells: [NumOrAll, NumOrAll][]
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
  canDelRows: [NumOrAll, NumOrAll][]
  canUpdRowCells: [NumOrAll, NumOrAll][]
  canQryRowCells: [NumOrAll, NumOrAll][]

  constructor() {
    this.addable = true
    this.deletable = true
    this.delOnlyOwn = true
    this.updatable = true
    this.updOnlyOwn = true
    this.queriable = true
    this.qryOnlyOwn = true
    this.canAddNum = 1
    this.canDelRows = [[0, '*']]
    this.canUpdRowCells = [['*', '*']]
    this.canQryRowCells = [['*', '*']]
  }

  reset() {
    this.addable = true
    this.deletable = true
    this.delOnlyOwn = false
    this.updatable = true
    this.updOnlyOwn = false
    this.queriable = true
    this.qryOnlyOwn = false
    this.canAddNum = 1
    this.canDelRows = [[0, '*']]
    this.canUpdRowCells = [['*', '*']]
    this.canQryRowCells = [['*', '*']]
  }

  static copy(src: any, tgt?: Auth, force = false): Auth {
    return gnlCpy(Auth, src, tgt, { force })
  }
}