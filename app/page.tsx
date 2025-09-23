'use client'
import { Shell } from '@/components/Shell'

export default function Home() {
  return (
    <Shell>
      <div className="grid gap-4">
        <div className="card p-4">
          <div className="font-semibold">ようこそ</div>
          <div className="text-sm text-slate-600 mt-1">
            右上の <b>ビュー切り替え</b> で「顧客 / ブランド / プログラム」を選択。<br/>
            左には常に <b>Myプロジェクト</b> が表示され、どの切り口でも案件を追えます。
          </div>
        </div>
      </div>
    </Shell>
  )
}
