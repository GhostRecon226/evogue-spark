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
import { CourseLink, COURSE_SLUGS, type CourseSlug } from "./CourseLink";

function renderLink(slug: string) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const stub = (path: string) =>
    createRoute({ getParentRoute: () => rootRoute, path, component: () => null });

  const routes = [
    createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: () => <CourseLink slug={slug}>Go</CourseLink>,
    }),
    stub("/contact"),
    stub("/courses"),
    ...COURSE_SLUGS.map((s) => stub(`/courses/${s}`)),
  ];

  const router = createRouter({
    routeTree: rootRoute.addChildren(routes),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });

  return render(<RouterProvider router={router} />);
}

describe.each([
  { viewport: "desktop", width: 1280 },
  { viewport: "mobile", width: 390 },
])("CourseLink routing on $viewport", ({ width }) => {
  beforeEach(() => {
    cleanup();
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    window.dispatchEvent(new Event("resize"));
  });

  it.each(COURSE_SLUGS.map((slug) => ({ slug })))(
    "slug '$slug' routes to its dedicated /courses/$slug page",
    async ({ slug }: { slug: CourseSlug }) => {
      renderLink(slug);
      const anchor = (await screen.findByRole("link", { name: /go/i })) as HTMLAnchorElement;
      expect(anchor).toHaveAttribute("href", `/courses/${slug}`);
    },
  );

  it("unknown slug falls back to /courses, never the generic /courses/$slug template", async () => {
    renderLink("does-not-exist");
    const anchor = (await screen.findByRole("link", { name: /go/i })) as HTMLAnchorElement;
    expect(anchor).toHaveAttribute("href", "/courses");
  });
});
