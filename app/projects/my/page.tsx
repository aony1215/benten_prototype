'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

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

type ReportMetric = {
  id: string
  label: string
  value: string
  change: string
  description: string
}

type ReportHighlight = {
  id: string
  title: string
  summary: string
  meta: string
}

const REPORT_METRICS: ReportMetric[] = [
  {
    id: 'metric_nrr',
    label: 'NRR',
    value: '118%',
    change: '+6pt QoQ',
    description: '拡張プロジェクトが寄与し、目標の 112% を上回っています。',
  },
  {
    id: 'metric_roi',
    label: '主要キャンペーン ROI',
    value: '164%',
    change: '+12% vs. Target',
    description: 'ShoeStore 夏季キャンペーンの改善施策が効果を発揮しています。',
  },
  {
    id: 'metric_cs',
    label: 'CSAT',
    value: '4.6 / 5',
    change: '+0.3 QoQ',
    description: '経営層レビュー後のフォローアップで満足度が改善しました。',
  },
]

const REPORT_DELIVERABLES: ReportHighlight[] = [
  {
    id: 'deliverable_exec_review',
    title: 'Q2 エグゼクティブレビュー',
    summary: 'NRR トレンドと改善ロードマップをまとめ、経営層へ提出済み。',
    meta: '提出済み・2024/06/20',
  },
  {
    id: 'deliverable_automation',
    title: '週次レポート自動化プラン',
    summary: 'レポート作成工数を 40% 削減するための運用設計をレビュー中。',
    meta: 'レビュー待ち・2024/07/05',
  },
  {
    id: 'deliverable_gtm',
    title: 'ShoeStore GTM 改善提案',
    summary: '都市別の獲得効率を分析し、重点投資セグメントを提案。',
    meta: 'ドラフト・2024/07/08',
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
  const sp = useSearchParams()
  const section = sp?.get('section') === 'reports' ? 'reports' : 'projects'

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

  const sectionCopy =
    section === 'reports'
      ? {
          title: 'レポートハイライト',
          description: '最新の成果物と主要指標をまとめて確認できます。',
        }
      : {
          title: `${config.groupLabel}ごとのプロジェクト一覧`,
          description: '担当案件を顧客・ブランド単位で横断的に把握しましょう。',
        }

  return (
    <Shell crumbs={[{ href: '/projects/my', label: 'Myプロジェクト' }]}> 
      <div className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-900">{sectionCopy.title}</h1>
          <p className="text-sm text-slate-500">{sectionCopy.description}</p>
        </header>
        {section === 'reports' ? (
          <div className="space-y-4">
            <div className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">主要指標</h2>
                <span className="text-xs text-slate-500">直近 30 日</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {REPORT_METRICS.map(metric => (
                  <div key={metric.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{metric.label}</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">{metric.value}</div>
                    <div className="mt-1 text-xs font-medium text-emerald-600">{metric.change}</div>
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">{metric.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-4 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">主な成果物</h2>
              <div className="grid gap-2">
                {REPORT_DELIVERABLES.map(item => (
                  <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="font-medium text-slate-900">{item.title}</div>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.summary}</p>
                    <div className="mt-2 text-xs font-medium text-slate-400">{item.meta}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {groups.map(group => (
              <div key={group.id} className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{config.groupLabel}</div>
                    <Link
                      href={group.href}
                      className="text-lg font-semibold text-slate-900 transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
                    >
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
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
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
        )}
      </div>
    </Shell>
  )
}
