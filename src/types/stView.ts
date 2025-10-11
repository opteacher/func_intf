import { gnlCpy } from '@lib/utils'
import type STable from './sTable'
import type StRcd from './stRecord'
import Column from '@lib/types/column'
import _ from 'lodash'

export default class StView {
  key: string
  name: string
  vtype: 'table' | 'chart'
  size: 'small' | 'middle' | 'large'
  wrap: number
  group: string

  constructor() {
    this.key = ''
    this.name = ''
    this.vtype = 'table'
    this.size = 'large'
    this.wrap = 0
    this.group = ''
  }

  reset() {
    this.key = ''
    this.name = ''
    this.vtype = 'table'
    this.size = 'large'
    this.wrap = 0
    this.group = ''
  }

  static copy(src: any, tgt?: StView, force = false): StView {
    return gnlCpy(StView, src, tgt, { force })
  }
}

export function genViewRefresh(stable: STable, sview: StView) {
  return (records: StRcd[], callback: Function) => {
    if (sview.vtype === 'table') {
      let fixRcds: any[] = records
      if (sview.group) {
        fixRcds = _.sortBy(records, [sview.group])
        const unqDict = {} as Record<string, number>
        for (let i = 0; i < fixRcds.length; ++i) {
          const value = fixRcds[i][sview.group]
          if (!(value in unqDict)) {
            unqDict[value] = i
          }
        }
        const unqAry = Object.entries(unqDict).sort((a, b) => b[1] - a[1])
        const colsExpGrp = Object.keys(stable.form).filter(k => k !== sview.group)
        for (const [value, index] of unqAry) {
          fixRcds.splice(index, 0, { [colsExpGrp[0]]: value })
        }
      }
      if (sview.wrap) {
        const rcds = []
        const wrpLen = sview.wrap + 1
        const fixLen = Math.ceil(fixRcds.length / wrpLen)
        for (let i = 0; i < fixLen; ++i) {
          const rcdAry = Object.entries(fixRcds[i])
          for (let j = 1; j <= wrpLen; ++j) {
            const index = i + fixLen * j
            if (index >= fixRcds.length) {
              break
            }
            rcdAry.push(
              ...(Object.entries(fixRcds[i + fixLen * j]).map(([key, value]) => [
                [key, j].join('_'),
                value
              ]) as [string, any][])
            )
          }
          rcds.push(Object.fromEntries(rcdAry))
        }
        fixRcds = rcds
      }
      callback(fixRcds)
    }
  }
}

export function genViewColumns(stable: STable, sview: StView) {
  const fmExpGrp = Object.entries(stable.form).filter(([key]) => sview.group !== key)
  const genCell = (key: string) => ({
    custCell: (record: any) => {
      const rcdKeys = record ? Object.keys(record) : []
      return sview.group &&
        fmExpGrp[0][0] === key &&
        record &&
        rcdKeys.length === 1 &&
        rcdKeys[0] === sview.group
        ? { colSpan: fmExpGrp.length }
        : undefined
    }
  })
  return Array.from({ length: sview.wrap + 1 }, (_v, i) =>
    fmExpGrp.map(
      ([key, { label }]) => new Column(label, i ? [key, i].join('_') : key, genCell(key))
    )
  ).flat()
}
