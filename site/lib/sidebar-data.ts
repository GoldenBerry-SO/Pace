// ABOUTME: Shared sidebar group data for /docs and /plugins routes.
// ABOUTME: Mirrors impeccable's category-grouped sidebar pattern.

export interface SidebarItem {
  href: string;
  label: string;
}

export interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

/**
 * Sidebar for /docs and its sub-anchors. Each item points at a section
 * anchor on the main /docs page; sections render as full pages later
 * if we split.
 */
export const DOCS_SIDEBAR: SidebarGroup[] = [
  {
    title: 'Get started',
    items: [
      { href: '/docs/install', label: 'Installing' },
      { href: '/docs#usage', label: 'Using commands' },
    ],
  },
  {
    title: 'Teams',
    items: [
      { href: '/docs/teams', label: 'All teams' },
      { href: '/docs/teams/sales', label: 'Sales' },
      { href: '/docs/teams/marketing', label: 'Marketing' },
      { href: '/docs/teams/engineering', label: 'Engineering' },
      { href: '/docs/teams/data', label: 'Data' },
      { href: '/docs/teams/product', label: 'Product' },
      { href: '/docs/teams/design', label: 'Design' },
      { href: '/docs/teams/finance', label: 'Finance' },
      { href: '/docs/teams/legal', label: 'Legal' },
      { href: '/docs/teams/operations', label: 'Operations' },
      { href: '/docs/teams/people', label: 'People' },
      { href: '/docs/teams/customer-support', label: 'Customer Support' },
      { href: '/docs/teams/productivity', label: 'Productivity' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { href: '/docs#architecture', label: 'Architecture' },
      { href: '/docs/connectors', label: 'Connectors & MCP' },
      { href: '/docs#router', label: 'The /pace router' },
      { href: '/docs#impeccable', label: 'Impeccable (design)' },
    ],
  },
  {
    title: 'Author',
    items: [
      { href: '/docs#authoring', label: 'Authoring commands' },
      { href: '/docs#customizing', label: 'Customizing plugins' },
    ],
  },
  {
    title: 'Operate',
    items: [
      { href: '/docs#updating', label: 'Updating' },
    ],
  },
];

/**
 * Plugin category groupings for the /plugins sidebar. Mirrors how
 * a person browsing the catalog would scan: by domain.
 */
export const PLUGIN_CATEGORY_ORDER = [
  'router',
  'gtm',
  'engineering',
  'operations',
  'product',
  'people',
  'specialized',
  'partner',
  'meta',
] as const;

export const PLUGIN_CATEGORY_LABELS: Record<string, string> = {
  router: 'Router',
  gtm: 'Go-to-market',
  engineering: 'Engineering & Data',
  operations: 'Operations',
  product: 'Product & Design',
  people: 'People',
  specialized: 'Specialized',
  partner: 'Partner-built',
  meta: 'Meta',
};

/**
 * Each plugin slug -> category. Used to bucket the /plugins sidebar.
 */
export const PLUGIN_CATEGORIES: Record<string, string> = {
  pace: 'router',

  sales: 'gtm',
  marketing: 'gtm',
  'customer-support': 'gtm',

  engineering: 'engineering',
  data: 'engineering',

  finance: 'operations',
  legal: 'operations',
  operations: 'operations',

  'product-management': 'product',
  design: 'product',

  'human-resources': 'people',
  productivity: 'people',
  'enterprise-search': 'people',

  'small-business': 'specialized',
  'pdf-viewer': 'specialized',

  apollo: 'partner',
  'brand-voice': 'partner',
  'common-room': 'partner',
  'slack': 'partner',
  'zoom-plugin': 'partner',

  'cowork-plugin-management': 'meta',
};
