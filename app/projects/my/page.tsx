'use client'
import Link from 'next/link'
import { Shell } from '@/components/Shell'
import { useCurrentView } from '@/components/ViewSwitch'

type ProjectEntity = { id: string; name: string }

type Project = {
  id: string
  name: string
  owner: string
  customer: ProjectEntity
  brand: ProjectEntity
}

const PROJECTS: Project[] = [
  {
    id: 'prj_x',
    name: 'プロジェクトX',
    owner: 'あなた',
    customer: { id: 'acc_globalretail', name: 'A社（Global Retail Inc.）' },
    brand: { id: 'brd_shoestore', name: 'ShoeStore' },
  },
  {
    id: 'prj_q4',
    name: 'Q4 週次レポート自動化',
    owner: 'あなた',
    customer: { id: 'acc_globalretail', name: 'A社（Global Retail Inc.）' },
    brand: { id: 'brd_gadgets', name: 'Gadgets+' },
  },
  {
    id: 'prj_y',
    name: 'ブランド新規獲得強化',
    owner: 'あなた',
    customer: { id: 'acc_techstarter', name: 'B社（Tech Starter）' },
    brand: { id: 'brd_shoestore', name: 'ShoeStore' },
  },
  {
    id: 'prj_launch',
    name: '新商品ローンチ支援',
    owner: 'あなた',
    customer: { id: 'acc_techstarter', name: 'B社（Tech Starter）' },
    brand: { id: 'brd_futuretech', name: 'FutureTech Gear' },
  },
]

export default function MyProjects() {
  const view = useCurrentView()
  const grouping = view === 'brand' ? 'brand' : 'customer'

  const groupLabel = grouping === 'brand' ? 'ブランド' : '顧客'
  const groups = Object.values(
    PROJECTS.reduce(
      (acc, project) => {
        const entity = project[grouping]
        if (!entity) return acc
        const key = entity.id
        if (!acc[key]) {
          acc[key] = {
            id: key,
            label: entity.name,
            href: grouping === 'brand' ? `/brands/${entity.id}` : `/customers/${entity.id}`,
            projects: [] as Project[],
          }
        }
        acc[key].projects.push(project)
        return acc
      },
      {} as Record<string, { id: string; label: string; href: string; projects: Project[] }>,
    ),
  ).sort((a, b) => a.label.localeCompare(b.label, 'ja'))

  return (
    <Shell crumbs={[{ href: '/projects/my', label: 'Myプロジェクト' }]}>
      <div className="grid gap-3">
        {groups.map(group => (
          <div key={group.id} className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{groupLabel}</div>
                <Link href={group.href} className="text-lg font-semibold text-slate-900 hover:text-indigo-600">
                  {group.label}
                </Link>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{group.projects.length}件</span>
            </div>
            <div className="grid gap-2">
              {group.projects.map(project => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm transition hover:border-indigo-200 hover:bg-indigo-50"
                >
                  <div>
                    <div className="font-medium text-slate-900">{project.name}</div>
                    <div className="text-xs text-slate-500">担当: {project.owner}</div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {grouping === 'brand' ? project.customer.name : project.brand.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  )
}
