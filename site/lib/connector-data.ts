// ABOUTME: Master connector catalog compiled from every plugin's
// ABOUTME: CONNECTORS.md. One row per category, with bundled servers,
// ABOUTME: alternatives, and which plugins use it.

export interface ConnectorCategory {
  name: string;
  placeholder: string;
  bundled: string[];
  alternatives: string[];
  usedBy: string[];
  group:
    | 'communication'
    | 'productivity'
    | 'go-to-market'
    | 'data'
    | 'product-design'
    | 'finance-ops'
    | 'people'
    | 'legal'
    | 'engineering'
    | 'specialized';
}

export const CONNECTOR_CATEGORIES: ConnectorCategory[] = [
  // Communication & collaboration
  {
    name: 'Chat',
    placeholder: '~~chat',
    bundled: ['Slack'],
    alternatives: ['Microsoft Teams', 'Discord'],
    usedBy: ['sales', 'marketing', 'customer-support', 'design', 'engineering', 'enterprise-search', 'finance', 'human-resources', 'legal', 'operations', 'product-management', 'productivity'],
    group: 'communication',
  },
  {
    name: 'Email',
    placeholder: '~~email',
    bundled: ['Gmail', 'Microsoft 365'],
    alternatives: [],
    usedBy: ['sales', 'customer-support', 'enterprise-search', 'finance', 'human-resources', 'legal', 'operations', 'product-management', 'productivity'],
    group: 'communication',
  },
  {
    name: 'Calendar',
    placeholder: '~~calendar',
    bundled: ['Google Calendar', 'Microsoft 365'],
    alternatives: [],
    usedBy: ['sales', 'human-resources', 'legal', 'operations', 'product-management', 'productivity'],
    group: 'communication',
  },
  {
    name: 'Office suite',
    placeholder: '~~office suite',
    bundled: ['Microsoft 365'],
    alternatives: ['Google Workspace'],
    usedBy: ['enterprise-search', 'finance', 'legal', 'operations', 'productivity'],
    group: 'communication',
  },
  {
    name: 'Cloud storage',
    placeholder: '~~cloud storage',
    bundled: ['Microsoft 365', 'Box', 'Egnyte'],
    alternatives: ['Dropbox', 'SharePoint', 'Google Drive'],
    usedBy: ['customer-support', 'enterprise-search', 'legal'],
    group: 'communication',
  },

  // Productivity
  {
    name: 'Knowledge base',
    placeholder: '~~knowledge base',
    bundled: ['Notion', 'Guru', 'Atlassian Confluence'],
    alternatives: ['Help Scout', 'Slite', 'Coda'],
    usedBy: ['sales', 'marketing', 'customer-support', 'design', 'enterprise-search', 'human-resources', 'legal', 'operations', 'product-management', 'productivity'],
    group: 'productivity',
  },
  {
    name: 'Project tracker',
    placeholder: '~~project tracker',
    bundled: ['Linear', 'Asana', 'Atlassian (Jira/Confluence)', 'monday.com', 'ClickUp'],
    alternatives: ['Shortcut', 'Basecamp', 'Wrike'],
    usedBy: ['sales', 'customer-support', 'design', 'enterprise-search', 'engineering', 'human-resources', 'legal', 'operations', 'product-management', 'productivity', 'data'],
    group: 'productivity',
  },

  // Go-to-market
  {
    name: 'CRM',
    placeholder: '~~CRM',
    bundled: ['HubSpot', 'Close'],
    alternatives: ['Salesforce', 'Pipedrive', 'Copper'],
    usedBy: ['sales', 'customer-support'],
    group: 'go-to-market',
  },
  {
    name: 'Sales engagement',
    placeholder: '~~sales engagement',
    bundled: ['Outreach'],
    alternatives: ['Salesloft', 'Apollo'],
    usedBy: ['sales'],
    group: 'go-to-market',
  },
  {
    name: 'Data enrichment',
    placeholder: '~~data enrichment',
    bundled: ['Clay', 'ZoomInfo', 'Apollo'],
    alternatives: ['Clearbit', 'Lusha'],
    usedBy: ['sales'],
    group: 'go-to-market',
  },
  {
    name: 'Meeting transcription',
    placeholder: '~~conversation intelligence',
    bundled: ['Fireflies'],
    alternatives: ['Gong', 'Chorus', 'Otter.ai', 'Dovetail'],
    usedBy: ['sales', 'product-management'],
    group: 'go-to-market',
  },
  {
    name: 'Competitive intelligence',
    placeholder: '~~competitive intelligence',
    bundled: ['Similarweb'],
    alternatives: ['Crayon', 'Klue'],
    usedBy: ['sales', 'product-management'],
    group: 'go-to-market',
  },
  {
    name: 'Marketing automation',
    placeholder: '~~marketing automation',
    bundled: ['HubSpot'],
    alternatives: ['Marketo', 'Pardot', 'Mailchimp'],
    usedBy: ['marketing'],
    group: 'go-to-market',
  },
  {
    name: 'Email marketing',
    placeholder: '~~email marketing',
    bundled: ['Klaviyo'],
    alternatives: ['Mailchimp', 'Brevo', 'Customer.io'],
    usedBy: ['marketing'],
    group: 'go-to-market',
  },
  {
    name: 'SEO',
    placeholder: '~~SEO',
    bundled: ['Ahrefs', 'Similarweb'],
    alternatives: ['Semrush', 'Moz'],
    usedBy: ['marketing'],
    group: 'go-to-market',
  },
  {
    name: 'Marketing analytics',
    placeholder: '~~marketing analytics',
    bundled: ['Supermetrics'],
    alternatives: ['Google Analytics', 'Semrush'],
    usedBy: ['marketing'],
    group: 'go-to-market',
  },
  {
    name: 'Support platform',
    placeholder: '~~support platform',
    bundled: ['Intercom'],
    alternatives: ['Zendesk', 'Freshdesk', 'HubSpot Service Hub'],
    usedBy: ['customer-support'],
    group: 'go-to-market',
  },
  {
    name: 'User feedback',
    placeholder: '~~user feedback',
    bundled: ['Intercom'],
    alternatives: ['Productboard', 'Canny', 'UserVoice', 'Dovetail'],
    usedBy: ['design', 'product-management'],
    group: 'go-to-market',
  },

  // Data & analytics
  {
    name: 'Data warehouse',
    placeholder: '~~data warehouse',
    bundled: ['Snowflake*', 'Databricks*', 'BigQuery', 'Definite'],
    alternatives: ['Redshift', 'PostgreSQL', 'MySQL'],
    usedBy: ['data', 'finance'],
    group: 'data',
  },
  {
    name: 'Notebook',
    placeholder: '~~notebook',
    bundled: ['Hex'],
    alternatives: ['Jupyter', 'Deepnote', 'Observable'],
    usedBy: ['data'],
    group: 'data',
  },
  {
    name: 'Product analytics',
    placeholder: '~~product analytics',
    bundled: ['Amplitude', 'Pendo'],
    alternatives: ['Mixpanel', 'Heap', 'FullStory'],
    usedBy: ['data', 'marketing', 'product-management'],
    group: 'data',
  },
  {
    name: 'Analytics / BI',
    placeholder: '~~analytics',
    bundled: [],
    alternatives: ['Tableau', 'Looker', 'Power BI'],
    usedBy: ['finance'],
    group: 'data',
  },

  // Product & design
  {
    name: 'Design',
    placeholder: '~~design',
    bundled: ['Figma', 'Canva'],
    alternatives: ['Sketch', 'Adobe XD', 'Framer'],
    usedBy: ['design', 'marketing', 'product-management'],
    group: 'product-design',
  },

  // Engineering
  {
    name: 'Source control',
    placeholder: '~~source control',
    bundled: ['GitHub'],
    alternatives: ['GitLab', 'Bitbucket'],
    usedBy: ['engineering'],
    group: 'engineering',
  },

  // Finance & ops
  {
    name: 'ERP / Accounting',
    placeholder: '~~erp',
    bundled: [],
    alternatives: ['NetSuite', 'SAP', 'QuickBooks', 'Xero'],
    usedBy: ['finance'],
    group: 'finance-ops',
  },
  {
    name: 'ITSM',
    placeholder: '~~ITSM',
    bundled: ['ServiceNow'],
    alternatives: ['Zendesk', 'Freshservice', 'Jira Service Management'],
    usedBy: ['operations'],
    group: 'finance-ops',
  },
  {
    name: 'Procurement',
    placeholder: '~~procurement',
    bundled: [],
    alternatives: ['Coupa', 'SAP Ariba', 'Zip'],
    usedBy: ['operations'],
    group: 'finance-ops',
  },

  // People
  {
    name: 'HRIS',
    placeholder: '~~HRIS',
    bundled: [],
    alternatives: ['Workday', 'BambooHR', 'Rippling', 'Gusto'],
    usedBy: ['human-resources'],
    group: 'people',
  },
  {
    name: 'ATS',
    placeholder: '~~ATS',
    bundled: [],
    alternatives: ['Greenhouse', 'Lever', 'Ashby', 'Workable'],
    usedBy: ['human-resources'],
    group: 'people',
  },
  {
    name: 'Compensation data',
    placeholder: '~~compensation data',
    bundled: [],
    alternatives: ['Pave', 'Radford', 'Levels.fyi'],
    usedBy: ['human-resources'],
    group: 'people',
  },

  // Legal
  {
    name: 'E-signature',
    placeholder: '~~e-signature',
    bundled: ['DocuSign'],
    alternatives: ['Adobe Sign'],
    usedBy: ['legal'],
    group: 'legal',
  },
  {
    name: 'CLM',
    placeholder: '~~CLM',
    bundled: [],
    alternatives: ['Ironclad', 'Agiloft'],
    usedBy: ['legal'],
    group: 'legal',
  },

  // Specialized (bio-research)
  {
    name: 'Literature',
    placeholder: '~~literature',
    bundled: ['PubMed', 'bioRxiv', 'Consensus'],
    alternatives: ['Google Scholar', 'Semantic Scholar'],
    usedBy: ['bio-research'],
    group: 'specialized',
  },
  {
    name: 'Clinical trials',
    placeholder: '~~clinical trials',
    bundled: ['ClinicalTrials.gov'],
    alternatives: ['EU Clinical Trials Register'],
    usedBy: ['bio-research'],
    group: 'specialized',
  },
  {
    name: 'Chemical database',
    placeholder: '~~chemical database',
    bundled: ['ChEMBL'],
    alternatives: ['PubChem', 'DrugBank'],
    usedBy: ['bio-research'],
    group: 'specialized',
  },
  {
    name: 'Drug targets',
    placeholder: '~~drug targets',
    bundled: ['Open Targets'],
    alternatives: ['UniProt', 'STRING'],
    usedBy: ['bio-research'],
    group: 'specialized',
  },
  {
    name: 'Lab platform',
    placeholder: '~~lab platform',
    bundled: ['Benchling*'],
    alternatives: [],
    usedBy: ['bio-research'],
    group: 'specialized',
  },
];

export const CONNECTOR_GROUP_ORDER = [
  'communication',
  'productivity',
  'go-to-market',
  'data',
  'product-design',
  'engineering',
  'finance-ops',
  'people',
  'legal',
  'specialized',
] as const;

export const CONNECTOR_GROUP_LABELS: Record<string, string> = {
  communication: 'Communication & collaboration',
  productivity: 'Productivity',
  'go-to-market': 'Go-to-market',
  data: 'Data & analytics',
  'product-design': 'Product & design',
  engineering: 'Engineering',
  'finance-ops': 'Finance & operations',
  people: 'People',
  legal: 'Legal',
  specialized: 'Specialized (life sciences)',
};
