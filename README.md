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

> どのページでも `?v=customer|brand|program` が付与され、左メニューが同期します。
