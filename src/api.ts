import Role from './types/role'
import Policy, { PlcPath } from './types/policy'
import { RequestOptions, reqAll, reqDelete, reqGet, reqPost, reqPut } from './utils'
import User from './types/user'
import KV from './types/kv'
import Login from './types/login'
import { message } from 'ant-design-vue'
import { v4 } from 'uuid'
import ZSK, { LibType } from './types/zsk'
import { AxiosRequestConfig, AxiosRequestHeaders } from 'axios'

export const isProd = process.env.NODE_ENV === 'production'
const toolBaseURL = 'http://38.152.2.152:3121'
const toolOpns = {
  project: 'tools_box',
  type: 'api'
} as RequestOptions
const secretBaseURL = 'http://38.152.2.152:3143'
const secretOpns = {
  project: 'secret_manager',
  type: 'api',
  ...(isProd ? { axiosConfig: { baseURL: secretBaseURL } } : {})
} as RequestOptions
const chatBaseURL = 'http://38.152.2.152:8441'
const chatGlmOpns = {
  project: 'chat_glm_config',
  ...(isProd ? { axiosConfig: { baseURL: chatBaseURL } } : {})
} as RequestOptions
const chatGlmApiOpns = { type: 'api', ...chatGlmOpns } as RequestOptions

const bindLgnTkn = (): RequestOptions => {
  ;(secretOpns.axiosConfig as AxiosRequestConfig<any>).headers = {
    'X-Login-Token': window.localStorage.getItem('token')
  } as AxiosRequestHeaders
  return secretOpns
}

const expIns = {
  toolBox: {
    encode: (text: string, encType: string, extra?: any) =>
      reqGet('encode', undefined, {
        ...toolOpns,
        axiosConfig: {
          baseURL: isProd ? toolBaseURL : '',
          params: Object.assign(extra || {}, { text, code: encType })
        }
      }),
    crypto: (crypt: 'encrypt' | 'decrypt', alg: string, data: string[], secret?: string) =>
      reqGet('crypto', crypt, {
        ...toolOpns,
        axiosConfig: { baseURL: isProd ? toolBaseURL : '', params: { data, alg, secret } }
      }),
    random: (randType: 'number' | 'uuid' | 'string' | 'name', params?: any) =>
      reqGet('random', randType, {
        ...toolOpns,
        axiosConfig: {
          baseURL: isProd ? toolBaseURL : '',
          params: Object.assign(params || {}, { mode: randType })
        }
      })
  },
  secret: {
    policy: {
      all: () =>
        reqPost('policy', { opera: 'list' }, secretOpns).then(ress =>
          ress.map((res: any) => Policy.copy(Object.assign({ key: v4() }, res)))
        ),
      add: (policy: Policy) =>
        reqPost(
          'policy',
          { opera: 'write', name: policy.name, content: policy.policy },
          secretOpns
        ),
      update: (policy: Policy) =>
        reqPost(
          'policy',
          { opera: 'write', name: policy.name, content: policy.policy },
          secretOpns
        ),
      remove: (policy: Policy) =>
        reqPost('policy', { opera: 'delete', name: policy.name }, secretOpns),
      path: {
        all: (policy: Policy) => policy.paths,
        save: (policy: Policy, path: PlcPath) => {
          if (path.key) {
            PlcPath.copy(
              path,
              policy.paths.find(p => p.key === path.key),
              true
            )
          } else {
            policy.paths.push(path)
          }
          return reqPost(
            'policy',
            {
              opera: 'write',
              name: policy.name,
              content: Policy.toPaths(policy.paths)
            },
            secretOpns
          )
        },
        remove: (policy: Policy, path: PlcPath) =>
          reqPost(
            'policy',
            {
              opera: 'write',
              name: policy.name,
              content: Policy.toPaths(policy.paths.filter(p => p.key !== path.key))
            },
            secretOpns
          )
      }
    },
    role: {
      all: () => reqPost('role', { opera: 'list' }, { ...secretOpns, copy: Role.copy }),
      add: (role: Role) => reqPost('role', { opera: 'create', ...role }, secretOpns),
      remove: (role: Role) => reqPost('role', { opera: 'delete', name: role.name }, secretOpns)
    },
    user: {
      all: () =>
        reqPost('user', { opera: 'list' }, secretOpns).then(ress =>
          ress.map((res: any) => User.copy(Object.assign({ key: v4() }, res)))
        ),
      add: (user: User) => reqPost('user', { opera: 'create', role: user.role }, secretOpns),
      remove: (user: User) =>
        reqPost('user', { opera: 'delete', sctIdAcs: user.key, role: user.role }, secretOpns),
      login: (form: Login) =>
        reqPost('user/login', form, secretOpns).then(resp => {
          window.localStorage.setItem('token', resp.client_token)
          const msg = '登录成功！'
          message.success(msg)
          return msg
        })
    },
    secret: {
      all: () => reqPost('secret', { opera: 'list' }, bindLgnTkn()),
      remove: (secret: string) => reqPost('secret', { opera: 'delete', secret }, bindLgnTkn()),
      kv: {
        all: (secret: string) =>
          secret
            ? reqPost(
                'secret',
                { opera: 'get', secret },
                { messages: { notShow: true }, ...bindLgnTkn() }
              ).then(res =>
                Object.entries(res).map(([skey, svalue]) =>
                  KV.copy({ key: v4(), secret, skey, svalue })
                )
              )
            : [],
        save: (sctKV: KV, refresh = () => console.log()) =>
          reqPost('secret', Object.assign({ opera: 'put' }, sctKV), bindLgnTkn()).then(refresh),
        remove: (sctKV: KV, refresh: () => any) =>
          reqPost('secret', Object.assign({ opera: 'delete' }, sctKV), bindLgnTkn()).then(refresh)
      }
    }
  },
  chatGlm: {
    zsk: {
      all: () => reqAll('zsk', chatGlmOpns),
      add: (zsk: ZSK) => reqPost('zsk', zsk, chatGlmApiOpns),
      update: (zsk: ZSK) => reqPut('zsk', zsk.key, zsk, chatGlmOpns),
      remove: (zsk: ZSK) => reqDelete('zsk', zsk.key, chatGlmApiOpns),
      download: async (zsk: ZSK) => {
        const content = await reqGet('zsk', 'download', {
          ...chatGlmApiOpns,
          axiosConfig: { params: { file: zsk.params[0] } }
        })
        const link = document.createElement('a')

        // 创建对象url
        link.href = window.URL.createObjectURL(new Blob([content]))
        link.download = zsk.params[0].split('/').pop()
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      },
      reload: (zsk: ZSK) =>
        reqPost(`zsk/${zsk.ltype}/reload`, undefined, chatGlmApiOpns).then(() => {
          // 刷新页面
        }),
      crawling: (ltype: LibType) =>
        reqGet('zsk', `${ltype}/crawling`, {
          ...chatGlmApiOpns,
          messages: {
            notShow: true
          }
        })
    }
  }
}
export default expIns
