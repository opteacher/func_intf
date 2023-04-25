import Role from './types/role'
import Policy, { PlcPath } from './types/policy'
import { RequestOptions, reqAll, reqDelete, reqGet, reqPost, reqPut } from './utils'
import User from './types/user'
import KV from './types/kv'
import Login from './types/login'
import { message } from 'ant-design-vue'
import { v4 } from 'uuid'
import ZSK from './types/zsk'

const toolOpns = { project: 'tools_box', type: 'api' } as RequestOptions
const secretOpns = { project: 'secret_manager', type: 'api' } as RequestOptions

const genWithLgnTkn = (): RequestOptions =>
  ({
    axiosConfig: {
      headers: { 'X-Login-Token': window.localStorage.getItem('token') }
    }
  } as RequestOptions)

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
      all: () => reqPost('role', { opera: 'list' }, Object.assign({ copy: Role.copy }, secretOpns)),
      add: (role: Role) => reqPost('role', Object.assign({ opera: 'create' }, role), secretOpns),
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
      all: () => reqPost('secret', { opera: 'list' }, Object.assign(genWithLgnTkn(), secretOpns)),
      remove: (secret: string) =>
        reqPost('secret', { opera: 'delete', secret }, Object.assign(genWithLgnTkn(), secretOpns)),
      kv: {
        all: (secret: string) =>
          secret
            ? reqPost(
                'secret',
                { opera: 'get', secret },
                Object.assign({ notShow: true }, genWithLgnTkn(), secretOpns)
              ).then(res =>
                Object.entries(res).map(([skey, svalue]) =>
                  KV.copy({ key: v4(), secret, skey, svalue })
                )
              )
            : [],
        save: (sctKV: KV, refresh = () => console.log()) =>
          reqPost(
            'secret',
            Object.assign({ opera: 'put' }, sctKV),
            Object.assign(genWithLgnTkn(), secretOpns)
          ).then(refresh),
        remove: (sctKV: KV, refresh: () => any) =>
          reqPost(
            'secret',
            Object.assign({ opera: 'delete' }, sctKV),
            Object.assign(genWithLgnTkn(), secretOpns)
          ).then(refresh)
      }
    }
  },
  chatGlm: {
    zsk: {
      all: () => reqAll('zsk', { project: 'chat_glm_config' }),
      add: (zsk: ZSK) => reqPost('zsk', zsk, { project: 'chat_glm_config' }),
      update: (zsk: ZSK) => reqPut('zsk', zsk.key, zsk, { project: 'chat_glm_config' }),
      remove: (zsk: ZSK) => reqDelete('zsk', zsk.key, { project: 'chat_glm_config' }),
      download: (zsk: ZSK) =>
        reqGet('zsk', 'download', {
          project: 'chat_glm_config',
          type: 'api',
          axiosConfig: { params: { file: zsk.params[0] } }
        })
    }
  }
}
