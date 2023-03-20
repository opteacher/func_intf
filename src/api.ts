import Role from './types/role'
import Policy from './types/policy'
import { RequestOptions, reqGet, reqPost } from './utils'
import User from './types/user'
import KV from './types/kv'
import Login from './types/login'
import { message } from 'ant-design-vue'
import { v4 } from 'uuid'

const toolOpns = { project: 'tool_box', type: 'api' } as RequestOptions
const secretOpns = { project: 'secret-manager', type: 'api' } as RequestOptions

export default {
  toolBox: {
    encode: (text: string, encType: string, extra?: any) =>
      reqGet(
        'encode',
        undefined,
        Object.assign(
          {
            axiosConfig: { params: Object.assign(extra || {}, { text, code: encType }) }
          },
          toolOpns
        )
      ),
    crypto: (crypt: 'encrypt' | 'decrypt', alg: string, data: string[], secret?: string) =>
      reqGet(
        'crypto',
        crypt,
        Object.assign(
          {
            axiosConfig: { params: { data, alg, secret } }
          },
          toolOpns
        )
      ),
    random: (randType: 'number' | 'uuid' | 'string' | 'name', params?: any) =>
      reqGet(
        'random',
        randType,
        Object.assign(
          {
            axiosConfig: { params: Object.assign(params || {}, { mode: randType }) }
          },
          toolOpns
        )
      )
  },
  secret: {
    policy: {
      all: () =>
        reqPost('policy', { opera: 'list' }, secretOpns).then(ress =>
          ress.map((res: any) => Policy.copy(res))
        ),
      path: (policy: Policy) => ({
        all: () => policy.paths
      })
    },
    role: {
      all: () => reqPost('role', { opera: 'list' }, Object.assign({ copy: Role.copy }, secretOpns))
    },
    user: {
      all: () =>
        reqPost('user', { opera: 'list' }, secretOpns).then(ress =>
          ress.map((res: any) => User.copy(res))
        ),
      login: (form: Login) =>
        reqPost('user/login', form, secretOpns).then(resp => {
          window.localStorage.setItem('token', resp.client_token)
          const msg = '登录成功！'
          message.success(msg)
          return msg
        })
    },
    secret: {
      all: () => reqPost('secret', { opera: 'list' }, secretOpns),
      kv: {
        all: (secret: string) =>
          secret
            ? reqPost(
                'secret',
                { opera: 'get', secret },
                Object.assign(
                  {
                    notShow: true,
                    axiosConfig: {
                      headers: { 'X-Login-Token': window.localStorage.getItem('token') }
                    }
                  } as RequestOptions,
                  secretOpns
                )
              ).then(res =>
                Object.entries(res).map(([subKey, subVal]) =>
                  KV.copy({ key: v4(), secret, subKey, subVal })
                )
              )
            : []
      }
    }
  }
}
