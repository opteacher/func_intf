import Role from './types/role'
import Policy, { PlcPath } from './types/policy'
import {
  RequestOptions,
  gnlCpy,
  makeRequest,
  reqAll,
  reqDelete,
  reqGet,
  reqPost,
  reqPut,
  setProp
} from './utils'
import User from './types/user'
import KV from './types/kv'
import Login from './types/login'
import { message } from 'ant-design-vue'
import { v4 } from 'uuid'
import ZSK, { LibType } from './types/zsk'
import axios, { AxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import A2wJob from './types/a2wJob'
import PdfRcd from './types/pdfRcd'

export const isProd = process.env.NODE_ENV === 'production'
const gpusHost = '38.155.60.235'
const appsHost = '38.152.2.152'
const testHost = '192.168.1.11'

export const toolsBoxURL = isProd ? `http://${appsHost}:3121` : undefined
export const secretMgrURL = isProd ? `http://${appsHost}:3143` : undefined
export const chatGlmURL = isProd ? `http://${appsHost}:8441` : undefined
export const mqttHost = isProd ? appsHost : testHost
export const ado2WdsURL = isProd ? `http://${gpusHost}:5111` : ''
export const mgcPdfURL = isProd ? `http://${gpusHost}:3290` : ''

const toolOpns = {
  project: 'tools_box',
  type: 'api',
  axiosConfig: { baseURL: toolsBoxURL }
} as RequestOptions
const secretOpns = {
  project: 'secret_manager',
  type: 'api',
  axiosConfig: { baseURL: secretMgrURL }
}
const chatGlmOpns = {
  project: 'chat_glm_config',
  axiosConfig: { baseURL: chatGlmURL }
} as RequestOptions
const chatGlmApiOpns = { type: 'api', ...chatGlmOpns } as RequestOptions
const ado2WdsOpns = {
  project: 'audio_words',
  copy: (src: any) => gnlCpy(A2wJob, src),
  axiosConfig: { baseURL: ado2WdsURL }
} as RequestOptions
const mgcPdfOpns = {
  project: 'magic_pdf_apis',
  axiosConfig: { baseURL: mgcPdfURL }
} as RequestOptions

const bindLgnTkn = (): RequestOptions => {
  ;(secretOpns.axiosConfig as AxiosRequestConfig<any>).headers = {
    'X-Login-Token': window.localStorage.getItem('token')
  } as AxiosRequestHeaders
  return secretOpns
}

const expIns = {
  toolBox: {
    encode: (text: string, encType: string, extra = {}) =>
      reqGet(
        'encode',
        undefined,
        setProp(toolOpns, 'axiosConfig.params', { ...extra, text, code: encType })
      ),
    crypto: (crypt: 'encrypt' | 'decrypt', alg: string, data: string[], secret?: string) =>
      reqGet('crypto', crypt, setProp(toolOpns, 'axiosConfig.params', { data, alg, secret })),
    random: (randType: 'number' | 'uuid' | 'string' | 'name', params = {}) =>
      reqGet(
        'random',
        undefined,
        setProp(toolOpns, 'axiosConfig.params', { ...params, mode: randType })
      )
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
      viewFile: async (zsk: ZSK, fIdx: number) => {
        const path = await reqGet('zsk', `${zsk.key}/file/${fIdx}/view`, chatGlmApiOpns)
        window.open(chatGlmURL + path, '_blank')
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
  },
  audio2Words: {
    a2wJob: {
      all: () => reqAll('a2wJob', ado2WdsOpns),
      remove: (jobId: string) =>
        reqDelete('a2wJob', jobId, {
          ...ado2WdsOpns,
          messages: { succeed: '删除成功！', failed: '删除失败！' }
        })
    }
  },
  magicPdf: {
    record: {
      all: () => reqAll('record', { ...mgcPdfOpns, copy: (src: any) => gnlCpy(PdfRcd, src) }),
      remove: (rcdId: string) =>
        reqDelete('record', rcdId, {
          ...mgcPdfOpns,
          messages: { succeed: '删除成功！', failed: '删除失败！' }
        })
    },
    pdf: {
      upload: (form: any) =>
        reqPost('pdf', form, {
          ...mgcPdfOpns,
          action: 'upload',
          messages: { succeed: '上传成功！', failed: '上传失败！' }
        }),
      get: (url: string) => makeRequest(axios.get(url), { messages: { failed: '查询文档失败！' } })
    }
  }
}
export default expIns
