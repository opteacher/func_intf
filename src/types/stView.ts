export default class StView {
  key: string
  vtype: 'table' | 'chart'
  size: 'small' | 'middle' | 'large'
  wrapCols: number

  constructor() {
    this.key = ''
    this.vtype = 'table'
    this.size = 'large'
    this.wrapCols = 0
  }
}