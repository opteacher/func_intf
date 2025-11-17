import Mapper, { EdtLstMapper } from '@lib/types/mapper'
import { gnlCpy } from '@lib/utils'
import StUser from './stUser'
import { Cond } from '@lib/types'
import { cloneDeep } from 'lodash'
import Auth from './stAuth'
import StOpLog from './stOpLog'
import type { SizeType } from 'ant-design-vue/es/config-provider'
import StView from './stView'

export default class STable {
  key: string
  name: string
  form: Object
  path: string[]
  edtMod: 'form' | 'direct' // 表单类型
  usrAuth: boolean // 是否需要用户权限
  usrReg: boolean // 允许用户自己注册
  size: SizeType
  usrExtra: Mapper
  tempAuth: Auth
  fkUsers: (StUser | string)[]
  fkOplogs: (StOpLog | string)[]
  fkViews: (StView | string)[]

  constructor() {
    this.key = ''
    this.name = ''
    this.form = {}
    this.path = []
    this.edtMod = 'direct' // 默认是直接类型
    this.usrAuth = false // 默认不需要用户权限
    this.usrReg = false
    this.size = undefined
    this.usrExtra = new Mapper()
    this.tempAuth = new Auth()
    this.fkUsers = []
    this.fkOplogs = []
    this.fkViews = []
  }

  reset() {
    this.key = ''
    this.name = ''
    this.form = {}
    this.path = []
    this.edtMod = 'direct' // 默认是直接类型
    this.usrAuth = false
    this.usrReg = false
    this.size = undefined
    this.usrExtra = new Mapper()
    this.tempAuth = new Auth()
    this.fkUsers = []
    this.fkOplogs = []
    this.fkViews = []
  }

  static copy(src: any, tgt?: STable, force = false): STable {
    return gnlCpy(STable, src, tgt, {
      force,
      cpyMapper: {
        usrExtra: cloneDeep,
        tempAuth: Auth.copy,
        fkUsers: StUser.copy,
        fkOpLogs: StOpLog.copy,
        fkViews: StView.copy
      }
    })
  }
}

export const avaCmpTypes = [
  'Input',
  'IpAddress',
  'Number',
  'Textarea',
  'Select',
  'Radio',
  'Checkbox',
  'Switch',
  'DateTime',
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
  IpAddress: {},
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
    options: opnsMapper,
    allowClear: {
      type: 'Checkbox',
      label: '可清空选择',
      chkLabels: ['不可', '可以'],
      placeholder: '在选择框右侧显示一个清空按钮'
    },
    searchable: {
      type: 'Switch',
      label: '可搜索选项'
    }
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
      type: 'CompactInput',
      label: '复选框标签',
      placeholders: ['未选中', '选中'],
      splitLetter: '|'
    }
  },
  Switch: {
    chkLabels: {
      type: 'CompactInput',
      label: '开关标签',
      placeholders: ['关', '开'],
      splitLetter: '/'
    }
  },
  DateTime: {
    format: {
      type: 'SelOrIpt',
      label: '格式化',
      options: ['YYYY/MM/DD HH:mm:ss', 'YYYY年MM月DD日 - HH时mm分ss秒'].map(value => ({
        label: value,
        value
      })),
      mode: 'select'
    },
    showTime: {
      type: 'Switch',
      label: '显示时间'
    },
    hourStep: {
      type: 'Number',
      label: '小时步进',
      display: [Cond.create('showTime', '==', true)]
    },
    minuteStep: {
      type: 'Number',
      label: '分钟步进',
      display: [Cond.create('showTime', '==', true)]
    },
    secondStep: {
      type: 'Number',
      label: '秒步进',
      display: [Cond.create('showTime', '==', true)]
    },
    dsbHours: {
      type: 'EditList',
      label: '显示小时数',
      display: [Cond.create('showTime', '==', true)],
      mapper: new Mapper({ hour: { type: 'Number' } }),
      inline: true,
      flatItem: true,
      newFun: () => ({ hour: 0 })
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
