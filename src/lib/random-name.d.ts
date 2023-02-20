declare class RandomName {
  getNickHeader(): string
  getNickFoot(): string
  getNickName(): string
  getFamilyName(sur = true): string
  getFemaleName(sur: boolean): string
  getMaleName(sur: boolean): string
  getName(sur: boolean): string
}
