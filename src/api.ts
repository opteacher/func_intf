import { reqGet } from './utils'

export default {
  toolBox: {
    encode: (text: string, encType: string, extra?: any) =>
      reqGet('encode', encType, {
        project: 'tool_box',
        type: 'api',
        axiosConfig: { params: Object.assign(extra || {}, { text }) }
      }),
    crypto: (crypt: 'encrypt' | 'decrypt', alg: string, data: string[], secret?: string) =>
      reqGet('crypto', crypt, {
        project: 'tool_box',
        type: 'api',
        axiosConfig: { params: { data, alg, secret } }
      }),
    random: (randType: 'number' | 'uuid' | 'hex' | 'name', params?: any) =>
      reqGet('random', randType, { project: 'tool_box', type: 'api', axiosConfig: { params } })
  }
}
