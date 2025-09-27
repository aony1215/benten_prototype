'use client'
import { HierarchyDetail, Shell, useHierarchyState } from '@/components/Shell'
import { CTA } from '@/components/ui/CTA'
import type { ReactNode } from 'react'

export default function ProgramDetail({ params }: { params: { id: string } }) {
  return (
    <Shell crumbs={[{ href: '/programs', label: 'プログラム一覧' }, { href: `/programs/${params.id}`, label: params.id }]}>
      <ProgramDetailContent programId={params.id} />
    </Shell>
  )
}

function SectionPlaceholder({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
      <p>「{title}」セクションの詳細は右側のパネルで確認できます。</p>
      {description ? <p className="mt-2 text-xs text-slate-500">{description}</p> : null}
    </div>
  )
}

function ProgramDetailContent({ programId }: { programId: string }) {
  const { activeSection, navigationItems } = useHierarchyState()
  const sectionKey = activeSection ?? 'overview'
  const activeNav = navigationItems.find(item => item.params?.section === sectionKey)
  const sectionLabel = activeNav?.label ?? 'セクション'
  const sectionDescription = activeNav?.description

  let mainContent: ReactNode
  if (sectionKey === 'overview') {
    mainContent = (
      <div className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">横断成果比較</div>
            <div className="mt-2 text-sm text-slate-600">ブランド・顧客をまたいだKPI比較のダミー</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">Playbook品質</div>
            <div className="mt-2 text-sm text-slate-600">版比較・回帰失敗・承認状況</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">進行中プロジェクト</div>
            <div className="mt-2 text-sm text-slate-600">代表的な進行列（ダミー）</div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="font-semibold">アクション</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <CTA>新規Playbookの検証</CTA>
            <CTA>回帰テスト実行</CTA>
            <CTA variant="outline">横断レポート生成</CTA>
          </div>
        </div>
      </div>
    )
  } else {
    mainContent = (
      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">{sectionLabel}</h2>
          {sectionDescription ? <p className="text-sm text-slate-500">{sectionDescription}</p> : null}
        </div>
        <SectionPlaceholder title={sectionLabel} description={sectionDescription} />
      </section>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-8">{mainContent}</div>
      <HierarchyDetail emptyState={<PlaceholderEmptyState programId={programId} />} />
    </div>
  )
}

function PlaceholderEmptyState({ programId }: { programId: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
      <p>{programId} の詳細データはサンプルとして表示されています。</p>
      <p className="mt-2">左側のセクションを切り替えてコンテキストを参照してください。</p>
    </div>
  )
}
