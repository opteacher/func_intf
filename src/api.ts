import Role from './types/role'
import Policy from './types/policy'
import { reqGet, reqPost } from './utils'
import User from './types/user'

export default {
  toolBox: {
    encode: (text: string, encType: string, extra?: any) =>
      reqGet('encode', undefined, {
        project: 'tool_box',
        type: 'api',
        axiosConfig: { params: Object.assign(extra || {}, { text, code: encType }) }
      }),
    crypto: (crypt: 'encrypt' | 'decrypt', alg: string, data: string[], secret?: string) =>
      reqGet('crypto', crypt, {
        project: 'tool_box',
        type: 'api',
        axiosConfig: { params: { data, alg, secret } }
      }),
    random: (randType: 'number' | 'uuid' | 'string' | 'name', params?: any) =>
      reqGet('random', randType, {
        project: 'tool_box',
        type: 'api',
        axiosConfig: { params: Object.assign(params || {}, { mode: randType }) }
      })
  },
  secret: {
    policy: {
      all: () =>
        reqPost(
          'policy',
          { opera: 'list' },
          {
            project: 'secret-manager',
            type: 'api'
          }
        ).then(ress => ress.map((res: any) => Policy.copy(res))),
      path: (policy: Policy) => ({
        all: () => policy.paths
      })
    },
    role: {
      all: () =>
        reqPost(
          'role',
          { opera: 'list' },
          {
            project: 'secret-manager',
            type: 'api',
            copy: Role.copy
          }
        )
    },
    user: {
      all: () =>
        reqPost(
          'user',
          { opera: 'list' },
          {
            project: 'secret-manager',
            type: 'api'
          }
        ).then(ress => ress.map((res: any) => User.copy(res)))
    }
  }
}
