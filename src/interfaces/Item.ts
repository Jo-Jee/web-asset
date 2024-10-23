import { Record } from './record'

export interface Item {
  id: number
  name: string
  records: Record[]
  balances?: number[]
}
