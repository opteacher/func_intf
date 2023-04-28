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
  key: number
  name: string
  ltype: LibType
  params: any[]
  status: 'loading' | 'imported'

  constructor() {
    this.key = 0
    this.name = ''
    this.ltype = 'fs'
    this.params = []
    this.status = 'loading'
  }

  reset() {
    this.key = 0
    this.name = ''
    this.ltype = 'fs'
    this.params = []
    this.status = 'loading'
  }

  static copy(src: any, tgt?: ZSK, force = false): ZSK {
    return gnlCpy(ZSK, src, tgt, { force, ignProps: ['status'] })
  }
}

export const columns = [
  new Column('名称', 'name'),
  new Column('类型', 'ltype'),
  new Column('参数', 'params'),
  new Column('状态', 'status')
]

export const mapper = new Mapper({
  name: {
    label: '名称',
    type: 'Input',
    rules: [{ required: true, message: '必须输入名称！' }]
  },
  ltype: {
    label: '类型',
    type: 'Select',
    options: lTpOpns
  },
  params: {
    label: '参数',
    type: 'Unknown'
  },
  status: {
    label: '状态',
    type: 'Unknown',
    display: false
  }
})
