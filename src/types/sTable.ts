import Mapper, { EdtLstMapper } from '@lib/types/mapper'
import { gnlCpy } from '@lib/utils'
import StUser from './stUser'
import StRcd from './stRecord'

export default class STable {
  key: string
  name: string
  form: object
  editMod: 'form' | 'direct' // 表单类型
  fkUsers: StUser[]
  fkRecords: StRcd[]

  constructor() {
    this.key = ''
    this.name = ''
    this.form = {}
    this.editMod = 'direct' // 默认是直接类型
    this.fkUsers = []
    this.fkRecords = []
  }

  reset() {
    this.key = ''
    this.name = ''
    this.form = {}
    this.editMod = 'direct' // 默认是直接类型
    this.fkUsers = []
    this.fkRecords = []
  }

  static copy(src: any, tgt?: STable, force = false): STable {
    return gnlCpy(STable, src, tgt, {
      force,
      cpyMapper: { fkUsers: StUser.copy, fkRecords: StRcd.copy }
    })
  }
}

export const avaCmpTypes = [
  'Input',
  'Number',
  'Textarea',
  'Select',
  'Radio',
  'Checkbox',
  'Switch',
  'UploadFile'
]

export const opnsMapper = {
  label: '选项',
  desc: '',
  type: 'EditList',
  placeholder: '',
  lblProp: 'label',
  subProp: 'value',
  inline: false,
  flatItem: false,
  mapper: new Mapper({
    label: {
      type: 'Input',
      label: '显示名',
      placeholder: '输入选项值，不填则使用选项值'
    },
    value: {
      type: 'Input',
      label: '选项值',
      placeholder: '输入选项值',
      rules: [{ required: true, message: '必须给出值名！' }]
    }
  })
} as EdtLstMapper

export const extraDict = {
  Input: {
    prefix: {
      type: 'Input',
      label: '前缀',
      placeholder: '输入输入框前缀'
    },
    suffix: {
      type: 'Input',
      label: '后缀',
      placeholder: '输入输入框后缀'
    }
  },
  Number: {
    prefix: {
      type: 'Input',
      label: '前缀',
      placeholder: '输入输入框前缀'
    },
    suffix: {
      type: 'Input',
      label: '后缀',
      placeholder: '输入输入框后缀'
    }
  },
  Textarea: {
    maxRows: {
      type: 'Number',
      label: '最大行数',
      placeholder: '输入最大行数'
    }
  },
  Select: {
    options: opnsMapper
  },
  Radio: {
    options: opnsMapper,
    style: {
      type: 'Radio',
      label: '样式',
      options: [
        {
          label: '点式',
          value: 'circle'
        },
        {
          label: '按钮式',
          value: 'button'
        }
      ]
    }
  },
  Checkbox: {
    options: opnsMapper,
    chkLabels: {
      type: 'Unknown',
      label: '复选框标签'
    }
  },
  Switch: {
    chkLabels: {
      type: 'Unknown',
      label: '开关标签'
    }
  },
  UploadFile: {
    path: {
      type: 'Input',
      label: '上传URL地址'
    },
    params: {
      type: 'EditList',
      label: '上传参数',
      lblProp: 'param',
      subProp: 'value',
      inline: true,
      flatItem: false,
      mapper: new Mapper({
        param: {
          type: 'Input',
          label: '参数名',
          placeholder: '输入参数名'
        },
        value: {
          type: 'Input',
          label: '参数值',
          placeholder: '输入参数值'
        }
      })
    },
    directory: {
      type: 'Switch',
      label: '是否上传文件夹'
    },
    headers: {
      type: 'JsonEditor',
      label: '请求头'
    }
  }
}
