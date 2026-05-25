// ABOUTME: Editorial content for the /docs/teams/<team> pages. Single
// ABOUTME: source of truth: plugins to install, workflows with example
// ABOUTME: prompts, tips, and connectors to set up per team.

export interface TeamPlugin {
  slug: string;
  role: 'primary' | 'companion';
  why: string;
}

export interface TeamWorkflow {
  title: string;
  description: string;
  prompt?: string;
}

export interface TeamTip {
  title: string;
  body: string;
}

export interface TeamSeeAlso {
  slug: string;
  label: string;
  why: string;
}

export interface TeamTrigger {
  /** Plain-English thing the user would say or type. */
  say: string;
  /** The slash command Claude routes the prompt to. */
  runs: string;
}

export interface TeamRedirect {
  /** External destination this team defers to (e.g. impeccable). */
  url: string;
  /** Plain-text label shown on the CTA button. */
  cta: string;
  /** Short rationale shown above the CTA. */
  reason: string;
}

export interface TeamGuide {
  slug: string;
  name: string;
  tagline: string;
  intro: string;
  plugins: TeamPlugin[];
  connectors: string[];
  workflows: TeamWorkflow[];
  tips: TeamTip[];
  seeAlso: TeamSeeAlso[];
  /** Natural-language phrases the team would actually say, mapped to the
   *  skill Claude auto-triggers. Teaches the auto-trigger pattern to
   *  non-technical users. */
  triggers?: TeamTrigger[];
  /** If set, the team page renders as a pointer to the external source
   *  instead of the standard plugin/workflow/tips layout. */
  redirect?: TeamRedirect;
}

export const TEAM_GUIDES: TeamGuide[] = [
  // ─── SALES ──────────────────────────────────────────────────────────────
  {
    slug: 'sales',
    name: 'Sales',
    tagline: 'Prep calls, manage pipeline, write personalized outreach that moves deals.',
    intro:
      "Sales teams burn most of the week on prep, research, and pipeline hygiene; the work between the actual selling. Pace gives every rep an account researcher, a call coach, a pipeline analyst, and a writer that already knows your tone. Connect HubSpot and Slack and most of the work happens before you ask.",
    plugins: [
      { slug: 'sales', role: 'primary', why: 'Account research, call prep, pipeline review, outreach drafting, competitive intel.' },
      { slug: 'customer-support', role: 'companion', why: 'When deals turn into accounts: hand-off context, escalation history, common questions.' },
      { slug: 'brand-voice', role: 'companion', why: 'Validates outreach drafts against your company tone before they go out.' },
      { slug: 'productivity', role: 'companion', why: 'Daily briefing pulls together calendar, Slack DMs, and Linear in one digest.' },
    ],
    connectors: ['HubSpot', 'Slack', 'Close', 'Clay', 'ZoomInfo', 'Fireflies', 'Gmail'],
    workflows: [
      {
        title: 'Pre-call prep',
        description: 'Pulls the account from your CRM, recent Slack mentions, news, and recent calls. Produces a one-page brief with talking points and discovery questions.',
        prompt: '/sales:call-prep Acme Corp',
      },
      {
        title: 'Personalized outreach',
        description: 'Drafts cold or follow-up outreach with the right depth of personalization. Reads recent activity in HubSpot to anchor the message.',
        prompt: '/sales:draft-outreach to Acme CFO about pricing discussion we had last week',
      },
      {
        title: 'Weekly pipeline review',
        description: 'Walks each deal in the pipeline, flags stalled ones, suggests next actions, and surfaces deals that need exec air cover.',
        prompt: '/sales:pipeline-review for Q4',
      },
      {
        title: 'Competitive battle card',
        description: 'Generates a side-by-side comparison against a named competitor: positioning, pricing, weaknesses, common objections.',
        prompt: '/sales:competitive-intelligence Salesforce',
      },
      {
        title: 'Daily briefing',
        description: 'Morning digest: calls today, deals to push, urgent Slack DMs, replies waiting.',
        prompt: '/sales:daily-briefing',
      },
    ],
    tips: [
      { title: 'Run prep the night before', body: 'Schedule /sales:call-prep the evening before; you wake up to a brief in your inbox.' },
      { title: 'Connect Fireflies first', body: 'One connector unlocks call transcripts for half the sales skills (call-summary, account-research, call-prep).' },
      { title: 'Pair with brand-voice', body: 'After /sales:draft-outreach, run /brand-voice:validate to catch off-tone phrases before sending.' },
      { title: 'Layer on Common Room or Apollo', body: 'For ABM, /common-room:* surfaces warm intros and /apollo:* enriches prospecting lists. Both are partner-built plugins.' },
      { title: 'Use account-research, not just call-prep', body: '/sales:account-research is research-only; /sales:call-prep also writes the talking points. Use the former for prospecting, the latter for booked meetings.' },
      { title: 'Trust the forecast', body: '/sales:forecast pulls from HubSpot stages and historical close rates. It will not flatter your numbers; that is the point.' },
    ],
    triggers: [
      { say: 'Prep me for my call with Acme tomorrow', runs: '/sales:call-prep' },
      { say: 'Research who at Acme makes buying decisions', runs: '/sales:account-research' },
      { say: 'Draft a follow-up to the Acme CFO about pricing', runs: '/sales:draft-outreach' },
      { say: 'Walk me through my pipeline this week', runs: '/sales:pipeline-review' },
      { say: 'Summarize the call I just finished with Acme', runs: '/sales:call-summary' },
      { say: 'Compare us to Salesforce for the Acme deal', runs: '/sales:competitive-intelligence' },
    ],
    seeAlso: [
      { slug: 'marketing', label: 'Marketing', why: 'Joint campaigns + ICP refinement live across the seam.' },
      { slug: 'customer-support', label: 'Customer Support', why: 'Hand-off context for closed-won accounts.' },
      { slug: 'productivity', label: 'Productivity', why: 'Productivity + enterprise-search are cross-cutting.' },
    ],
  },

  // ─── MARKETING ──────────────────────────────────────────────────────────
  {
    slug: 'marketing',
    name: 'Marketing',
    tagline: 'Draft content, plan campaigns, enforce brand voice, report on what moved.',
    intro:
      "Marketing ships more than it writes. The work cycle is brief → draft → review → measure, repeated across channels. Pace shortens each step and keeps the voice consistent. Drop /brand-voice:discover on existing content once; every subsequent draft validates against it.",
    plugins: [
      { slug: 'marketing', role: 'primary', why: 'Content drafts, campaign plans, competitor briefs, performance reports.' },
      { slug: 'brand-voice', role: 'primary', why: 'Discover your tone from existing docs, then validate every draft against it.' },
      { slug: 'design', role: 'companion', why: 'UX research, accessibility audits, design system support for marketing pages.' },
      { slug: 'enterprise-search', role: 'companion', why: 'Find existing assets, decks, and copy before drafting new ones from scratch.' },
    ],
    connectors: ['Slack', 'Canva', 'Figma', 'HubSpot', 'Amplitude', 'Notion', 'Ahrefs', 'Klaviyo', 'SimilarWeb'],
    workflows: [
      {
        title: 'Campaign plan',
        description: 'Generates a campaign brief: positioning, target audience, channels, timeline, assets needed, success metrics.',
        prompt: '/marketing:campaign-plan Q4 product launch',
      },
      {
        title: 'Brand voice validation',
        description: 'Reads a draft and flags phrases that drift from your brand tone. Run it after every content draft.',
        prompt: '/brand-voice:validate this blog draft',
      },
      {
        title: 'Competitor brief',
        description: 'Summarizes a competitor announcement or campaign and suggests our angle of response.',
        prompt: "/marketing:competitor-brief on Linear's launch yesterday",
      },
      {
        title: 'Content draft',
        description: 'Drafts blog posts, social, emails, or landing copy. Pulls in your brand voice automatically once /brand-voice:discover has run.',
        prompt: '/marketing:draft-content blog post: how agentic workflows change product roadmaps',
      },
      {
        title: 'Channel performance report',
        description: 'Reads connected analytics, builds a weekly or quarterly report with notable wins, drops, and recommended shifts in spend.',
        prompt: '/marketing:performance Q3 channel mix',
      },
    ],
    tips: [
      { title: 'Run /brand-voice:discover first', body: 'One run on your existing best content gives every later skill a tone calibration to work against. Without it, drafts sound generic.' },
      { title: 'Connect Ahrefs early', body: "Competitor briefs without search data are guesswork. Ahrefs (or SimilarWeb) gives you the actual traffic + keyword picture." },
      { title: 'Search before writing', body: '/enterprise-search:find before drafting; half the "new" content already exists somewhere in Notion or Drive.' },
      { title: 'Treat the campaign plan as living', body: 'Run /marketing:campaign-plan once at kickoff, then reference it through the campaign. Re-running mid-flight to update the plan beats wing-it.' },
      { title: 'Stack draft + validate', body: 'Always: /marketing:draft-content → /brand-voice:validate → ship. The two-step is fast and the voice consistency compounds.' },
      { title: 'Use Canva connector for assets', body: 'Plugins can fetch existing Canva designs as references when drafting variants, saving the "what does our last social post look like?" lookup.' },
    ],
    triggers: [
      { say: 'Plan a launch campaign for our new pricing tier', runs: '/marketing:campaign-plan' },
      { say: 'Draft a LinkedIn post about our Q3 results', runs: '/marketing:draft-content' },
      { say: 'Pull last week\'s campaign performance', runs: '/marketing:performance-report' },
      { say: 'Check this blog draft against our brand voice', runs: '/brand-voice:brand-voice-enforcement' },
      { say: 'What did Notion ship last week?', runs: '/marketing:competitive-brief' },
      { say: 'Run an SEO audit on our pricing page', runs: '/marketing:seo-audit' },
    ],
    seeAlso: [
      { slug: 'sales', label: 'Sales', why: 'Outreach + ICP work overlaps; brand voice carries across.' },
      { slug: 'design', label: 'Design', why: 'Visual assets and design-system consistency for marketing surfaces.' },
      { slug: 'product', label: 'Product', why: 'Launch narrative crosses marketing/product daily.' },
    ],
  },

  // ─── ENGINEERING ────────────────────────────────────────────────────────
  {
    slug: 'engineering',
    name: 'Engineering',
    tagline: 'Reviews, standups, incident response, architecture decisions, tech debt.',
    intro:
      "Engineering teams spend half their week on non-coding work: PR review, standup updates, on-call, architecture conversations, docs. Pace tightens each one. The engineering plugin works standalone (no required connectors), and pairs with /data:* for the 'why is this slow' questions that show up in reviews.",
    plugins: [
      { slug: 'engineering', role: 'primary', why: 'Code review, architecture decisions, incident response, tech debt audits, deploy checklists, testing strategy, docs.' },
      { slug: 'data', role: 'companion', why: 'When reviews touch performance, SQL, or analytics; pair with /data:* to ground in real numbers.' },
      { slug: 'productivity', role: 'companion', why: 'Standups, daily focus blocks, memory of past architecture decisions.' },
    ],
    connectors: ['(none required for engineering itself)', 'Snowflake / Databricks / BigQuery (via /data:*)', 'Linear / Jira / Slack (via /productivity:*)'],
    workflows: [
      {
        title: 'Pre-review code review',
        description: 'Runs a structural review before requesting human review. Catches the obvious stuff: dead code paths, missing tests, naming inconsistencies, broken contracts.',
        prompt: '/engineering:code-review this PR',
      },
      {
        title: 'Standup summary',
        description: "Generates your async standup by reading Linear tickets touched, git commits pushed, and what's blocking.",
        prompt: "/engineering:standup what's blocking me today",
      },
      {
        title: 'Architecture decision',
        description: 'Pros/cons + recommendation on a system choice. Writes the ADR (architecture decision record) in your repo format.',
        prompt: '/engineering:architecture should we use NATS or Kafka for the event bus',
      },
      {
        title: 'Incident response',
        description: 'Triage playbook: diagnostic questions, likely causes, mitigation order, comms template. Useful at 3am.',
        prompt: '/engineering:incident-response p1 ingestion lag',
      },
      {
        title: 'Tech debt audit',
        description: 'Scans a directory or service and ranks debt by effort vs payoff. Surfaces stuff you keep meaning to fix.',
        prompt: '/engineering:tech-debt audit this directory',
      },
      {
        title: 'Documentation gap fix',
        description: 'Reads a module and writes the missing docs: contracts, edge cases, gotchas.',
        prompt: '/engineering:documentation for the rate-limiter middleware',
      },
    ],
    tips: [
      { title: 'Self-review before requesting review', body: '/engineering:code-review before you tag a human. Catches naming and silly mistakes; the human gets to focus on intent.' },
      { title: 'Pin the deploy-checklist', body: 'Use /engineering:deploy-checklist before any prod push. Pin it (via the Pace router pin.mjs) once your team standardizes.' },
      { title: 'Testing strategy upfront', body: '/engineering:testing-strategy when scoping a feature, not when writing tests. Saves rewrite cycles.' },
      { title: 'Pair with /data for perf reviews', body: 'When the PR touches anything that hits the DB, run /data:write-query against staging to verify the query plan before merging.' },
      { title: 'Incident response > heroics', body: '/engineering:incident-response has saved hours at 3am. Beats inventing a playbook under pressure.' },
      { title: 'ADR convention sticks', body: "/engineering:architecture writes ADRs in a stable format. Adopt the format and don't fight it; consistency is the point of ADRs." },
    ],
    triggers: [
      { say: 'Review this PR before I tag the team', runs: '/engineering:code-review' },
      { say: 'Catch anything I missed before I open the PR', runs: '/engineering:careful-review' },
      { say: 'Diagnose this race condition in checkout', runs: '/engineering:diagnose' },
      { say: 'Write tests for the new checkout flow using TDD', runs: '/engineering:tdd' },
      { say: 'Spec the feature so we can ship it as stacked PRs', runs: '/engineering:spec' },
      { say: 'Commit my changes and open a PR', runs: '/engineering:ship-pr' },
    ],
    seeAlso: [
      { slug: 'data', label: 'Data', why: 'Engineering and data overlap on perf, schema, and query questions.' },
      { slug: 'product', label: 'Product', why: 'Spec ↔ tech scope conversations are easier when both sides have the same plugins.' },
      { slug: 'productivity', label: 'Productivity', why: 'Productivity + enterprise-search help with cross-functional context.' },
    ],
  },

  // ─── DATA ───────────────────────────────────────────────────────────────
  {
    slug: 'data',
    name: 'Data',
    tagline: 'Write SQL, visualize, validate, ship dashboards, interpret without bullshit.',
    intro:
      'Data work splits roughly three ways: writing SQL, understanding what it returned, and explaining the result. Pace handles all three. Connect your warehouse once and /data:write-query learns your schema. Use /data:validate-analysis before sharing a conclusion; it has caught Simpson\'s-paradox-shaped errors more than once.',
    plugins: [
      { slug: 'data', role: 'primary', why: 'SQL drafting, visualization, statistical validation, dashboards, anomaly interpretation.' },
      { slug: 'engineering', role: 'companion', why: 'When data questions overflow into pipeline or schema territory.' },
      { slug: 'finance', role: 'companion', why: 'Variance analysis and financial-system queries lean on data muscle.' },
    ],
    connectors: ['Snowflake', 'Databricks', 'BigQuery', 'Hex', 'Amplitude', 'Jira'],
    workflows: [
      {
        title: 'Write SQL from intent',
        description: 'Describe what you want; get SQL back, sized to your schema. Connecting a warehouse means it can also run it and return results.',
        prompt: '/data:write-query monthly active users by plan tier, last 6 months',
      },
      {
        title: 'Visualize results',
        description: 'Suggests the right chart type for a result set and generates the visualization (Hex notebook, plot code, or chart spec).',
        prompt: '/data:visualize this query result',
      },
      {
        title: 'Validate an analysis',
        description: "Pre-flight check before sharing a conclusion. Looks for confounds, sampling issues, base-rate mistakes, Simpson's paradox shapes.",
        prompt: '/data:validate-analysis my conclusion that conversion improved 12% in Q3',
      },
      {
        title: 'Statistical test',
        description: 'Runs the right test (chi-square, t-test, mann-whitney) and reports significance, effect size, and what it actually means in business terms.',
        prompt: '/data:statistical-test on A/B results from last sprint',
      },
      {
        title: 'Build a dashboard',
        description: 'Generates a dashboard spec (Hex, Looker, or Mode-compatible) from a set of queries.',
        prompt: '/data:dashboard for weekly product health metrics',
      },
      {
        title: 'Interpret an anomaly',
        description: 'Given a chart or metric drop, generates plausible explanations ranked by likelihood and what data would distinguish them.',
        prompt: '/data:interpret this drop in DAU last Tuesday',
      },
    ],
    tips: [
      { title: 'Always validate before sharing', body: '/data:validate-analysis catches the errors that get spotted by the audience in the meeting. Cheap insurance.' },
      { title: 'Connect the warehouse first', body: "Without a connector, /data:* writes SQL but can't run it. With one, the workflow is interactive." },
      { title: 'Document queries you keep', body: '/data:document-query before saving SQL to your team library. Future-you appreciates context.' },
      { title: 'Use the three-step rhythm', body: 'For exploratory: /data:write-query → /data:visualize → /data:interpret. Quick, surprisingly thorough.' },
      { title: 'Pair with engineering for perf', body: 'When the query is slow, hand off via /engineering:code-review of the EXPLAIN plan.' },
      { title: 'Statistical tests are not optional for A/B', body: '/data:statistical-test instead of eyeballing two means. It tells you whether the effect is real.' },
    ],
    triggers: [
      { say: 'Write a SQL query for revenue by region last quarter', runs: '/data:write-query' },
      { say: 'Analyze churn over the past 90 days', runs: '/data:analyze' },
      { say: 'Are there anomalies in our signup funnel?', runs: '/data:statistical-analysis' },
      { say: 'Build a dashboard for product engagement', runs: '/data:build-dashboard' },
      { say: 'Visualize this query result as a chart', runs: '/data:create-viz' },
      { say: 'Sanity-check this dataset before I share it', runs: '/data:validate-data' },
    ],
    seeAlso: [
      { slug: 'engineering', label: 'Engineering', why: 'Pipelines, schemas, query perf.' },
      { slug: 'finance', label: 'Finance', why: 'Heavy users of warehouse queries.' },
      { slug: 'product', label: 'Product', why: 'PM ↔ data is constant; grounding decisions in numbers.' },
    ],
  },

  // ─── PRODUCT ────────────────────────────────────────────────────────────
  {
    slug: 'product',
    name: 'Product',
    tagline: 'Specs, roadmaps, user research synthesis, stakeholder updates, competitive scans.',
    intro:
      "PMs juggle synthesis: turning interviews into specs, backlog into roadmap, telemetry into stories. The mechanical part of that work is where Pace earns its keep. Run /product-management:synthesize on a stack of interview transcripts and reclaim a day of your week.",
    plugins: [
      { slug: 'product-management', role: 'primary', why: 'Specs, roadmaps, user research synthesis, stakeholder updates, competitive scans.' },
      { slug: 'design', role: 'companion', why: 'Research synthesis and dev-handoff conversations live across the seam.' },
      { slug: 'data', role: 'companion', why: 'Roadmap prioritization grounded in actual usage data.' },
      { slug: 'engineering', role: 'companion', why: 'Spec ↔ scope conversations are smoother when both sides see the same context.' },
    ],
    connectors: ['Linear', 'Asana', 'Monday', 'ClickUp', 'Jira', 'Notion', 'Figma', 'Amplitude', 'Pendo', 'Intercom', 'Fireflies'],
    workflows: [
      {
        title: 'Feature spec',
        description: 'Writes a spec from a one-liner: user story, requirements, scope cuts, success metrics, edge cases.',
        prompt: '/product-management:spec for cohort filtering in the analytics dashboard',
      },
      {
        title: 'Roadmap from backlog',
        description: 'Reads Linear/Jira backlog and shapes a quarter or half. Highlights dependencies and parking-lot items.',
        prompt: '/product-management:roadmap Q1 from current Linear backlog',
      },
      {
        title: 'User research synthesis',
        description: 'Reads transcripts, surfaces patterns, names themes, generates a research summary doc.',
        prompt: '/product-management:synthesize these 12 user interview transcripts',
      },
      {
        title: 'Stakeholder update',
        description: 'Drafts the biweekly or monthly update: what shipped, what slipped, what is next, asks.',
        prompt: '/product-management:update biweekly to exec team',
      },
      {
        title: 'Competitive landscape scan',
        description: 'Pulls competitor product updates from the last week or quarter and writes a brief on what is shipping, what is shifting.',
        prompt: '/product-management:competitive scan our space this week',
      },
    ],
    tips: [
      { title: 'Synthesize is the killer skill', body: '/product-management:synthesize on raw interview transcripts saves a full day every week. Connect Fireflies so transcripts arrive automatically.' },
      { title: 'Ground roadmaps in data', body: 'Pair /product-management:roadmap with /data:* so prioritization argues from real usage, not vibes.' },
      { title: 'Spec quality compounds', body: 'A spec that is clear, scoped, and has metrics defined upfront saves multiple weeks of re-scoping later. Invest the hour with /product-management:spec.' },
      { title: 'Use it for retros too', body: '/product-management:synthesize works on retro notes the same way it works on interviews. Pattern-find what teams keep saying.' },
      { title: 'Stakeholder cadence beats one-offs', body: 'Run /product-management:update on a fixed schedule (biweekly) rather than reactively. Trust compounds with consistency.' },
      { title: 'Competitive scans weekly', body: '/product-management:competitive once a week is enough; daily is noise.' },
    ],
    triggers: [
      { say: 'Synthesize these 8 user interviews into themes', runs: '/product-management:synthesize-research' },
      { say: 'Write a PRD for the new collaboration feature', runs: '/product-management:write-spec' },
      { say: 'Update stakeholders on this sprint\'s progress', runs: '/product-management:stakeholder-update' },
      { say: 'What did our competitors ship this week?', runs: '/product-management:competitive-brief' },
      { say: 'Brainstorm 10 ways to improve onboarding', runs: '/product-management:product-brainstorming' },
      { say: 'Plan next sprint based on this backlog', runs: '/product-management:sprint-planning' },
    ],
    seeAlso: [
      { slug: 'design', label: 'Design', why: 'Research synthesis and dev handoff cross over.' },
      { slug: 'data', label: 'Data', why: 'Roadmap grounding and metric definition.' },
      { slug: 'engineering', label: 'Engineering', why: 'Specs land with eng; faster when both sides see the same plugins.' },
    ],
  },

  // ─── DESIGN (defers to impeccable) ──────────────────────────────────────
  {
    slug: 'design',
    name: 'Design',
    tagline: 'For frontend code design, Pace defers to impeccable.',
    intro:
      "Design is its own discipline with its own dedicated tool, and frontend code design in particular has so much depth that it deserves a whole skill kit rather than a single Pace plugin. So Pace points designers and frontend engineers at impeccable: a separate Apache 2.0 router (/impeccable) with 23 sub-commands across typography, color, layout, motion, accessibility, UX writing, design systems, and dev handoff. Impeccable also ships a detector that catches AI-generated design slop (low-contrast text, icon-tile stacks, gradient-on-gradient, dead-center heroes, flat type hierarchy) via CLI, browser overlay, and Chrome extension. Pace's own /design plugin handles the policy layer: UX research synthesis, design-system management, accessibility as a workflow, dev-handoff briefs. Most teams install both.",
    redirect: {
      url: 'https://impeccable.style/docs',
      cta: 'Read the impeccable docs',
      reason:
        "Impeccable is the frontend-craft counterpart to Pace. 23 sub-commands focused entirely on the design work that ships in actual UI code — typography, color, layout, motion, a11y — plus ~50 anti-pattern detection rules and a multi-harness install (Claude Code, Cursor, Gemini, Codex, and more).",
    },
    plugins: [],
    connectors: [],
    workflows: [],
    tips: [],
    seeAlso: [
      { slug: 'product', label: 'Product', why: 'Research and synthesis cross the design/product seam.' },
      { slug: 'marketing', label: 'Marketing', why: 'Brand voice + design system feed marketing surfaces.' },
      { slug: 'engineering', label: 'Engineering', why: 'Handoff conversations span design and engineering.' },
    ],
  },

  // ─── FINANCE ────────────────────────────────────────────────────────────
  {
    slug: 'finance',
    name: 'Finance',
    tagline: 'Journal entries, reconciliation, statements, variance analysis, audit prep.',
    intro:
      'Finance work is rhythmic: month-end, quarter-end, year-end, audit. The repeatable part of each rhythm is where Pace earns its keep. Connect your warehouse and /finance:* can query the ledger directly. /finance:variance-analysis surfaces what you should explain to the CEO before they ask.',
    plugins: [
      { slug: 'finance', role: 'primary', why: 'Journal entries, reconciliation, statements, variance analysis, month-end close, audit prep.' },
      { slug: 'operations', role: 'companion', why: 'Vendor management and procurement workflows that touch AP.' },
      { slug: 'data', role: 'companion', why: 'Heavy lift on ad-hoc queries against the data warehouse.' },
    ],
    connectors: ['Snowflake', 'Databricks', 'BigQuery', 'Microsoft 365 (spreadsheets)'],
    workflows: [
      {
        title: 'Journal entries from a batch',
        description: 'Reads a CSV or pasted batch (AP invoices, expense reports, journal data) and generates the entries with proper coding.',
        prompt: '/finance:journal-entries from this AP batch',
      },
      {
        title: 'Bank reconciliation',
        description: 'Reconciles the bank statement against the GL: matched, unmatched, suggested coding for outliers.',
        prompt: '/finance:reconcile bank statement vs ledger for September',
      },
      {
        title: 'Generate financial statements',
        description: 'Produces P&L, balance sheet, cash flow statement for a period. Pulls from connected warehouse or pasted trial balance.',
        prompt: '/finance:generate-statements Q3',
      },
      {
        title: 'Variance analysis',
        description: 'Compares budget vs actual at the category or department level. Explains material variances with hypotheses.',
        prompt: '/finance:variance-analysis Q3 marketing spend vs budget',
      },
      {
        title: 'Month-end close support',
        description: 'Generates the checklist, suggests order, flags items that usually slip.',
        prompt: '/finance:month-end checklist for September',
      },
      {
        title: 'Audit prep',
        description: 'Reads the prior period and surfaces audit-friendly documentation: schedules, supporting docs needed, common auditor asks.',
        prompt: '/finance:audit-prep for the Y1 review',
      },
    ],
    tips: [
      { title: 'Connect the warehouse early', body: 'Without it, /finance:* works from pasted data. With it, queries fire directly against the GL.' },
      { title: 'Variance analysis pre-CEO', body: '/finance:variance-analysis surfaces the explanations before the CEO asks. Run it before every monthly close share-out.' },
      { title: 'Month-end as a workflow', body: 'Adopt /finance:month-end as the canonical checklist. Pin it via the Pace router once your team standardizes its close steps.' },
      { title: 'Pair with operations', body: 'For vendor and procurement work, /finance:* + /operations:* covers the AP → vendor lifecycle.' },
      { title: 'Audit prep is incremental', body: "Run /finance:audit-prep monthly, not annually. By year-end, the documentation is already there." },
      { title: 'Statements need a sanity check', body: '/finance:generate-statements is fast but always reconcile the output to your source-of-truth ledger before sharing externally.' },
    ],
    triggers: [
      { say: 'Run the month-end close checklist', runs: '/finance:close-management' },
      { say: 'Explain the variance vs plan for Q3', runs: '/finance:variance-analysis' },
      { say: 'Reconcile last month\'s bank statements', runs: '/finance:reconciliation' },
      { say: 'Draft the journal entries for the new lease', runs: '/finance:journal-entry-prep' },
      { say: 'Prepare audit support docs for SOX testing', runs: '/finance:audit-support' },
      { say: 'Generate this quarter\'s financial statements', runs: '/finance:financial-statements' },
    ],
    seeAlso: [
      { slug: 'operations', label: 'Operations', why: 'Vendor and procurement workflows.' },
      { slug: 'data', label: 'Data', why: 'Warehouse query muscle.' },
      { slug: 'legal', label: 'Legal', why: 'Contracts feed AP; legal touches procurement.' },
    ],
  },

  // ─── LEGAL ──────────────────────────────────────────────────────────────
  {
    slug: 'legal',
    name: 'Legal',
    tagline: 'Contract review, NDA triage, compliance, risk assessment.',
    intro:
      'In-house legal teams field high volumes of similar work: NDAs, vendor agreements, employment letters, compliance questions. Pace triages, drafts, and flags risk so you spend less time on routine and more on the actual hard problems. Final calls still stay human; Pace is research + first-pass review, not legal advice.',
    plugins: [
      { slug: 'legal', role: 'primary', why: 'Contract review, NDA triage, compliance Q&A, risk assessment, templated responses.' },
      { slug: 'operations', role: 'companion', why: 'Vendor management and procurement workflows that legal touches.' },
    ],
    connectors: ['Slack', 'Box', 'Egnyte', 'Jira', 'Microsoft 365'],
    workflows: [
      {
        title: 'Contract review',
        description: 'Reads a contract (MSA, SOW, service agreement) and flags clauses that diverge from your playbook: liability, indemnification, IP, term, termination.',
        prompt: '/legal:contract-review this MSA from $vendor',
      },
      {
        title: 'NDA triage',
        description: 'Compares an inbound NDA against your standard template and flags material deviations. Suggests redlines.',
        prompt: '/legal:nda-review their template vs ours',
      },
      {
        title: 'Compliance question',
        description: 'Researches a question against the relevant framework (GDPR, SOC 2, HIPAA, etc.) and summarizes; not legal advice, research help.',
        prompt: '/legal:compliance-question can we collect EU user data this way?',
      },
      {
        title: 'Risk assessment',
        description: 'Generates a risk register for a new product feature, vendor, or initiative. Categorizes by likelihood and impact.',
        prompt: '/legal:risk-assessment for the new payment processor integration',
      },
      {
        title: 'Templated response',
        description: 'Drafts a response for a common recurring request (enforcement letter, subpoena acknowledgement, employment verification).',
        prompt: '/legal:templated-response for this inbound enforcement query',
      },
    ],
    tips: [
      { title: 'Connect your document store', body: 'Box or Egnyte connectors let /legal:* read precedent docs. Without them, each review is from scratch.' },
      { title: 'Low-stakes NDAs first', body: '/legal:nda-review on inbound NDAs that match standard patterns is a huge time saver. Reserve human review for bespoke or high-stakes.' },
      { title: 'Compliance question ≠ legal advice', body: 'Treat /legal:compliance-question output as research. Final call stays with you. The skill is good at surfacing precedent and frameworks, not making the decision.' },
      { title: 'Build templated responses for repeats', body: 'After three similar inbound questions, write a /legal:templated-response. Saves the fourth, fifth, and sixth.' },
      { title: 'Wrap in /pace router', body: 'For your standard contract review playbook, build a /pace router command that wraps /legal:contract-review with your specific flags. Reuse beats re-prompting.' },
      { title: 'Document the why', body: 'When Pace flags a clause, document why it matters in your playbook. The next reviewer (human or Pace) benefits.' },
    ],
    triggers: [
      { say: 'Triage this NDA from a new vendor', runs: '/legal:triage-nda' },
      { say: 'Review this MSA against our playbook', runs: '/legal:review-contract' },
      { say: 'Check if our terms comply with GDPR', runs: '/legal:compliance-check' },
      { say: 'Brief me on the upcoming board meeting', runs: '/legal:meeting-briefing' },
      { say: 'Assess legal risk for this new partnership', runs: '/legal:legal-risk-assessment' },
      { say: 'Run a vendor check before we sign', runs: '/legal:vendor-check' },
    ],
    seeAlso: [
      { slug: 'finance', label: 'Finance', why: 'Contracts feed AP; close coordination on vendor onboarding.' },
      { slug: 'operations', label: 'Operations', why: 'Vendor management and compliance tracking.' },
      { slug: 'people', label: 'People', why: 'Employment law touches HR; compliance work crosses both.' },
    ],
  },

  // ─── OPERATIONS ─────────────────────────────────────────────────────────
  {
    slug: 'operations',
    name: 'Operations',
    tagline: 'Vendors, processes, change management, capacity planning, compliance tracking.',
    intro:
      "Ops touches everything: vendors, processes, compliance, capacity, change management. The work is mostly about institutionalizing repeat patterns: turning tribal knowledge into docs, ad-hoc evaluations into scoring matrices, and one-off rollouts into reusable plans. /operations:* is the systematization engine.",
    plugins: [
      { slug: 'operations', role: 'primary', why: 'Vendor evaluation, process docs, change management, capacity planning, compliance tracking.' },
      { slug: 'finance', role: 'companion', why: 'Vendor and procurement workflows touch AP.' },
      { slug: 'legal', role: 'companion', why: 'Contract review feeds vendor selection.' },
      { slug: 'human-resources', role: 'companion', why: 'Capacity planning ties to headcount and HR planning.' },
      { slug: 'productivity', role: 'companion', why: 'Cross-team coordination + meeting prep.' },
    ],
    connectors: ['(none required; many ops skills work from pasted context)'],
    workflows: [
      {
        title: 'Vendor evaluation',
        description: 'Generates a scoring matrix against your current stack. Considers integration, pricing, security, support.',
        prompt: '/operations:vendor-evaluation $vendor against current stack',
      },
      {
        title: 'Document a process',
        description: 'Turns a tribal workflow into a structured doc: trigger, steps, owner, escalation, edge cases.',
        prompt: '/operations:document-process for $recurring_workflow',
      },
      {
        title: 'Change management plan',
        description: 'Generates a rollout plan for a cross-team migration: comms, stages, rollback, success metrics.',
        prompt: '/operations:change-plan for the new SSO provider migration',
      },
      {
        title: 'Capacity planning',
        description: 'Reads current team data + projected work and surfaces headcount + utilization gaps for the next quarter.',
        prompt: '/operations:capacity quarterly headcount plan',
      },
      {
        title: 'Compliance tracker',
        description: 'Generates and maintains a control tracker for SOC 2, ISO 27001, or similar. Flags overdue items.',
        prompt: '/operations:compliance-tracker SOC 2 controls Q3',
      },
    ],
    tips: [
      { title: 'Document the tribal knowledge', body: "/operations:document-process is the fastest way to capture 'we should write this down' work that lives in people's heads." },
      { title: 'Vendor matrices > vibes', body: '/operations:vendor-evaluation generates a real scoring matrix. Beats the slide-of-bullet-points comparison every time.' },
      { title: 'Pair with /legal:* for vendors', body: 'During vendor selection, /operations:vendor-evaluation → /legal:contract-review covers selection and contracting in one flow.' },
      { title: 'Change plans before migrations', body: '/operations:change-plan is cheap; rollback plans you wrote ahead of time are priceless.' },
      { title: 'Tie capacity to /data', body: 'For honest capacity planning, ground in actual utilization. Pair /operations:capacity with /data:* queries on time tracking or work logs.' },
      { title: 'Compliance is incremental', body: '/operations:compliance-tracker monthly cadence keeps audit prep from being a fire drill.' },
    ],
    triggers: [
      { say: 'Pull together this week\'s cross-team status', runs: '/operations:status-report' },
      { say: 'Document the incident response runbook', runs: '/operations:runbook' },
      { say: 'Review this new vendor before we sign', runs: '/operations:vendor-review' },
      { say: 'Plan capacity for next quarter', runs: '/operations:capacity-plan' },
      { say: 'Assess the risks of moving to this new provider', runs: '/operations:risk-assessment' },
      { say: 'Optimize the way we ship hardware to new hires', runs: '/operations:process-optimization' },
    ],
    seeAlso: [
      { slug: 'finance', label: 'Finance', why: 'AP, procurement, and vendor lifecycle.' },
      { slug: 'legal', label: 'Legal', why: 'Contracts and compliance feed ops.' },
      { slug: 'people', label: 'People', why: 'Capacity planning + change management touch HR.' },
    ],
  },

  // ─── PEOPLE / HR ────────────────────────────────────────────────────────
  {
    slug: 'people',
    name: 'People',
    tagline: 'Recruiting, onboarding, performance, compensation, policy.',
    intro:
      'People ops is high-volume across recruiting, onboarding, performance reviews, comp, and policy work. Each one has a repeatable shape and a personalized layer. Pace handles the repeatable parts so you spend more time on the personalized ones. /human-resources:onboarding-plan personalizes a 30-day plan by role; saves hours per hire.',
    plugins: [
      { slug: 'human-resources', role: 'primary', why: 'Recruiting, onboarding, performance reviews, compensation analysis, policy lookup.' },
      { slug: 'productivity', role: 'companion', why: 'Manager workflows: 1:1 prep, calendar sanity, comms.' },
      { slug: 'enterprise-search', role: 'companion', why: 'Policy lookups and precedent across docs.' },
    ],
    connectors: ['Slack', 'Notion', 'Microsoft 365'],
    workflows: [
      {
        title: 'Job description',
        description: 'Writes a JD tied to your leveling and comp band. Reads existing JDs from the same family for consistency.',
        prompt: '/human-resources:job-description for senior backend engineer, band 3',
      },
      {
        title: 'Onboarding plan',
        description: 'Generates a personalized 30/60/90-day plan by role. Includes intros, reading list, first projects.',
        prompt: '/human-resources:onboarding-plan first 30 days for new $role',
      },
      {
        title: 'Performance review feedback',
        description: 'Consolidates 360-degree feedback into themes, surfaces patterns, drafts the review.',
        prompt: '/human-resources:review-feedback consolidate 360 inputs for $person',
      },
      {
        title: 'Compensation analysis',
        description: 'Compares a band against market data, flags compression risks, suggests adjustments.',
        prompt: '/human-resources:comp-analysis for band 3 engineering population',
      },
      {
        title: 'Policy lookup',
        description: 'Answers a policy question by reading the connected docs.',
        prompt: "/human-resources:policy-lookup what's our parental leave policy",
      },
    ],
    tips: [
      { title: 'Onboarding plans personalize', body: '/human-resources:onboarding-plan adapts by role. Hours saved per hire compound across teams.' },
      { title: 'Connect Notion early', body: 'Most policy lookups live in Notion. Connector first, then /policy-lookup actually finds answers.' },
      { title: 'Use review-feedback for patterns', body: 'Eyeballing 360s misses patterns; /human-resources:review-feedback surfaces them.' },
      { title: 'Comp analysis isn\'t a decision', body: 'Treat the output as a starting point for the comp conversation, not the answer.' },
      { title: 'Pair with /enterprise-search', body: 'For "did we already write something about X?" questions, /enterprise-search:* is faster than scrolling Slack.' },
      { title: 'JDs as a template family', body: "After three JDs for similar roles, build a /pace router command that wraps /human-resources:job-description with your leveling defaults." },
    ],
    triggers: [
      { say: 'Walk me through this week\'s recruiting funnel', runs: '/human-resources:recruiting-pipeline' },
      { say: 'Prep me to interview Jane for the staff role', runs: '/human-resources:interview-prep' },
      { say: 'Draft the offer letter for Jane at L5', runs: '/human-resources:draft-offer' },
      { say: 'Help me write Maria\'s performance review', runs: '/human-resources:performance-review' },
      { say: 'Plan headcount for the engineering org next quarter', runs: '/human-resources:org-planning' },
      { say: 'Look up our PTO policy for new parents', runs: '/human-resources:policy-lookup' },
    ],
    seeAlso: [
      { slug: 'operations', label: 'Operations', why: 'Capacity planning + headcount tie together.' },
      { slug: 'legal', label: 'Legal', why: 'Employment law touches HR daily.' },
      { slug: 'finance', label: 'Finance', why: 'Comp planning is finance-adjacent.' },
    ],
  },

  // ─── CUSTOMER SUPPORT ──────────────────────────────────────────────────
  {
    slug: 'customer-support',
    name: 'Customer Support',
    tagline: 'Triage, response drafts, escalations, customer context, knowledge base.',
    intro:
      'Support burns context every ticket. Pace remembers, drafts, and turns resolved tickets into knowledge so the next person hits the same issue faster. Connect Intercom or your help desk and /customer-support:* knows what is in the queue.',
    plugins: [
      { slug: 'customer-support', role: 'primary', why: 'Triage, response drafts, escalations, customer context, KB articles.' },
      { slug: 'sales', role: 'companion', why: 'Customer context for accounts with active deals.' },
      { slug: 'productivity', role: 'companion', why: 'Daily briefing and ticket-queue summarization.' },
    ],
    connectors: ['Slack', 'Intercom', 'HubSpot', 'Guru', 'Jira', 'Notion', 'Microsoft 365'],
    workflows: [
      {
        title: 'Triage the queue',
        description: 'Reads inbound tickets and sorts by urgency, theme, and routing. Surfaces ones that look like P1.',
        prompt: '/customer-support:triage Intercom queue from the last 24h',
      },
      {
        title: 'Draft a response',
        description: 'Generates a personalized response that matches your tone and includes the right help-center links.',
        prompt: '/customer-support:draft-response for ticket #1234',
      },
      {
        title: 'Escalate properly',
        description: 'Writes the escalation: clean repro steps, environment, severity, customer context, suggested owner.',
        prompt: '/customer-support:escalate ticket #1234 to engineering',
      },
      {
        title: 'Pull customer context',
        description: 'Aggregates account history, recent tickets, deal stage, NPS, and product usage into a quick brief.',
        prompt: '/customer-support:context for $customer_id',
      },
      {
        title: 'Generate a KB article',
        description: 'Turns a resolved ticket into a help-center article: problem statement, cause, resolution, related links.',
        prompt: '/customer-support:knowledge-base from resolved ticket #1234',
      },
    ],
    tips: [
      { title: 'Intercom connector first', body: 'Most support workflows hinge on Intercom (or your help desk). Connect it before anything else.' },
      { title: 'Resolved tickets are KB gold', body: '/customer-support:knowledge-base auto-converts. Run it after every interesting resolution; the next ticket finds the answer.' },
      { title: 'Escalations save dev time', body: '/customer-support:escalate writes proper repro steps. Engineering thanks you.' },
      { title: 'Stack with /sales for accounts', body: "For VIP accounts, /customer-support:context + /sales:* gives you the full deal + product-usage picture in one brief." },
      { title: 'Build /pace router for escalation paths', body: 'Your escalation lanes are unique to your team. Wrap /customer-support:escalate in /pace router commands for each lane.' },
      { title: 'Run triage at the start of every shift', body: '/customer-support:triage gives you a sorted queue + visibility to P1s that need air cover.' },
    ],
    triggers: [
      { say: 'Triage the support inbox', runs: '/customer-support:ticket-triage' },
      { say: 'Draft a response to this Intercom ticket', runs: '/customer-support:draft-response' },
      { say: 'Should I escalate this customer issue?', runs: '/customer-support:customer-escalation' },
      { say: 'Write a KB article for this common question', runs: '/customer-support:kb-article' },
      { say: 'Research what this customer\'s account looks like', runs: '/customer-support:customer-research' },
    ],
    seeAlso: [
      { slug: 'sales', label: 'Sales', why: 'Customer context flows from deal to account.' },
      { slug: 'product', label: 'Product', why: 'Support tickets feed product roadmap.' },
      { slug: 'productivity', label: 'Productivity', why: 'Productivity + enterprise-search for cross-cutting context.' },
    ],
  },

  // ─── PRODUCTIVITY (cross-cutting) ──────────────────────────────────────
  {
    slug: 'productivity',
    name: 'Productivity',
    tagline: 'Cross-cutting daily-flow plugins for every role.',
    intro:
      "Some plugins don't belong to a department; they help everyone. /productivity:* runs your morning. /enterprise-search:* finds the doc you swear you wrote. Install both regardless of role; they pair with whatever else you use.",
    plugins: [
      { slug: 'productivity', role: 'primary', why: 'Daily briefing, task management, memory of past decisions, calendar sanity.' },
      { slug: 'enterprise-search', role: 'primary', why: 'One query across email, Slack, docs, and wikis.' },
    ],
    connectors: ['Slack', 'Notion', 'Asana', 'Linear', 'Jira', 'Monday', 'ClickUp', 'Microsoft 365', 'Guru'],
    workflows: [
      {
        title: 'Start the day',
        description: 'Pulls calendar, Slack DMs, open Linear/Jira issues, replies waiting, and stack-ranks the day.',
        prompt: '/productivity:start',
      },
      {
        title: 'Async update',
        description: 'Summarizes what changed since yesterday across the tools you use. Posts as standup or async update.',
        prompt: '/productivity:update what changed in Linear since yesterday',
      },
      {
        title: 'Memory of past decisions',
        description: 'Recalls what your team decided about X last sprint, quarter, or year, across docs, Slack, and tickets.',
        prompt: '/productivity:memory remind me what we decided about pricing last sprint',
      },
      {
        title: 'Find something',
        description: 'One query across every connected tool. Better than scrolling Slack hoping to find that link.',
        prompt: '/enterprise-search:find Q3 launch retro',
      },
      {
        title: 'Task management',
        description: 'Cleans up your task list, surfaces stale items, suggests prioritization.',
        prompt: '/productivity:tasks for this week',
      },
    ],
    tips: [
      { title: '/productivity:start every morning', body: 'Replaces three tab-switches with one prompt. Habit-forming.' },
      { title: 'Memory compounds', body: 'The more you use /productivity:memory, the better it gets at finding past context.' },
      { title: 'Enterprise-search beats Slack search', body: 'Slack search is bad. /enterprise-search:find is the "where did we put X?" answer machine.' },
      { title: 'Connect Slack first', body: 'It unlocks the highest-volume tools. Authorize once; both /productivity:* and /enterprise-search:* benefit.' },
      { title: 'Combine with your role plugins', body: 'Sales people install /sales + /productivity. Engineers install /engineering + /productivity. The combos are where the leverage lives.' },
      { title: 'Async updates beat live standups', body: '/productivity:update for async standups frees the team from a daily live meeting.' },
    ],
    triggers: [
      { say: 'What\'s on my plate this week?', runs: '/productivity:task-management' },
      { say: 'Write my end-of-day update', runs: '/productivity:update' },
      { say: 'Pick up where I left off yesterday', runs: '/productivity:start' },
      { say: 'Remember that we decided X about Y', runs: '/productivity:memory-management' },
    ],
    seeAlso: [
      { slug: 'sales', label: 'Sales', why: 'Pace with /productivity:* + sales is the GTM stack.' },
      { slug: 'engineering', label: 'Engineering', why: 'Eng + productivity covers the day; engineering covers the work.' },
      { slug: 'product', label: 'Product', why: 'PMs cross-cut; productivity keeps the synthesis flowing.' },
    ],
  },
];

export function getTeamGuide(slug: string): TeamGuide | undefined {
  return TEAM_GUIDES.find((t) => t.slug === slug);
}
