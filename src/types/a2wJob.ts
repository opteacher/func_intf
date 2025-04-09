export default class A2wJob {
  key: string
  name: string
  url: string
  status: 'succeed' | 'failed' | 'processing'

  constructor() {
    this.key = ''
    this.name = ''
    this.url = ''
    this.status = 'processing'
  }

  reset() {
    this.key = ''
    this.name = ''
    this.url = ''
    this.status = 'processing'
  }
}
