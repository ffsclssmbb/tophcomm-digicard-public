/** Commercial Readiness Level (CRL) tracking for DigiCard. */

export type ReadinessState =
  | "not_started"
  | "in_progress"
  | "code_ready"
  | "external_required"
  | "complete";

export type ReadinessStep = {
  id: string;
  n: number;
  title: string;
  description: string;
  owner: "product" | "ops" | "legal" | "finance" | "external";
  state: ReadinessState;
  evidence: string[];
  blockers: string[];
  nextActions: string[];
};

export type CommercialReadinessReport = {
  product: string;
  version: string;
  build: string;
  assessedAt: string;
  overallLevel: string;
  overallScore: number;
  summary: string;
  steps: ReadinessStep[];
  remainingExternal: string[];
};

export const COMMERCIAL_ROADMAP: ReadinessStep[] = [
  {
    id: "payment_rails",
    n: 1,
    title: "Payment rails readiness",
    description: "Sandbox + live feature flags, refund path, PCI checklist. Live keys off until merchant eligibility.",
    owner: "ops",
    state: "code_ready",
    evidence: ["payments.sandbox / payments.live flags", "createOrder + sandboxSettle", "refundOrder for billing operators"],
    blockers: ["Merchant onboarding", "PCI SAQ", "Production webhooks"],
    nextActions: ["Complete merchant application", "Enable payments.live after SAQ + test charges"],
  },
  {
    id: "legal_package",
    n: 2,
    title: "Legal & privacy package",
    description: "Terms, Privacy, Cookies templates and IP checklist in-product. Counsel review remains external.",
    owner: "legal",
    state: "code_ready",
    evidence: ["/legal page", "acceptPolicies timestamps", "Field-level sharing policies"],
    blockers: ["Counsel redline", "Trademark confirmation"],
    nextActions: ["Send templates to counsel", "Publish final policies"],
  },
  {
    id: "pilot_traction",
    n: 3,
    title: "Pilot & early revenue",
    description: "Controlled pilot cohort with conversion and retention metrics.",
    owner: "product",
    state: "in_progress",
    evidence: ["Five-milestone journey", "Analytics + support tickets", "Finance console"],
    blockers: ["Real pilot cohort", "Support SLA"],
    nextActions: ["Onboard 20–50 pilot users", "Feed actuals into finance model"],
  },
  {
    id: "operational_readiness",
    n: 4,
    title: "Operational readiness",
    description: "Status page, console, refund playbooks, operator roles.",
    owner: "ops",
    state: "code_ready",
    evidence: ["/status", "Console snapshot", "Commercial playbooks in /docs"],
    blockers: ["Production APM", "Email provider", "On-call rota"],
    nextActions: ["Wire production email", "Enable error tracking"],
  },
  {
    id: "evidence_pack",
    n: 5,
    title: "Commercial readiness evidence pack",
    description: "Dossier + in-app CRL page.",
    owner: "finance",
    state: "complete",
    evidence: ["/commercial-readiness", "docs/COMMERCIAL_READINESS_DOSSIER.md"],
    blockers: [],
    nextActions: ["Refresh after pilot actuals"],
  },
];

export function scoreReadiness(steps: ReadinessStep[]): number {
  const weights: Record<ReadinessState, number> = {
    not_started: 0,
    in_progress: 0.35,
    code_ready: 0.7,
    external_required: 0.55,
    complete: 1,
  };
  if (!steps.length) return 0;
  const sum = steps.reduce((acc, s) => acc + (weights[s.state] ?? 0), 0);
  return Math.round((sum / steps.length) * 100);
}

export function overallLevel(score: number): string {
  if (score >= 90) return "CRL 5 — Commercial traction";
  if (score >= 75) return "CRL 4 — Market & model validated";
  if (score >= 55) return "CRL 3.5 — Early commercial prototype / pre-revenue MVP";
  if (score >= 40) return "CRL 3 — Value proposition articulated";
  if (score >= 20) return "CRL 2 — Application exploration";
  return "CRL 1 — Research / idea";
}

export function buildReport(meta: {
  product: string;
  version: string;
  build: string;
  assessedAt?: string;
}): CommercialReadinessReport {
  const steps = COMMERCIAL_ROADMAP;
  const overallScore = scoreReadiness(steps);
  return {
    product: meta.product,
    version: meta.version,
    build: meta.build,
    assessedAt: meta.assessedAt ?? new Date().toISOString(),
    overallLevel: overallLevel(overallScore),
    overallScore,
    summary:
      "DigiCard v1 is feature-complete with sandbox payments, legal templates, and a documented commercial roadmap. Code-ready for pilots; live revenue needs external merchant, counsel, and pilot execution.",
    steps,
    remainingExternal: steps.flatMap((s) => s.blockers),
  };
}
