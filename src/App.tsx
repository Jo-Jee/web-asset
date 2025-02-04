import { useEffect, useState } from 'react'
import { Group } from './interfaces/group'
import { GroupRatio } from './interfaces/groupRatio'
import { assetAPI } from './utils/API'

interface ProcessedItem {
  id: number
  name: string
  prices: number[]
  balances: number[]
}

interface ProcessedGroup {
  id: number
  name: string
  items: ProcessedItem[]
}

function App() {
  const [groups, setGroups] = useState<ProcessedGroup[]>([])
  const [monthlyTotal, setMonthlyTotal] = useState<Map<string, number>[]>([])

  useEffect(() => {
    fetchData()

    async function fetchData() {
      const rationesRes = await assetAPI.get<GroupRatio[]>(
        '/items/groups/rationes'
      )

      const groupRes = await assetAPI.get<Group[]>('/items/groups')
      const monthlyTotal: Map<string, number>[] = new Array(12)
        .fill(null)
        .map(
          (_) =>
            new Map<string, number>([
              ['total', 0],
              ...groupRes.data.map<[string, number]>((group) => [
                group.name,
                0,
              ]),
            ])
        )

      const groups = groupRes.data
        .sort((a, b) => a.id - b.id)
        .map((group) => {
          const groupItems: ProcessedItem[] = group.items.map((item) => {
            const groupItem: ProcessedItem = {
              id: item.id,
              name: item.name,
              prices: new Array(12).fill(0),
              balances: new Array(12).fill(0),
            }

            item.prices.forEach((price) => {
              groupItem.prices[price.month - 1] = price.price
            })

            item.records.forEach((record) => {
              const month = record.month - 1
              const total = monthlyTotal[month]

              const balance = record.quantity * groupItem.prices[month]

              groupItem.balances[month] += balance
              total.set('total', (total.get('total') || 0) + balance)
              total.set(group.name, (total.get(group.name) || 0) + balance)
            })

            return groupItem
          })

          return { ...group, items: groupItems }
        })

      setGroups(groups)
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
        {groups.map((group) => (
          <GroupColumn key={group.id} group={group} />
        ))}
        <Column
          title="계"
          contents={monthlyTotal.map((total) => total.get('total') || 0)}
        />
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

function GroupColumn({ group }: { group: ProcessedGroup }) {
  return (
    <div>
      <div className="bg-gray-200 font-bold text-center">{group.name}</div>
      <div className="flex">
        {group.items.map((item) => (
          <Column
            key={item.id}
            title={item.name}
            contents={item.balances!}
            parent
          />
        ))}
      </div>
    </div>
  )
}

function Column({
  title,
  contents,
  parent,
}: {
  title: string
  contents: string[] | number[]
  parent?: boolean
}) {
  return (
    <div>
      {!parent && <div className="h-3 bg-gray-200" />}
      {!parent && <div className="h-3 bg-gray-200" />}
      <div className="text-center bg-gray-200 p-2 font-bold px-4">{title}</div>
      {contents.map((content, i) => (
        <div key={i} className="text-right odd:bg-gray-200 px-4">
          {content}
        </div>
      ))}
    </div>
  )
}

export default App
