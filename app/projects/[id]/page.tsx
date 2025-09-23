'use client'
import { Shell } from '@/components/Shell'
export default function ProjectDetail({ params }: { params: { id: string } }) {
  return (
    <Shell crumbs={[{ href: '/projects/my', label: 'Myプロジェクト' }, { href: `/projects/${params.id}`, label: params.id }]}>
      <div className="card p-4">プロジェクト {params.id} の詳細（ダミー）</div>
    </Shell>
  )
}
