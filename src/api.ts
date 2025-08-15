import Role from './types/role'
import Policy, { PlcPath } from './types/policy'
import {
  type RequestOptions,
  gnlCpy,
  makeRequest,
  pickOrIgnore,
  reqAll,
  reqDelete,
  reqGet,
  reqLink,
  reqPost,
  reqPut,
  setProp
} from './utils'
import User from './types/user'
import KV from './types/kv'
import Login from './types/login'
import { message } from 'ant-design-vue'
import { v4 } from 'uuid'
import ZSK, { type LibType } from './types/zsk'
import axios, { type AxiosRequestConfig } from 'axios'
import A2wJob from './types/a2wJob'
import PdfRcd from './types/pdfRcd'
import STable from './types/sTable'
import router from './router'
import StUser from './types/stUser'
import StRcd from './types/stRecord'
import { useLoginStore } from './stores/login'
import Auth from '@/types/stAuth'

const gpusHost = '38.155.60.235'
const appsHost = '38.152.2.152'
const testHost = '192.168.1.11'

export const toolsBoxURL = import.meta.env.PROD ? `http://${appsHost}:3121` : undefined
export const secretMgrURL = import.meta.env.PROD ? `http://${appsHost}:3143` : undefined
export const chatGlmURL = import.meta.env.PROD ? `http://${appsHost}:8441` : undefined
export const mqttHost = import.meta.env.PROD ? appsHost : testHost
export const ado2WdsURL = import.meta.env.PROD ? `http://${gpusHost}:5111` : ''
export const mgcPdfURL = import.meta.env.PROD ? `http://${gpusHost}:3290` : ''

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
  } as any
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
      all: () => reqAll('a2wJob', { ...ado2WdsOpns, messages: { notShow: true } }),
      remove: (jobId: string) =>
        reqDelete('a2wJob', jobId, {
          ...ado2WdsOpns,
          messages: { succeed: '删除成功！', failed: '删除失败！' }
        })
    }
  },
  magicPdf: {
    record: {
      all: () =>
        reqAll('record', {
          ...mgcPdfOpns,
          messages: { notShow: true },
          copy: (src: any) => gnlCpy(PdfRcd, src)
        }),
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
      get: (url: string) =>
        makeRequest(axios.get(url, { baseURL: mgcPdfURL }), {
          messages: { failed: '查询文档失败！' }
        })
    }
  },
  shareTable: {
    stable: {
      all: () => reqAll<STable>('stable', { project: 'share-table', copy: STable.copy }),
      add: (stable: STable) => reqPost('stable', stable, { project: 'share-table' }),
      get: (tid: string) =>
        reqGet<STable>('stable', tid, { project: 'share-table', copy: STable.copy }),
      update: (stable: any) =>
        reqPut('stable', stable.key, stable, {
          project: 'share-table',
          ignores: ['fkUsers', 'fkRecords']
        }),
      remove: (stable: STable) =>
        reqDelete('stable', stable.key, { project: 'share-table', type: 'api' })
    },
    user: (tid = router.currentRoute.value.query.tid as string) => ({
      all: () =>
        reqGet<STable>('stable', tid, {
          project: 'share-table',
          copy: STable.copy
        }).then(stbl => stbl.fkUsers as StUser[]),
      add: async (stUser: StUser, auth?: Auth) => {
        let tempAuth = auth
        if (!tempAuth) {
          tempAuth = await expIns.shareTable.stable
            .get(tid as string)
            .then(stable => stable.tempAuth)
        }
        return reqPost(
          `stable/${tid}/user`,
          {
            ...pickOrIgnore(stUser, ['auth']),
            auth: tempAuth
          },
          {
            type: 'api',
            action: 'register',
            project: 'share-table',
            copy: StUser.copy
          }
        )
      },
      update: (stUser: any) => reqPut('user', stUser.key, stUser, { project: 'share-table' }),
      remove: async (stUser: StUser) => {
        await reqLink(
          {
            parent: ['stable', tid],
            child: ['fkUsers', stUser.key]
          },
          false,
          { project: 'share-table' }
        )
        return reqDelete('user', stUser.key, { project: 'share-table' })
      },
      login: (stUser: StUser) =>
        reqPost(`stable/${tid}/user`, stUser, {
          project: 'share-table',
          action: 'login',
          type: 'api',
          copy: StUser.copy
        })
    }),
    data: (tid = router.currentRoute.value.query.tid as string) => ({
      all: () =>
        reqGet<STable>('stable', tid, {
          project: 'share-table',
          copy: STable.copy
        }).then(stbl =>
          (stbl.fkRecords as StRcd[]).map(rcd => ({ key: rcd.key, fkUser: rcd.fkUser, ...rcd.raw }))
        ),
      add: async (raw: any) => {
        const newRcd = await reqPost<StRcd>(
          'record',
          { raw },
          { project: 'share-table', copy: StRcd.copy }
        )
        await reqLink(
          {
            parent: ['stable', tid],
            child: ['fkRecords', newRcd.key]
          },
          true,
          { project: 'share-table' }
        )
        const store = useLoginStore()
        if (store.user?.key) {
          await reqLink(
            {
              parent: ['record', newRcd.key],
              child: ['fkUser', store.user?.key]
            },
            true,
            { project: 'share-table' }
          )
        }
        return newRcd
      },
      update: (record: any) =>
        reqPut(
          'record',
          record.key,
          { raw: pickOrIgnore(record, ['key'], true) },
          { project: 'share-table' }
        ),
      remove: async (stRcd: StRcd) => {
        await reqLink(
          {
            parent: ['stable', tid],
            child: ['fkRecords', stRcd.key]
          },
          false,
          { project: 'share-table' }
        )
        return reqDelete('record', stRcd.key, { project: 'share-table' })
      },
      count: (uid?: string) =>
        tid
          ? reqGet(`stable/${tid}/record`, undefined, {
              project: 'share-table',
              action: 'count',
              type: 'api',
              axiosConfig: { params: { uid } }
            })
          : 0,
      ownByWho: (uid: string) =>
        reqGet<STable>('stable', tid, {
          project: 'share-table',
          copy: STable.copy
        }).then(stbl =>
          (stbl.fkRecords as StRcd[])
            .filter(rcd => rcd.fkUser === uid)
            .map(rcd => ({ key: rcd.key, fkUser: rcd.fkUser, ...rcd.raw }))
        )
    })
  }
}
export default expIns
