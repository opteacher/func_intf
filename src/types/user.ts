import { gnlCpy } from '@lib/utils'
import Policy, { PlcPath } from './policy'

export default class User {
  key: string
  roleId: string
  role: string
  policies: PlcPath[]

  constructor() {
    this.key = ''
    this.roleId = ''
    this.role = ''
    this.policies = []
  }

  reset() {
    this.key = ''
    this.roleId = ''
    this.role = ''
    this.policies = []
  }

  static copy(src: any, tgt?: User, force = false) {
    const isOrgPlc = src.policies && src.policies[0] && src.policies[0].policy
    tgt = gnlCpy(User, src, tgt, {
      force,
      ignProps: isOrgPlc ? ['policies'] : undefined
    })
    if (isOrgPlc) {
      tgt.policies = src.policies.map((policy: any) => Policy.copy(policy).paths).flat()
    }
    return tgt
  }
}
