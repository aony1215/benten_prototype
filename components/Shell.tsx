'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { Breadcrumbs, type Crumb } from '@/components/Breadcrumbs'
import { clsx } from 'clsx'
import React from 'react'
import {
  BarChart3,
  BookOpenCheck,
  CalendarClock,
  Compass,
  Database,
  FilePenLine,
  FolderKanban,
  Info,
  Landmark,
  Layers,
  MessageSquare,
  Sparkles,
  Target,
  User,
  Users2,
} from 'lucide-react'
import { resolveViewHome, useCurrentView, VIEWS, type ViewId } from '@/components/ViewSwitch'

const CONTROLLED_QUERY_KEYS = ['section', 'customerId', 'brandId', 'programId', 'focus'] as const

const DEFAULT_MENU_WIDTH = 320
const ICON_RAIL_WIDTH = 80

type ControlledQueryKey = (typeof CONTROLLED_QUERY_KEYS)[number]

type ModeNavDefinition = {
  path: string
  label: string
  description?: string
  icon: React.ComponentType<any>
  params?: Record<string, string>
}

type ModeNavItem = ModeNavDefinition & {
  href: string
  isActive: boolean
}

type NavigationItemSummary = {
  label: string
  description?: string
  params?: Record<string, string>
  href: string
  isActive: boolean
}

type ModeOption = {
  id: ViewId
  label: string
  icon: React.ComponentType<any>
  href: string
  isActive: boolean
}

type ContextEntry = {
  label: string
  value: string
  meta?: string
}

type CollectionItem = {
  id: string
  label: string
  meta?: string
  status?: 'delivered' | 'active' | 'alert' | 'planning'
  href?: string
}

type HierarchySection =
  | {
      type: 'navigation'
      id: string
      title: string
      description?: string
      items: ModeNavItem[]
    }
  | {
      type: 'context'
      id: string
      title: string
      sectionKey: string
      entries: ContextEntry[]
    }
  | {
      type: 'collection'
      id: string
      title: string
      emptyText?: string
      sectionKey: string
      items: CollectionItem[]
    }

type NavigationSection = Extract<HierarchySection, { type: 'navigation' }>
type DetailSection = Extract<HierarchySection, { type: 'context' | 'collection' }>

type HierarchySelection = {
  customer?: CustomerAccount
  brand?: CustomerBrand | null
  program?: CustomerProgram | null
}

type HierarchyState = {
  breadcrumbs: Crumb[]
  sections: HierarchySection[]
  activeSection: string | null
  selection: HierarchySelection
}

type CustomerProgram = {
  id: string
  name: string
  lead: string
  status: string
  currentSprint: string
  deliverables: CollectionItem[]
  communications: CollectionItem[]
  strategies: CollectionItem[]
}

type CustomerBrand = {
  id: string
  name: string
  mission: string
  lead: string
  health: string
  healthMeta: string
  keyMarkets: string
  deliverables: CollectionItem[]
  communications: CollectionItem[]
  strategies: CollectionItem[]
  programs: CustomerProgram[]
}

type CustomerAccount = {
  id: string
  name: string
  owner: string
  industry: string
  region: string
  health: string
  healthMeta: string
  deliverables: CollectionItem[]
  communications: CollectionItem[]
  strategies: CollectionItem[]
  brands: CustomerBrand[]
}

const CUSTOMER_GRAPH: CustomerAccount[] = [
  {
    id: 'cust-001',
    name: '株式会社エバーライト',
    owner: '田中 未来',
    industry: 'スマートライティング',
    region: '東京',
    health: '良好',
    healthMeta: 'NRR 118% / ヘルススコア 8.7',
    deliverables: [
      { id: 'deliv-cust-1', label: 'Q2 エグゼクティブレビュー', meta: '提出済み・2024/06/20', status: 'delivered' },
      { id: 'deliv-cust-2', label: 'オンボーディング改善ロードマップ', meta: 'レビュー待ち・2024/07/05', status: 'active' },
    ],
    communications: [
      { id: 'comm-cust-1', label: '経営層定例ミーティング', meta: '次回 2024/07/12', status: 'active' },
      { id: 'comm-cust-2', label: 'サクセスサマリーメール', meta: '送信済み 2024/06/18', status: 'delivered' },
    ],
    strategies: [
      { id: 'strat-cust-1', label: 'LTV 最大化プラン FY2024', meta: 'フェーズ2・ROI 1.4x', status: 'active' },
      { id: 'strat-cust-2', label: 'サポート自動化構想', meta: 'アイデア検証中', status: 'planning' },
    ],
    brands: [
      {
        id: 'brand-aurora',
        name: 'Everlight Aurora',
        mission: 'プレミアム向け IoT 照明ブランド',
        lead: '佐藤 輝',
        health: '注意',
        healthMeta: 'キャンペーン ROI 64%',
        keyMarkets: 'アジア・北米',
        deliverables: [
          { id: 'deliv-brand-1', label: 'Aurora ブランド診断レポート', meta: '提出済み・2024/06/05', status: 'delivered' },
          { id: 'deliv-brand-2', label: '夏季キャンペーン提案書', meta: 'ドラフト・2024/07/08', status: 'active' },
        ],
        communications: [
          { id: 'comm-brand-1', label: 'マーケチーム Slack チャンネル', meta: '未読 3 件', status: 'active' },
          { id: 'comm-brand-2', label: 'Aurora 戦略ワークショップ', meta: '開催予定 2024/07/22', status: 'planning' },
        ],
        strategies: [
          { id: 'strat-brand-1', label: '市場拡張 GTM プラン', meta: 'フェーズ1完了', status: 'active' },
          { id: 'strat-brand-2', label: '高付加価値セグメント戦略', meta: 'レビュー待ち', status: 'active' },
        ],
        programs: [
          {
            id: 'prog-onboard',
            name: 'オンボーディング改善プログラム',
            lead: '藤井 昂',
            status: '進行中',
            currentSprint: 'Sprint 3 / 6',
            deliverables: [
              { id: 'deliv-prog-1', label: 'オンボーディング UX レポート', meta: 'レビュー待ち・2024/07/03', status: 'active' },
              { id: 'deliv-prog-2', label: '新機能導入計画', meta: '準備中・2024/07/18', status: 'planning' },
            ],
            communications: [
              { id: 'comm-prog-1', label: '週次スタンドアップ', meta: '次回 2024/07/04', status: 'active' },
              { id: 'comm-prog-2', label: 'Aurora CX チャンネル', meta: '未読 1 件', status: 'active' },
            ],
            strategies: [
              { id: 'strat-prog-1', label: 'エンゲージメント向上戦略', meta: '実行率 70%', status: 'active' },
              { id: 'strat-prog-2', label: '契約更新タッチポイント整理', meta: 'ドラフト', status: 'planning' },
            ],
          },
          {
            id: 'prog-loyalty',
            name: 'ロイヤリティ向上プログラム',
            lead: '近藤 沙耶',
            status: '計画中',
            currentSprint: 'Kickoff 準備',
            deliverables: [
              { id: 'deliv-prog-3', label: 'ロイヤリティキャンバス', meta: '起案中', status: 'planning' },
            ],
            communications: [
              { id: 'comm-prog-3', label: '準備タスクフォロー', meta: '担当 3 名', status: 'active' },
            ],
            strategies: [
              { id: 'strat-prog-3', label: 'VIP 体験設計', meta: 'ヒアリング中', status: 'planning' },
            ],
          },
        ],
      },
      {
        id: 'brand-lumen',
        name: 'Lumen Street',
        mission: '都市型スマート街灯のサブブランド',
        lead: '原田 玲奈',
        health: '良好',
        healthMeta: '導入都市 26 / CSAT 4.6',
        keyMarkets: '北米・欧州',
        deliverables: [
          { id: 'deliv-brand-3', label: '都市別導入レポート', meta: '提出済み・2024/06/11', status: 'delivered' },
        ],
        communications: [
          { id: 'comm-brand-3', label: '都市連携 Slack', meta: '未読 5 件', status: 'active' },
        ],
        strategies: [
          { id: 'strat-brand-3', label: '自治体連携強化プラン', meta: '意思決定待ち', status: 'planning' },
        ],
        programs: [
          {
            id: 'prog-expansion',
            name: '北米拡張プログラム',
            lead: '吉本 海斗',
            status: '進行中',
            currentSprint: 'Sprint 2 / 8',
            deliverables: [
              { id: 'deliv-prog-4', label: '拡張市場分析レポート', meta: 'ドラフト', status: 'active' },
            ],
            communications: [
              { id: 'comm-prog-4', label: '州政府タッチポイント整理', meta: '最新 2024/06/26', status: 'active' },
            ],
            strategies: [
              { id: 'strat-prog-4', label: '地域別導入戦略', meta: '合意済み 3/5 州', status: 'active' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cust-002',
    name: 'Brighton Holdings',
    owner: 'Michael Green',
    industry: '不動産テック',
    region: '大阪 / シンガポール',
    health: '成長',
    healthMeta: 'NRR 134% / Upsell 3 件',
    deliverables: [
      { id: 'deliv-cust-3', label: '導入成果レポート', meta: '提出済み・2024/06/15', status: 'delivered' },
    ],
    communications: [
      { id: 'comm-cust-3', label: 'CS リレーションレター', meta: '送信済み 2024/06/19', status: 'delivered' },
    ],
    strategies: [
      { id: 'strat-cust-3', label: 'APAC 拡大戦略', meta: '実行率 45%', status: 'active' },
    ],
    brands: [
      {
        id: 'brand-bright',
        name: 'Bright Living',
        mission: 'IoT リビング体験',
        lead: 'Sophie Tan',
        health: '良好',
        healthMeta: 'CSAT 4.8',
        keyMarkets: '東南アジア',
        deliverables: [],
        communications: [],
        strategies: [],
        programs: [],
      },
    ],
  },
]

const MODE_NAV_FALLBACK: Record<ViewId, ModeNavDefinition[]> = {
  projects: [
    {
      path: '/projects/my',
      label: 'Myプロジェクト',
      description: '担当プロジェクトの状況を確認',
      icon: FolderKanban,
    },
    {
      path: '/projects/my',
      label: 'レポート',
      description: '最新の成果物と指標をチェック',
      params: { section: 'reports' },
      icon: BarChart3,
    },
  ],
  customer: [],
  brand: [],
  program: [],
  playbook: [
    {
      path: '/playbooks',
      label: 'プレイブック',
      description: 'チームで共有する運用ナレッジ',
      icon: BookOpenCheck,
    },
    {
      path: '/playbooks',
      label: '下書き',
      description: '作成途中のプレイブック',
      params: { section: 'drafts' },
      icon: FilePenLine,
    },
  ],
  settings: [
    {
      path: '/settings',
      label: 'アカウント設定',
      description: 'プロフィールや通知設定を管理',
      icon: User,
    },
    {
      path: '/datasources',
      label: 'データソース',
      description: '接続済みの外部データを管理',
      icon: Database,
    },
  ],
}

function createHrefWithView(
  path: string,
  sp: ReadonlyURLSearchParams | null,
  view: ViewId,
  extraParams?: Record<string, string>,
  options?: { preserve?: ControlledQueryKey[] },
): string {
  const params = new URLSearchParams(sp?.toString() || '')
  CONTROLLED_QUERY_KEYS.forEach(key => {
    if (options?.preserve?.includes(key)) {
      return
    }
    if (!extraParams || !(key in extraParams)) {
      params.delete(key)
    }
  })
  params.set('v', view)
  if (extraParams) {
    Object.entries(extraParams).forEach(([key, value]) => {
      if (value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
  }
  const query = params.toString()
  return query ? `${path}?${query}` : `${path}`
}

function buildModeOptions(sp: ReadonlyURLSearchParams | null, currentView: ViewId): ModeOption[] {
  return VIEWS.map(view => ({
    id: view.id,
    label: view.label,
    icon: view.icon,
    href: createHrefWithView(resolveViewHome(view.id), sp, view.id),
    isActive: currentView === view.id,
  }))
}

function buildModeNavItems(
  definitions: ModeNavDefinition[],
  sp: ReadonlyURLSearchParams | null,
  currentView: ViewId,
  pathname: string,
  activeOverrides: Partial<Record<ControlledQueryKey, string>> = {},
): ModeNavItem[] {
  return definitions.map(def => {
    const href = createHrefWithView(def.path, sp, currentView, def.params)
    const basePath = def.path
    const matchesPath = pathname === basePath || pathname.startsWith(`${basePath}/`)
    const matchesParams = def.params
      ? Object.entries(def.params).every(([key, value]) => {
          const candidate = sp?.get(key) ?? activeOverrides[key as ControlledQueryKey]
          return candidate === value
        })
      : true
    const isActive = matchesPath && matchesParams
    return { ...def, href, isActive }
  })
}

function statusStyles(status?: CollectionItem['status']) {
  switch (status) {
    case 'delivered':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
    case 'alert':
      return 'bg-rose-50 text-rose-700 border border-rose-100'
    case 'planning':
      return 'bg-sky-50 text-sky-700 border border-sky-100'
    case 'active':
    default:
      return 'bg-indigo-50 text-indigo-700 border border-indigo-100'
  }
}


type BuilderArgs = {
  sp: ReadonlyURLSearchParams | null
  currentView: ViewId
  pathname: string
}

type HierarchyBuilder = (args: BuilderArgs) => HierarchyState

function buildFallbackHierarchy(definitions: ModeNavDefinition[]): HierarchyBuilder {
  return ({ sp, currentView, pathname }) => {
    const items = buildModeNavItems(definitions, sp, currentView, pathname)
    return {
      breadcrumbs: definitions.length
        ? [
            {
              href: createHrefWithView(definitions[0].path, sp, currentView),
              label: VIEWS.find(view => view.id === currentView)?.label ?? 'メニュー',
            },
          ]
        : [],
      sections: items.length
        ? [
            {
              type: 'navigation',
              id: `${currentView}-nav`,
              title: 'メニュー',
              items,
            },
          ]
        : [],
      activeSection: null,
      selection: {},
    }
  }
}

function pickCustomer(sp: ReadonlyURLSearchParams | null, pathname: string) {
  let requestedId = sp?.get('customerId')
  if (!requestedId && pathname.startsWith('/customers/')) {
    const [, , candidate] = pathname.split('/')
    if (candidate) {
      requestedId = candidate
    }
  }
  const customer = CUSTOMER_GRAPH.find(account => account.id === requestedId) ?? CUSTOMER_GRAPH[0]
  return customer
}

function findBrand(customer: CustomerAccount, sp: ReadonlyURLSearchParams | null, pathname: string) {
  let requestedId = sp?.get('brandId')
  if (!requestedId && pathname.startsWith('/brands/')) {
    const [, , candidate] = pathname.split('/')
    if (candidate) {
      requestedId = candidate
    }
  }
  if (!requestedId) return null
  return customer.brands.find(brand => brand.id === requestedId) ?? null
}

function findProgram(brand: CustomerBrand | null, sp: ReadonlyURLSearchParams | null, pathname: string) {
  if (!brand) return null
  let requestedId = sp?.get('programId')
  if (!requestedId && pathname.startsWith('/programs/')) {
    const [, , candidate] = pathname.split('/')
    if (candidate) {
      requestedId = candidate
    }
  }
  if (!requestedId) return null
  return brand.programs.find(program => program.id === requestedId) ?? null
}

function createContextSection(
  customer: CustomerAccount,
  brand: CustomerBrand | null,
  program: CustomerProgram | null,
): ContextEntry[] {
  const entries: ContextEntry[] = [
    { label: 'アカウントオーナー', value: customer.owner },
    { label: '業種', value: customer.industry },
    { label: '主要拠点', value: customer.region },
    { label: 'アカウントヘルス', value: customer.health, meta: customer.healthMeta },
  ]
  if (brand) {
    entries.push(
      { label: 'ブランドリード', value: brand.lead },
      { label: 'ブランドヘルス', value: brand.health, meta: brand.healthMeta },
      { label: '注力市場', value: brand.keyMarkets },
    )
  }
  if (program) {
    entries.push(
      { label: 'プログラムオーナー', value: program.lead },
      { label: '現在の進捗', value: program.status, meta: program.currentSprint },
    )
  }
  return entries
}

function attachCollection(
  customer: CustomerAccount,
  brand: CustomerBrand | null,
  program: CustomerProgram | null,
  key: 'deliverables' | 'communications' | 'strategies',
): CollectionItem[] {
  if (program && program[key].length) {
    return program[key]
  }
  if (brand && brand[key].length) {
    return brand[key]
  }
  return customer[key]
}
function buildCustomerHierarchy({ sp, currentView, pathname }: BuilderArgs): HierarchyState {
  const customer = pickCustomer(sp, pathname)
  const brand = findBrand(customer, sp, pathname)
  const program = findProgram(brand, sp, pathname)
  const activeSection = sp?.get('section') ?? 'context'

  const navDefinitions: ModeNavDefinition[] = []

  navDefinitions.push(
    {
      path: '/customers',
      label: 'アカウント概要',
      description: '収益・契約・サクセス指標を俯瞰',
      icon: Users2,
      params: { section: 'overview', customerId: customer.id },
    },
    {
      path: '/customers',
      label: '関係者マップ',
      description: '主要ステークホルダーの関係性を整理',
      icon: Sparkles,
      params: { section: 'stakeholders', customerId: customer.id },
    },
  )

  if (brand) {
    navDefinitions.push({
      path: '/customers',
      label: `${brand.name} ブランド`,
      description: 'ブランドの体験と成果を整理',
      icon: Landmark,
      params: { section: 'brand-overview', customerId: customer.id, brandId: brand.id },
    })
  }

  if (program) {
    navDefinitions.push({
      path: '/customers',
      label: `${program.name}`,
      description: 'スプリント成果とロードマップ',
      icon: Layers,
      params: {
        section: 'program-overview',
        customerId: customer.id,
        ...(brand ? { brandId: brand.id } : {}),
        programId: program.id,
      },
    })
  }

  const focusParams: Partial<Record<ControlledQueryKey, string>> = {
    customerId: customer.id,
  }
  if (brand) {
    focusParams.brandId = brand.id
  }
  if (program) {
    focusParams.programId = program.id
  }

  navDefinitions.push(
    {
      path: '/customers',
      label: 'コンテキスト',
      description: `${program?.name ?? brand?.name ?? customer.name} の背景情報`,
      icon: Info,
      params: { ...focusParams, section: 'context' } as Record<string, string>,
    },
    {
      path: '/customers',
      label: '成果物',
      description: '納品物と重要ドキュメント',
      icon: FilePenLine,
      params: { ...focusParams, section: 'deliverables' } as Record<string, string>,
    },
    {
      path: '/customers',
      label: 'コミュニケーション',
      description: '会議・チャネル・タッチポイント',
      icon: MessageSquare,
      params: { ...focusParams, section: 'communications' } as Record<string, string>,
    },
    {
      path: '/customers',
      label: '戦略',
      description: '長期施策とフォーカス領域',
      icon: Target,
      params: { ...focusParams, section: 'strategies' } as Record<string, string>,
    },
  )

  const items = buildModeNavItems(navDefinitions, sp, currentView, pathname, {
    ...focusParams,
    section: activeSection,
  })

  const breadcrumbs: Crumb[] = [
    { href: '/', label: 'ホーム' },
    { href: createHrefWithView('/customers', sp, 'customer'), label: '顧客' },
    {
      href: createHrefWithView(
        '/customers',
        sp,
        'customer',
        { customerId: customer.id },
        { preserve: ['customerId'] },
      ),
      label: customer.name,
    },
  ]

  if (brand) {
    breadcrumbs.push({ href: createHrefWithView('/brands', sp, 'brand'), label: 'ブランド' })
    breadcrumbs.push({
      href: createHrefWithView(
        '/customers',
        sp,
        'customer',
        { customerId: customer.id, brandId: brand.id },
        { preserve: ['customerId', 'brandId'] },
      ),
      label: brand.name,
    })
  }

  if (brand && program) {
    breadcrumbs.push({ href: createHrefWithView('/programs', sp, 'program'), label: 'プログラム' })
    breadcrumbs.push({
      href: createHrefWithView(
        '/customers',
        sp,
        'customer',
        {
          customerId: customer.id,
          brandId: brand.id,
          programId: program.id,
        },
        { preserve: ['customerId', 'brandId', 'programId'] },
      ),
      label: program.name,
    })
  }

  const sections: HierarchySection[] = []
  if (items.length) {
    sections.push({
      type: 'navigation',
      id: 'customer-navigation',
      title: brand ? `${brand.name} のナビゲーション` : `${customer.name} のナビゲーション`,
      description: program ? `${program.name} にフォーカスしています` : undefined,
      items,
    })
  }

  const contextEntries = createContextSection(customer, brand, program)
  const contextTitle = program
    ? `${program.name} のコンテキスト`
    : brand
      ? `${brand.name} のコンテキスト`
      : `${customer.name} のコンテキスト`
  sections.push({
    type: 'context',
    id: 'customer-context',
    title: contextTitle,
    sectionKey: 'context',
    entries: contextEntries,
  })

  const deliverables = attachCollection(customer, brand, program, 'deliverables')
  const communications = attachCollection(customer, brand, program, 'communications')
  const strategies = attachCollection(customer, brand, program, 'strategies')

  sections.push({
    type: 'collection',
    id: 'customer-deliverables',
    title: '成果物',
    emptyText: '成果物はまだ登録されていません',
    sectionKey: 'deliverables',
    items: deliverables,
  })
  sections.push({
    type: 'collection',
    id: 'customer-communications',
    title: 'コミュニケーション',
    emptyText: '関連するコミュニケーションはまだありません',
    sectionKey: 'communications',
    items: communications,
  })
  sections.push({
    type: 'collection',
    id: 'customer-strategies',
    title: '戦略',
    emptyText: '戦略ドキュメントはまだ登録されていません',
    sectionKey: 'strategies',
    items: strategies,
  })

  return { breadcrumbs, sections, activeSection, selection: { customer, brand, program } }
}
function buildBrandHierarchy({ sp, currentView, pathname }: BuilderArgs): HierarchyState {
  const allBrands: Array<{ customer: CustomerAccount; brand: CustomerBrand }> = []
  CUSTOMER_GRAPH.forEach(customer => {
    customer.brands.forEach(brand => {
      allBrands.push({ customer, brand })
    })
  })

  let requestedBrandId = sp?.get('brandId')
  if (!requestedBrandId && pathname.startsWith('/brands/')) {
    const [, , candidate] = pathname.split('/')
    if (candidate) {
      requestedBrandId = candidate
    }
  }
  const fallback = allBrands[0]
  const active = allBrands.find(entry => entry.brand.id === requestedBrandId) ?? fallback
  const { customer, brand } = active
  const activeSection = sp?.get('section') ?? 'context'

  const navDefinitions: ModeNavDefinition[] = [
    {
      path: '/brands',
      label: 'ブランド概要',
      description: '市場ポジションと KPI を確認',
      icon: Landmark,
      params: { brandId: brand.id, section: 'overview' },
    },
    {
      path: '/brands',
      label: '体験マップ',
      description: 'チャネル横断の体験ジャーニー',
      icon: Compass,
      params: { brandId: brand.id, section: 'journey' },
    },
  ]

  if (brand.programs.length) {
    navDefinitions.push({
      path: '/brands',
      label: '関連プログラム',
      description: '進行中のプログラムと成果',
      icon: Layers,
      params: { brandId: brand.id, section: 'programs' },
    })
  }

  const focusParams: Partial<Record<ControlledQueryKey, string>> = { brandId: brand.id }

  navDefinitions.push(
    {
      path: '/brands',
      label: 'コンテキスト',
      description: `${brand.name} と ${customer.name} の背景`,
      icon: Info,
      params: { ...focusParams, section: 'context' } as Record<string, string>,
    },
    {
      path: '/brands',
      label: '成果物',
      description: 'ブランドに紐づくアウトプット',
      icon: FilePenLine,
      params: { ...focusParams, section: 'deliverables' } as Record<string, string>,
    },
    {
      path: '/brands',
      label: 'コミュニケーション',
      description: '最新の会話とタッチポイント',
      icon: MessageSquare,
      params: { ...focusParams, section: 'communications' } as Record<string, string>,
    },
    {
      path: '/brands',
      label: '戦略',
      description: '重点施策とプラン',
      icon: Target,
      params: { ...focusParams, section: 'strategies' } as Record<string, string>,
    },
  )

  const items = buildModeNavItems(navDefinitions, sp, currentView, pathname, {
    ...focusParams,
    section: activeSection,
  })

  const breadcrumbs: Crumb[] = [
    { href: '/', label: 'ホーム' },
    { href: createHrefWithView('/customers', sp, 'customer'), label: '顧客' },
    {
      href: createHrefWithView(
        '/customers',
        sp,
        'customer',
        { customerId: customer.id },
        { preserve: ['customerId'] },
      ),
      label: customer.name,
    },
    { href: createHrefWithView('/brands', sp, 'brand'), label: 'ブランド' },
    {
      href: createHrefWithView(
        '/brands',
        sp,
        'brand',
        { brandId: brand.id },
        { preserve: ['brandId'] },
      ),
      label: brand.name,
    },
  ]

  const sections: HierarchySection[] = []
  if (items.length) {
    sections.push({
      type: 'navigation',
      id: 'brand-navigation',
      title: `${brand.name} のメニュー`,
      description: `${customer.name} アカウントより`,
      items,
    })
  }

  const contextEntries: ContextEntry[] = [
    { label: 'ブランドリード', value: brand.lead },
    { label: '親アカウント', value: customer.name },
    { label: 'ブランドヘルス', value: brand.health, meta: brand.healthMeta },
    { label: '注力市場', value: brand.keyMarkets },
  ]

  sections.push({
    type: 'context',
    id: 'brand-context',
    title: `${brand.name} のコンテキスト`,
    sectionKey: 'context',
    entries: contextEntries,
  })

  sections.push({
    type: 'collection',
    id: 'brand-deliverables',
    title: '成果物',
    emptyText: 'ブランドに紐づく成果物はまだありません',
    sectionKey: 'deliverables',
    items: brand.deliverables,
  })
  sections.push({
    type: 'collection',
    id: 'brand-communications',
    title: 'コミュニケーション',
    emptyText: '共有チャネルはまだありません',
    sectionKey: 'communications',
    items: brand.communications,
  })
  sections.push({
    type: 'collection',
    id: 'brand-strategies',
    title: '戦略',
    emptyText: '戦略はまだ登録されていません',
    sectionKey: 'strategies',
    items: brand.strategies,
  })

  return { breadcrumbs, sections, activeSection, selection: { customer, brand } }
}
function buildProgramHierarchy({ sp, currentView, pathname }: BuilderArgs): HierarchyState {
  const allPrograms: Array<{ customer: CustomerAccount; brand: CustomerBrand; program: CustomerProgram }> = []
  CUSTOMER_GRAPH.forEach(customer => {
    customer.brands.forEach(brand => {
      brand.programs.forEach(program => {
        allPrograms.push({ customer, brand, program })
      })
    })
  })

  let requestedProgramId = sp?.get('programId')
  if (!requestedProgramId && pathname.startsWith('/programs/')) {
    const [, , candidate] = pathname.split('/')
    if (candidate) {
      requestedProgramId = candidate
    }
  }
  const fallback = allPrograms[0]
  const active = allPrograms.find(entry => entry.program.id === requestedProgramId) ?? fallback
  const { customer, brand, program } = active
  const activeSection = sp?.get('section') ?? 'context'

  const navDefinitions: ModeNavDefinition[] = [
    {
      path: '/programs',
      label: 'プログラム概要',
      description: '目的・成果とガバナンス',
      icon: Layers,
      params: { programId: program.id, section: 'overview' },
    },
    {
      path: '/programs',
      label: 'スプリント計画',
      description: '進行中のタスクとマイルストーン',
      icon: CalendarClock,
      params: { programId: program.id, section: 'sprints' },
    },
    {
      path: '/programs',
      label: 'リスクと依存関係',
      description: 'リスクログと依存解消の進捗',
      icon: Target,
      params: { programId: program.id, section: 'risks' },
    },
  ]

  const focusParams: Partial<Record<ControlledQueryKey, string>> = {
    customerId: customer.id,
    brandId: brand.id,
    programId: program.id,
  }

  navDefinitions.push(
    {
      path: '/programs',
      label: 'コンテキスト',
      description: `${program.name} の目的と背景`,
      icon: Info,
      params: { ...focusParams, section: 'context' } as Record<string, string>,
    },
    {
      path: '/programs',
      label: '成果物',
      description: '進行中・提出済みのアウトプット',
      icon: FilePenLine,
      params: { ...focusParams, section: 'deliverables' } as Record<string, string>,
    },
    {
      path: '/programs',
      label: 'コミュニケーション',
      description: '会議や連絡チャネル',
      icon: MessageSquare,
      params: { ...focusParams, section: 'communications' } as Record<string, string>,
    },
    {
      path: '/programs',
      label: '戦略',
      description: '狙いと戦術の整理',
      icon: Target,
      params: { ...focusParams, section: 'strategies' } as Record<string, string>,
    },
  )

  const items = buildModeNavItems(navDefinitions, sp, currentView, pathname, {
    ...focusParams,
    section: activeSection,
  })

  const breadcrumbs: Crumb[] = [
    { href: '/', label: 'ホーム' },
    { href: createHrefWithView('/customers', sp, 'customer'), label: '顧客' },
    {
      href: createHrefWithView(
        '/customers',
        sp,
        'customer',
        { customerId: customer.id },
        { preserve: ['customerId'] },
      ),
      label: customer.name,
    },
    { href: createHrefWithView('/brands', sp, 'brand'), label: 'ブランド' },
    {
      href: createHrefWithView(
        '/brands',
        sp,
        'brand',
        { brandId: brand.id },
        { preserve: ['brandId'] },
      ),
      label: brand.name,
    },
    { href: createHrefWithView('/programs', sp, 'program'), label: 'プログラム' },
    {
      href: createHrefWithView(
        '/programs',
        sp,
        'program',
        { programId: program.id },
        { preserve: ['programId'] },
      ),
      label: program.name,
    },
  ]

  const sections: HierarchySection[] = []
  if (items.length) {
    sections.push({
      type: 'navigation',
      id: 'program-navigation',
      title: `${program.name} のメニュー`,
      description: `${brand.name} / ${customer.name}`,
      items,
    })
  }

  const contextEntries: ContextEntry[] = [
    { label: 'プログラムオーナー', value: program.lead },
    { label: '親ブランド', value: brand.name },
    { label: '親アカウント', value: customer.name },
    { label: '現在の進捗', value: program.status, meta: program.currentSprint },
  ]

  sections.push({
    type: 'context',
    id: 'program-context',
    title: `${program.name} のコンテキスト`,
    sectionKey: 'context',
    entries: contextEntries,
  })

  sections.push({
    type: 'collection',
    id: 'program-deliverables',
    title: '成果物',
    emptyText: '成果物はまだ登録されていません',
    sectionKey: 'deliverables',
    items: program.deliverables,
  })
  sections.push({
    type: 'collection',
    id: 'program-communications',
    title: 'コミュニケーション',
    emptyText: '関連するコミュニケーションはまだありません',
    sectionKey: 'communications',
    items: program.communications,
  })
  sections.push({
    type: 'collection',
    id: 'program-strategies',
    title: '戦略',
    emptyText: '戦略ドキュメントはまだ登録されていません',
    sectionKey: 'strategies',
    items: program.strategies,
  })

  return { breadcrumbs, sections, activeSection, selection: { customer, brand, program } }
}
const HIERARCHY_BUILDERS: Record<ViewId, HierarchyBuilder> = {
  projects: buildFallbackHierarchy(MODE_NAV_FALLBACK.projects),
  customer: buildCustomerHierarchy,
  brand: buildBrandHierarchy,
  program: buildProgramHierarchy,
  playbook: buildFallbackHierarchy(MODE_NAV_FALLBACK.playbook),
  settings: buildFallbackHierarchy(MODE_NAV_FALLBACK.settings),
}

function useNav(crumbsFromProps?: Crumb[]) {
  const pathname = usePathname() || '/'
  const sp = useSearchParams()
  const currentView = useCurrentView()

  const modeOptions = buildModeOptions(sp, currentView)
  const builder = HIERARCHY_BUILDERS[currentView] ?? buildFallbackHierarchy([])
  const hierarchy = builder({ sp, currentView, pathname })
  const breadcrumbs = hierarchy.breadcrumbs.length ? hierarchy.breadcrumbs : crumbsFromProps ?? []
  const navigationSections = hierarchy.sections.filter(
    (section): section is NavigationSection => section.type === 'navigation',
  )
  const detailSections = hierarchy.sections.filter(
    (section): section is DetailSection => section.type !== 'navigation',
  )
  const navigationItems = navigationSections
    .flatMap(section => section.items)
    .map(item => ({
      label: item.label,
      description: item.description,
      params: item.params,
      href: item.href,
      isActive: item.isActive,
    }))
  const hasMenu = navigationSections.length > 0

  return {
    modeOptions,
    navigationSections,
    navigationItems,
    detailSections,
    breadcrumbs,
    hasMenu,
    activeSection: hierarchy.activeSection,
    selection: hierarchy.selection,
  }
}

type HierarchyContextValue = {
  breadcrumbs: Crumb[]
  activeSection: string | null
  detailSections: DetailSection[]
  navigationItems: NavigationItemSummary[]
  selection: HierarchySelection
}

const HierarchyStateContext = React.createContext<HierarchyContextValue | null>(null)

export function useHierarchyState(): HierarchyContextValue {
  const context = React.useContext(HierarchyStateContext)
  if (!context) {
    throw new Error('useHierarchyState must be used within Shell')
  }
  return context
}

function statusLabel(status?: CollectionItem['status']) {
  switch (status) {
    case 'delivered':
      return '提出済み'
    case 'alert':
      return 'アラート'
    case 'planning':
      return '計画中'
    case 'active':
    default:
      return '進行中'
  }
}

export function Shell({ children, crumbs }: { children: React.ReactNode; crumbs?: Crumb[] }) {
  const {
    modeOptions,
    navigationSections,
    detailSections,
    navigationItems,
    breadcrumbs,
    hasMenu,
    activeSection,
    selection,
  } = useNav(crumbs)
  const totalRailWidth = ICON_RAIL_WIDTH + (hasMenu ? DEFAULT_MENU_WIDTH : 0)

  return (
    <HierarchyStateContext.Provider
      value={{ breadcrumbs, activeSection, detailSections, navigationItems, selection }}
    >
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <aside
          className="fixed inset-y-0 left-0 z-40 flex border-r border-slate-200 bg-white shadow-sm"
          style={{ width: totalRailWidth }}
        >
          <div className="flex w-20 flex-col border-r border-slate-100 bg-white">
            <div className="flex h-14 items-center justify-center border-b border-slate-100">
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-indigo-600 font-semibold text-white">B</div>
            </div>
            <nav className="flex-1 space-y-3 py-4">
              {modeOptions.map(option => {
                const Icon = option.icon
                return (
                  <Link
                    key={option.id}
                    href={option.href}
                    aria-current={option.isActive ? 'page' : undefined}
                    className={clsx(
                      'mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-slate-500 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200',
                      option.isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{option.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
          <div
            className={clsx(
              'flex h-full flex-1 flex-col transition-opacity duration-200',
              hasMenu ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
            style={{ width: hasMenu ? DEFAULT_MENU_WIDTH : 0 }}
          >
            <div className="flex h-full flex-col overflow-hidden border-l border-slate-100 bg-white">
              <div className="border-b border-slate-100 px-5 py-4">
                <Breadcrumbs crumbs={breadcrumbs} />
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
                {navigationSections.map(section => (
                  <section key={section.id} className="space-y-3">
                    <div className="space-y-1">
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{section.title}</h2>
                      {section.description ? (
                        <p className="text-sm text-slate-600">{section.description}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      {section.items.map(item => {
                        const Icon = item.icon
                        const keySuffix = item.params
                          ? Object.entries(item.params)
                              .map(([k, v]) => `${k}:${v}`)
                              .join('|')
                          : 'root'
                        return (
                          <Link
                            key={`${item.path}-${keySuffix}`}
                            href={item.href}
                            aria-current={item.isActive ? 'page' : undefined}
                            className={clsx(
                              'group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200',
                              item.isActive
                                ? 'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm'
                                : 'hover:border-indigo-200 hover:bg-indigo-50/70 hover:text-indigo-700',
                            )}
                          >
                            <span
                              className={clsx(
                                'mt-0.5 grid h-9 w-9 place-items-center rounded-xl border border-transparent bg-slate-100 text-slate-600 transition-colors duration-150',
                                item.isActive
                                  ? 'border-indigo-200 bg-indigo-600 text-white shadow-sm'
                                  : 'group-hover:bg-indigo-100 group-hover:text-indigo-700',
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="flex-1">
                              <span className="block text-sm font-semibold leading-tight">{item.label}</span>
                              {item.description ? (
                                <span className="mt-1 block text-xs text-slate-500">{item.description}</span>
                              ) : null}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </aside>
        <div className="min-h-screen" style={{ marginLeft: totalRailWidth }}>
          <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
      </div>
    </HierarchyStateContext.Provider>
  )
}

export function HierarchyDetail({
  emptyState,
}: {
  emptyState?: React.ReactNode
}): JSX.Element {
  const { activeSection, detailSections, navigationItems, selection, breadcrumbs } = useHierarchyState()

  const focusName = selection.program?.name ?? selection.brand?.name ?? selection.customer?.name ?? '選択中の項目'
  const hierarchyTrail = [selection.customer?.name, selection.brand?.name, selection.program?.name]
    .filter(Boolean)
    .join(' › ')
  const activeDetail = detailSections.find(section => section.sectionKey === activeSection) ?? null
  const activeNav = navigationItems.find(item => item.params?.section === activeSection)
  const sectionTitle = activeDetail?.title ?? activeNav?.label ?? 'セクション'
  const sectionDescription = activeNav?.description

  const renderContext = (section: Extract<DetailSection, { type: 'context' }>) => {
    if (!section.entries.length) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
          コンテキスト情報はまだ登録されていません。
        </div>
      )
    }
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {section.entries.map(entry => (
          <div key={`${entry.label}-${entry.value}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{entry.label}</div>
            <div className="mt-1 text-base font-semibold text-slate-900">{entry.value}</div>
            {entry.meta ? <div className="text-xs text-slate-500">{entry.meta}</div> : null}
          </div>
        ))}
      </div>
    )
  }

  const renderCollection = (section: Extract<DetailSection, { type: 'collection' }>) => {
    if (!section.items.length) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
          {section.emptyText ?? 'まだデータがありません'}
        </div>
      )
    }

    return (
      <ul className="grid gap-3">
        {section.items.map(item => (
          <li key={item.id}>
            <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  {item.meta ? <p className="text-xs text-slate-500">{item.meta}</p> : null}
                </div>
                {item.status ? (
                  <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', statusStyles(item.status))}>
                    {statusLabel(item.status)}
                  </span>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  let body: React.ReactNode = null
  if (activeDetail) {
    if (activeDetail.type === 'context') {
      body = renderContext(activeDetail)
    } else if (activeDetail.type === 'collection') {
      body = renderCollection(activeDetail)
    }
  } else {
    body =
      emptyState ?? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
          メニューからセクションを選択してください。
        </div>
      )
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-indigo-500">現在のフォーカス</div>
        <h1 className="text-2xl font-semibold text-slate-900">{focusName}</h1>
        <div className="text-sm text-slate-500">
          {hierarchyTrail || breadcrumbs.map(crumb => crumb.label).join(' › ')}
        </div>
      </header>
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{sectionTitle}</h2>
          {sectionDescription ? <p className="text-sm text-slate-500">{sectionDescription}</p> : null}
        </div>
        {body}
      </div>
    </section>
  )
}
