import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/PublicShell";
import { Contact } from "@/components/landing/Contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Evogue Academy" },
      { name: "description", content: "Get in touch with the Evogue Academy team in Lagos, Nigeria." },
      { property: "og:title", content: "Contact — Evogue Academy" },
      { property: "og:description", content: "Get in touch with the Evogue Academy team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <PublicShell>
      <Contact />
      <section className="pb-20 -mt-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden shadow-soft border border-border">
            <iframe
              title="Evogue Academy location"
              src="https://www.google.com/maps?q=Lagos,Nigeria&output=embed"
              width="100%"
              height="380"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
