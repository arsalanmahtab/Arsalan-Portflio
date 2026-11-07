/**
 * Copy for the software home (/software), section by section (PROMPT.md section 9).
 * The stack groups and orbit are in data/stack.ts; the lobby in data/lobbyServices.ts.
 */

export const softwareHero = {
  kicker: "Arslan Mahtab, full stack software engineer",
  /** The first lines of the headline; the last line cycles through `rotatingWords`. */
  titleLines: ["Full stack", "& AI apps for"],
  rotatingWords: ["SaaS products.", "AI startups.", "dashboards.", "web apps."],
  highlight: "React · Laravel · Next.js · AI full stack",
  subtitle:
    "I build SaaS products, web apps and AI-powered tools end to end, from the database and APIs to a fast, polished front end.",
  primaryCta: { label: "See what I build", href: "#build" },
  secondaryCta: { label: "Start a project", href: "#contact" },
  editor: {
    label: "Animated code examples: a Next.js dashboard page, a Laravel API route group and an AI agent call",
    /** Each tab types its code, then its toast pops, then the next tab starts. */
    tabs: [
      {
        file: "app/page.tsx",
        toast: "Build passed. Deployed.",
        code: `export default async function Dashboard() {
  const stats = await getStats();
  return (
    <main className="grid gap-6">
      <RevenueChart data={stats.mrr} />
      <UsersTable users={stats.users} />
    </main>
  );
}`,
      },
      {
        file: "routes/api.php",
        toast: "API tests passed. 200 OK.",
        code: `Route::middleware('auth:sanctum')->group(function () {
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
});`,
      },
      {
        file: "ai/agent.ts",
        toast: "Agent ready. Streaming answers.",
        code: `const answer = await llm.chat({
  system: "You are a helpful support agent.",
  context: await vectorStore.search(question),
  messages: [{ role: "user", content: question }],
});
return stream(answer);`,
      },
    ],
    keywords: ["export", "default", "async", "function", "const", "await", "return", "use"],
    functions: ["Route", "getStats", "stream", "chat", "search", "group", "middleware"],
  },
  /**
   * Glass badges floating around the editor. Positions are percentages (left, top)
   * of the editor area: `desktop` beside the copy, `mobile` when stacked below it.
   */
  badges: [
    { label: "React", desktop: [-6, 6], mobile: [0, 1], delay: 0 },
    { label: "Next.js", desktop: [78, -4], mobile: [70, -2], delay: -1.2 },
    { label: "Laravel", desktop: [86, 46], mobile: [74, 46], delay: -2.4 },
    { label: "Node.js", desktop: [-10, 62], mobile: [0, 62], delay: -3.1 },
    { label: "AI agents", desktop: [60, 92], mobile: [56, 93], delay: -0.6, lime: true },
    { label: "TypeScript", desktop: [8, 94], mobile: [4, 94], delay: -1.8 },
  ] satisfies { label: string; desktop: [number, number]; mobile: [number, number]; delay: number; lime?: boolean }[],
};

export const aboutSection = {
  pill: "Meet the dev",
  title: ["Clean code.", { accent: "Calm delivery." }] as const,
  lead: "Behind every product is careful engineering. I write code that's easy to read, easy to change and ready to scale, and I keep you updated at every step.",
  values: [
    { title: "Senior-level code", text: "Typed, tested and documented." },
    { title: "Clear communication", text: "Regular updates, no surprises." },
    { title: "Built to scale", text: "Architecture that grows with your users." },
  ],
  /** The 3D developer android beside the values. Each greeting says the next line. */
  android: {
    label: "Animated 3D developer character. Press to say hi.",
    hint: "Tap me to say hi",
    lines: [
      "Hi! Let's build something great.",
      "Clean code, every time.",
      "Shipping your SaaS this sprint?",
      "React, Laravel or Next.js?",
      "AI agents? I've got you.",
      "Tests passed. Deploying.",
    ],
  },
};

export const stackSection = {
  pill: "Full stack",
  title: ["One engineer,", { accent: "the whole stack." }] as const,
  lead: "Front end, back end, database and AI. You work with one person who understands how every part fits together.",
};

export const buildSection = {
  title: ["What I ", { accent: "build." }] as const,
  cards: {
    fullStack: {
      title: "Full stack web apps",
      text: "React or Next.js on the front, Laravel or Node.js behind it, in one clean codebase.",
      demoLabel: "Data flowing from React to a Laravel API to MySQL",
      flow: ["React", "Laravel API", "MySQL"],
    },
    ai: {
      title: "AI full stack apps",
      text: "Chatbots, AI agents and RAG search that answer from your own data.",
      demoLabel: "An AI assistant summarising a contract, word by word",
      question: "Summarise this contract",
      answer:
        "It's a 12-month service contract. Key points: monthly billing, 30-day notice to cancel, and no auto-renewal.",
    },
    saas: {
      title: "Next.js SaaS products",
      text: "Auth, subscriptions, dashboards and teams, built to grow with your users.",
      demoLabel: "A monthly recurring revenue chart rising",
      chartLabel: "MRR",
    },
    apis: {
      title: "APIs and integrations",
      text: "REST APIs, payments, webhooks and third-party integrations that just work.",
      demoLabel: "API endpoints answering with success codes",
      endpoints: [
        { request: "GET /api/users", status: "200" },
        { request: "POST /api/orders", status: "201" },
        { request: "POST /webhooks/stripe", status: "200" },
      ],
    },
  },
};

export const aiSection = {
  pill: "AI full stack",
  title: ["AI apps,", { accent: "end to end." }] as const,
  lead: "From your documents to a working AI feature: I build the data pipeline, the back end and the interface your users see.",
  pipelineLabel: "AI pipeline",
  pipeline: [
    { title: "Your data", text: "Docs, products, tickets" },
    { title: "Embeddings", text: "Turn text into vectors" },
    { title: "Vector DB", text: "Find what matters" },
    { title: "LLM", text: "Reason and write" },
    { title: "Answer", text: "In your app" },
  ],
  terminal: {
    file: "agent.log",
    label: "Example agent log: the agent finds order 1042, checks the refund policy, issues the refund and emails the customer, done in 2.4 seconds",
    lines: [
      '> agent.run("Refund order #1042")',
      "  ✓ found order #1042",
      "  ✓ checked refund policy",
      "  ✓ refund issued",
      "  ✓ emailed the customer",
      "> done in 2.4s",
    ],
  },
};

export const saasSection = {
  title: ["Next.js SaaS,", { accent: "idea to launch." }] as const,
  steps: [
    { title: "Plan", text: "Features, users and the simplest version worth launching." },
    { title: "Design", text: "Clean screens your users understand at first glance." },
    { title: "Build", text: "Next.js, APIs, database, auth and billing." },
    { title: "Launch", text: "Deployed, tested and monitored." },
    { title: "Scale", text: "New features as your users grow." },
  ],
  dashboard: {
    label: "Example SaaS dashboard: 12,480 users, $48,200 monthly recurring revenue, 99.9% uptime, and a rising weekly chart",
    kpis: [
      { label: "Users", value: 12480 },
      { label: "MRR", value: 48200, prefix: "$" },
      { label: "Uptime", value: 99.9, suffix: "%", decimals: 1 },
    ],
    /** Bar heights in percent, left to right. */
    bars: [40, 55, 48, 70, 62, 84, 92],
    note: "Example dashboard design.",
  },
};

/** Placeholder projects: replace the [bracketed] text with real ones. */
export const projectsSection = {
  title: ["Software ", { accent: "projects." }] as const,
  tagsLabel: "Built with",
  projects: [
    {
      name: "[Project name]",
      title: "[SaaS project]",
      description: "[What it does and who it's for]",
      tags: ["Next.js", "Laravel", "MySQL"],
      gradient: "linear-gradient(135deg, #5440EE, #8A7CFF)",
    },
    {
      name: "[Project name]",
      title: "[AI app]",
      description: "[What it does and who it's for]",
      tags: ["React", "Node.js", "AI agents"],
      gradient: "linear-gradient(135deg, #1F7A5C, #47C79A)",
    },
    {
      name: "[Project name]",
      title: "[Web app or dashboard]",
      description: "[What it does and who it's for]",
      tags: ["React", "Laravel", "REST API"],
      gradient: "linear-gradient(135deg, #C2611F, #F2A04E)",
    },
  ],
};
