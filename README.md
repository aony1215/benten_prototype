# Benten UI — Modern View Switch (Full)

**対応内容**
- 右上のビュー切替を **セグメント型トグル** に刷新（顧客／ブランド／プログラム）
- 左メニューの**プラスボタン撤去**（一覧リンクのみ）
- **パンくずナビをモダン化**（Homeアイコン＋トランケート＋セパレータ）
- **プレイブックビューなし**（ただし左メニューから /playbooks 一覧は参照可能）
- 顧客の新規登録は **スライド式ウィザード**を継承

## 起動
```bash
pnpm i   # または npm i / bun i
pnpm dev # http://localhost:3000
```

## 主なパス
- `/` ホーム（ガイダンス）
- `/projects/my` Myプロジェクト（全ビュー共通）
- `/customers` → `/customers/:id` → `/customers/new`（ウィザード）
- `/brands` → `/brands/:id`
- `/programs` → `/programs/:id`
- `/playbooks`（一覧）
- `/settings`（アカウント設定）
- `/report` Immersive Report Builder（DuckDB風データ分析体験）

## Immersive Report Builder（β）

- 左から順に「データ取り込み → フィールド選択 → 可視化 → Tips → Export」を一画面で完結。
- CSV/Parquet(スタブ) ドロップ or サンプルデータ読込で即時集計。
- フィールドはドラッグ＆ドロップでディメンション／メジャーへ配置、SQL文字列も自動生成。
- Diffトグルで直前スナップショットと並列比較。
- Tips(虎の巻) は KPI × Purpose × モデル構成で推奨アクションを提示し、ワンクリック適用。
- Export API（HTML/PDF/PPTX）は Next.js Route Handler 上で生成（PDF/PPTX は軽量スタブ実装）。
- IndexedDB が使えない環境でも localStorage にスナップショットを保持し、オフライン再開が可能。

> どのページでも `?v=customer|brand|program` が付与され、左メニューが同期します。
