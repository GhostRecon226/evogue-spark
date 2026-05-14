import { Instagram, Twitter, Linkedin, Youtube } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

const cols = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", to: "/" as const },
      { label: "Courses", to: "/courses" as const },
      { label: "About", to: "/about" as const },
      { label: "Scholarship", to: "/scholarship" as const },
      { label: "Blog", to: "/blog" as const },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", to: "/contact" as const },
      { label: "Login", to: "/login" as const },
      { label: "FAQ", to: "/faq" as const },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-forest text-mint/85">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo variant="light" />
            <p className="mt-4 text-sm leading-relaxed text-mint/65 max-w-xs">
              Africa's most visionary product design and tech academy.
              Train. Build. Launch your career.
            </p>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="font-display font-bold text-mint">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm hover:text-mint transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-display font-bold text-mint">Contact</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="mailto:hello@evogueacademy.com" className="hover:text-mint">hello@evogueacademy.com</a>
              </li>
              <li>
                <a href="tel:+2348000000000" className="hover:text-mint">+234 800 000 0000</a>
              </li>
              <li className="text-mint/60">Lagos, Nigeria</li>
            </ul>
            <div className="mt-5 flex gap-2">
              {[Instagram, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="grid h-9 w-9 place-items-center rounded-full bg-mint/10 hover:bg-mint hover:text-forest transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-mint/15 text-center text-xs text-mint/55">
          © 2025 Evogue Academy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
