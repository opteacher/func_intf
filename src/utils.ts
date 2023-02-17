export * from '@lib/utils'

export function obj2opns(obj: Record<string, any>) {
  return Object.entries(obj).map(([value, label]) => ({ label, value }))
}
