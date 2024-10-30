import { Item } from './Item'

export interface Group {
  id: number
  name: string
  items: Item[]
}
