import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { CardCta, type CourseCardLink } from "./CardCta";

/**
 * Build a tiny in-memory router that registers every path CardCta links to.
 * Mounting CardCta inside RouterProvider exercises TanStack Router's real
 * link-resolution pipeline — the exact thing that regressed previously.
 */
function renderCta(card: CourseCardLink) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const stub = (path: string) =>
    createRoute({ getParentRoute: () => rootRoute, path, component: () => null });

  const routes = [
    createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: () => <CardCta card={card} />,
    }),
    stub("/contact"),
    stub("/courses"),
    stub("/courses/scrum-master"),
    stub("/courses/digital-marketing"),
    stub("/courses/product-management"),
    stub("/courses/ai-for-professionals"),
    stub("/courses/data-analysis"),
  ];

  const router = createRouter({
    routeTree: rootRoute.addChildren(routes),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });

  return render(<RouterProvider router={router} />);
}

const liveCases: Array<{ slug: CourseCardLink["slug"]; expected: string }> = [
  { slug: "scrum-master", expected: "/courses/scrum-master" },
  { slug: "digital-marketing", expected: "/courses/digital-marketing" },
  { slug: "product-management", expected: "/courses/product-management" },
  { slug: "ai-for-professionals", expected: "/courses/ai-for-professionals" },
  { slug: "data-analysis", expected: "/courses/data-analysis" },
];

const soonCases: Array<{ slug: string }> = [
  { slug: "cybersecurity" },
  { slug: "virtual-assistant-programme" },
];

async function findCtaAnchor(name: RegExp) {
  // RouterProvider mounts asynchronously; findBy* waits for it.
  return (await screen.findByRole("link", { name })) as HTMLAnchorElement;
}

describe.each([
  { viewport: "desktop", width: 1280 },
  { viewport: "mobile", width: 390 },
])("CardCta routing on $viewport", ({ width }) => {
  beforeEach(() => {
    cleanup();
    // Simulate the viewport. Routing doesn't branch on width, but this
    // documents that the same link resolution holds across form factors.
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    window.dispatchEvent(new Event("resize"));
  });

  it.each(liveCases)(
    "live card '$slug' → View Details routes to $expected",
    async ({ slug, expected }) => {
      renderCta({ slug, status: "live" });
      const anchor = await findCtaAnchor(/view details/i);
      expect(anchor).toHaveAttribute("href", expected);
    },
  );

  it.each(soonCases)(
    "soon card '$slug' → Join Waitlist routes to /contact",
    async ({ slug }) => {
      renderCta({ slug, status: "soon" });
      const anchor = await findCtaAnchor(/join waitlist/i);
      expect(anchor).toHaveAttribute("href", "/contact");
    },
  );
});
