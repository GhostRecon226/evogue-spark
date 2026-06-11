// USD price catalog for courses (front-end source of truth, matches course detail pages)
const SLUG_PRICES: Record<string, number> = {
  "project-management-business-analysis": 249,
  "product-management": 199,
  "data-analysis": 199,
  "cybersecurity": 199,
  "cyber-security": 199,
  "digital-marketing": 149,
  "scrum-master": 149,
  "ai-for-professionals": 149,
  "virtual-assistant-programme": 149,
};

const TITLE_PRICES: Record<string, number> = {
  "pm & business analysis": 249,
  "project management & business analysis": 249,
  "product management": 199,
  "data analysis": 199,
  "cybersecurity": 199,
  "cyber security": 199,
  "digital marketing": 149,
  "scrum master": 149,
  "ai for professionals": 149,
  "virtual assistant programme": 149,
  "virtual assistant": 149,
  "project management": 199,
};

export function getCoursePriceUSD(opts: { slug?: string | null; title?: string | null }): number {
  if (opts.slug && SLUG_PRICES[opts.slug] != null) return SLUG_PRICES[opts.slug];
  if (opts.title) {
    const key = opts.title.toLowerCase().trim();
    if (TITLE_PRICES[key] != null) return TITLE_PRICES[key];
  }
  return 0;
}

export function formatUSD(n: number): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}
