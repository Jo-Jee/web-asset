import { useEffect, useState } from 'react'
import { assetAPI } from './utils/API'
import { Item } from './interfaces/Item'
import { Group } from './interfaces/group'
import { GroupRatio } from './interfaces/groupRatio'

function App() {
  const [groups, setGroups] = useState<Group[]>([])
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
          const tunedItems: Item[] = group.items.map((item) => {
            const tunedItem = { ...item, balances: new Array(12).fill(0) }
            tunedItem.balances.forEach((_, month) => {
              const record = item.records.find(
                (record) => record.month === month + 1
              )

              if (record) {
                const total = monthlyTotal[month]
                const balance = record.price * record.quantity

                tunedItem.balances[month] = balance
                total.set(
                  'total',
                  total.get('total') + tunedItem.balances[month]
                )
                total.set(group.name, total.get(group.name)! + balance)
              }
            })

            return tunedItem
          })

          return { ...group, items: tunedItems }
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

function GroupColumn({ group }: { group: Group }) {
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
