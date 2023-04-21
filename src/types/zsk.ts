import Column from '@lib/types/column'
import Mapper from '@lib/types/mapper'
import { gnlCpy } from '@lib/utils'

export const libTypes = {
  fs: '文件',
  dt: '数据源'
}

export type LibType = keyof typeof libTypes

export const lTpOpns = Object.entries(libTypes).map(([value, label]) => ({ label, value }))

export default class ZSK {
  key: string
  name: string
  ltype: LibType
  params: any[]

  constructor() {
    this.key = ''
    this.name = ''
    this.ltype = 'fs'
    this.params = []
  }

  reset() {
    this.key = ''
    this.name = ''
    this.ltype = 'fs'
    this.params = []
  }

  static copy(src: any, tgt?: ZSK, force = false): ZSK {
    return gnlCpy(ZSK, src, tgt, { force })
  }
}

export const columns = [
  new Column('名称', 'name'),
  new Column('类型', 'ltype'),
  new Column('参数', 'params')
]

export const mapper = new Mapper({
  name: {
    label: '名称',
    type: 'Input'
  },
  ltype: {
    label: '类型',
    type: 'Select',
    options: lTpOpns
  },
  params: {
    label: '参数',
    type: 'Unknown'
  }
})
