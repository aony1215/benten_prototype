'use client'
import { Shell } from '@/components/Shell'
import { CTA } from '@/components/ui/CTA'

export default function ProgramDetail({ params }: { params: { id: string } }) {
  return (
    <Shell crumbs={[{ href: '/programs', label: 'プログラム一覧' }, { href: `/programs/${params.id}`, label: params.id }]}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="kpi">
          <div className="text-sm text-slate-500">横断成果比較</div>
          <div className="mt-2 text-sm text-slate-600">ブランド・顧客をまたいだKPI比較のダミー</div>
        </div>
        <div className="kpi">
          <div className="text-sm text-slate-500">Playbook品質</div>
          <div className="mt-2 text-sm text-slate-600">版比較・回帰失敗・承認状況</div>
        </div>
        <div className="kpi">
          <div className="text-sm text-slate-500">進行中プロジェクト</div>
          <div className="mt-2 text-sm text-slate-600">代表的な進行列（ダミー）</div>
        </div>
      </div>
      <div className="mt-4 card p-4">
        <div className="font-semibold">アクション</div>
        <div className="mt-2 flex flex-wrap gap-2">
          <CTA>新規Playbookの検証</CTA>
          <CTA>回帰テスト実行</CTA>
          <CTA variant="outline">横断レポート生成</CTA>
        </div>
      </div>
    </Shell>
  )
}
