export function objToOpns(obj: Record<string, any>) {
  return Object.entries(obj).map(([value, label]) => ({ label, value }))
}
