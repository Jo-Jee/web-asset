import { useEffect, useState } from 'react'
import { assetAPI } from './utils/API'
import { Item } from './interfaces/Item'

function App() {
  const [items, setItems] = useState<Item[]>([])
  const [monthlyTotal, setMonthlyTotal] = useState<number[]>([])

  useEffect(() => {
    fetchItems()
    async function fetchItems() {
      const res = await assetAPI.get<Item[]>('/items')
      const monthlyTotal: number[] = new Array(12).fill(0)
      const tunedItems: Item[] = []

      for (const item of res.data) {
        const tunedItem = { ...item, balances: new Array(12).fill(0) }
        tunedItem.balances.forEach((_, month) => {
          const record = item.records.find(
            (record) => record.month === month + 1
          )

          if (record) {
            tunedItem.balances[month] = record.price * record.quantity
            monthlyTotal[month] =
              monthlyTotal[month] + tunedItem.balances[month]
          }
        })

        tunedItems.push(tunedItem)
      }

      setItems(tunedItems)
      setMonthlyTotal(monthlyTotal)
    }
  }, [])

  return (
    <div className="flex p-4 space-y-4">
      <div className="flex">
        <Column
          title="월"
          contents={new Array(12).fill(null).map((_, i) => i + 1)}
        />
        {items.map((item) => (
          <Column title={item.name} contents={item.balances!} />
        ))}
        <Column title="계" contents={monthlyTotal} />
      </div>
      <RatioTable />
    </div>
  )
}

function RatioTable() {
  const [rationes, setRationes] = useState()
  useEffect(() => {}, [])
  return <div>RatioTable</div>
}

function Column({
  title,
  contents,
}: {
  title: string
  contents: string[] | number[]
}) {
  return (
    <div>
      <div className="text-center bg-gray-200 p-2 font-bold px-4">{title}</div>
      {contents.map((content) => (
        <div className="text-right odd:bg-gray-200 px-4">{content}</div>
      ))}
    </div>
  )
}

export default App
