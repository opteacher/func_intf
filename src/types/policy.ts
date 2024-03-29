import { gnlCpy } from '@lib/utils'
import { v4 } from 'uuid'

export const operMap = {
  create: '新增',
  update: '更新',
  read: '读取',
  list: '罗列',
  delete: '删除'
}

export type OperType = keyof typeof operMap

export const operOpns = Object.entries(operMap).map(([value, label]) => ({ label, value }))

export class PlcPath {
  key: string
  path: string
  remark: string
  capabilities: OperType[]

  constructor() {
    this.key = ''
    this.path = ''
    this.remark = ''
    this.capabilities = []
  }

  reset() {
    this.key = ''
    this.path = ''
    this.remark = ''
    this.capabilities = []
  }

  static copy(src: any, tgt?: PlcPath, force = false) {
    return gnlCpy(PlcPath, src, tgt, { force })
  }
}

export default class Policy {
  key: string
  name: string
  policy: string
  paths: PlcPath[]

  constructor() {
    this.key = ''
    this.name = ''
    this.policy = ''
    this.paths = []
  }

  reset() {
    this.key = ''
    this.name = ''
    this.policy = ''
    this.paths = []
  }

  static fromPaths(policies: string, retFst = false): PlcPath[] {
    const ret: PlcPath[] = []
    const plcPath = new PlcPath()
    for (const line of policies.split('\n')) {
      if (line.startsWith('#')) {
        plcPath.remark += line.substring(1)
      } else if (line.startsWith('path')) {
        plcPath.path = line.slice('path "'.length, -'" {'.length)
      } else if (line.trimStart().startsWith('capabilities')) {
        plcPath.capabilities = JSON.parse(line.trimStart().substring('capabilities = '.length))

        const newPath = PlcPath.copy(plcPath)
        newPath.key = v4()
        if (retFst) {
          return [newPath]
        } else {
          ret.push(newPath)
          plcPath.reset()
        }
      }
    }
    return ret
  }

  static toPaths(paths: PlcPath[]): string {
    return paths
      .map(path =>
        [
          path.remark
            .split('\n')
            .map(line => '#' + line)
            .join('\n'),
          `path "${path.path}" {`,
          `  capabilities = [${path.capabilities.map(cap => '"' + cap + '"')}]`,
          '}'
        ].join('\n')
      )
      .join('\n')
  }

  static copy(src: any, tgt?: Policy, force = false): Policy {
    tgt = gnlCpy(Policy, src, tgt, {
      force,
      cpyMapper: { paths: PlcPath.copy }
    })
    if (src.policy) {
      tgt.paths = Policy.fromPaths(src.policy)
    }
    return tgt
  }
}
