import { Price } from './price'
import { Record } from './record'

export interface Item {
  id: number
  name: string
  records: Record[]
  prices: Price[]
}
