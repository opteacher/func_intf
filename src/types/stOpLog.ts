import { gnlCpy } from '@lib/utils'
import StUser from './stUser'

export const operDict = {
  add: { label: '添加', color: 'green' },
  update: { label: '更新', color: 'blue' },
  delete: { label: '添加', color: 'red' },
  import: { label: '导入', color: 'pink' },
  export: { label: '导出', color: 'purple' },
  addCol: { label: '添加列', color: 'cyan' },
  delCol: { label: '删除列', color: 'orange' }
} as Record<string, any>

export default class StOpLog {
  key: string
  fkUser: string | StUser
  otype: keyof typeof operDict
  tkey: string
  okey: string
  former?: object
  latter?: object

  constructor() {
    this.key = ''
    this.fkUser = ''
    this.otype = 'add'
    this.tkey = ''
    this.okey = ''
  }

  reset() {
    this.key = ''
    this.fkUser = ''
    this.otype = 'add'
    this.tkey = ''
    this.okey = ''
    this.former = undefined
    this.latter = undefined
  }

  static copy(src: any, tgt?: StOpLog, force = false) {
    return gnlCpy(StOpLog, src, tgt, {
      force,
      cpyMapper: { fkUser: StUser.copy }
    })
  }
}
