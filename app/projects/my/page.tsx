'use client'

import Link from 'next/link'
import { useMemo } from 'react'

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

type ProjectGroup = {
  id: string
  label: string
  href: string
  projects: Project[]
}

type GroupConfig = {
  grouping: keyof Pick<Project, 'customer' | 'brand'>
  groupLabel: string
  secondaryLabel: string
  getGroupHref: (entity: ProjectEntity) => string
  getSecondaryName: (project: Project) => string
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

const VIEW_CONFIG: Record<'customer' | 'brand', GroupConfig> = {
  customer: {
    grouping: 'customer',
    groupLabel: '顧客',
    secondaryLabel: 'ブランド',
    getGroupHref: entity => `/customers/${entity.id}`,
    getSecondaryName: project => project.brand.name,
  },
  brand: {
    grouping: 'brand',
    groupLabel: 'ブランド',
    secondaryLabel: '顧客',
    getGroupHref: entity => `/brands/${entity.id}`,
    getSecondaryName: project => project.customer.name,
  },
}

export default function MyProjects() {
  const view = useCurrentView()
  const displayView = view === 'brand' ? 'brand' : 'customer'
  const config = VIEW_CONFIG[displayView]

  const groups = useMemo<ProjectGroup[]>(() => {
    const grouped: Record<string, ProjectGroup> = {}
    PROJECTS.forEach(project => {
      const entity = project[config.grouping]
      if (!entity) {
        return
      }
      if (!grouped[entity.id]) {
        grouped[entity.id] = {
          id: entity.id,
          label: entity.name,
          href: config.getGroupHref(entity),
          projects: [],
        }
      }
      grouped[entity.id].projects.push(project)
    })
    return Object.values(grouped).sort((a, b) => a.label.localeCompare(b.label, 'ja'))
  }, [config])

  return (
    <Shell crumbs={[{ href: '/projects/my', label: 'Myプロジェクト' }]}>
      <div className="grid gap-3">
        {groups.map(group => (
          <div key={group.id} className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{config.groupLabel}</div>
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
                  <div className="text-xs text-slate-500 text-right">
                    <div>{config.secondaryLabel}</div>
                    <div className="font-medium text-slate-600">{config.getSecondaryName(project)}</div>
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
