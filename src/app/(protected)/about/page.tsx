import DashboardToolbar from "@/components/dashboard/DashboardToolbar";
import {
  Briefcase,
  Compass,
  Globe2,
  HeartHandshake,
  Leaf,
  Users2,
} from "lucide-react";

const CORE_VALUES = [
  {
    id: "mission",
    title: "Mission",
    description:
      "Equip operations teams with connected, real-time inventory insights so they can move faster, waste less, and stay aligned with demand.",
    icon: Compass,
  },
  {
    id: "vision",
    title: "Vision",
    description:
      "Be the trusted operating layer that unifies procurement, warehousing, and sales for teams across retail, manufacturing, and service industries.",
    icon: Globe2,
  },
  {
    id: "impact",
    title: "Impact",
    description:
      "Customers have cut manual reconciliations in half and reduced overstocking costs by up to 35% with smarter replenishment signals.",
    icon: HeartHandshake,
  },
];

const HIGHLIGHTS = [
  { id: "customers", value: "120+", label: "Operations teams onboarded" },
  { id: "items", value: "82K", label: "Active SKUs monitored" },
  { id: "uptime", value: "99.9%", label: "Platform uptime this year" },
  { id: "regions", value: "6", label: "Regions supported" },
];

const LEADERSHIP = [
  {
    name: "R. Nantapong ",
    title: "Co-founder & CEO",
    bio: "Scaled omni-channel fulfilment for a leading retail group, blending analytics and frontline coaching to modernise inventory control.",
  },
  {
    name: "S. Kritsakorn",
    title: "Head of Product",
    bio: "Builds human-centred tooling for warehouse and storefront teams. Advocates for transparent data storytelling and actionable workflows.",
  },
  {
    name: "T. Teamangkorn",
    title: "Director of Partnerships",
    bio: "Brings suppliers, distributors, and ERP providers together to create resilient supply chains with smooth systems integrations.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex-1 bg-neutral-color/60 p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <DashboardToolbar />

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition sm:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary-color-soft px-4 py-1 text-sm font-semibold uppercase tracking-wide text-secondary-color">
                About us
              </span>
              <h1 className="text-3xl font-semibold text-primary-color sm:text-4xl">
                Building the operating system for modern inventory teams.
              </h1>
              <p className="text-base text-primary-color-muted">
                Dream Team Inventory helps warehouses, storefronts, field crews, and
                service providers keep every SKU accurate and accessible. We blend
                deep operations experience with thoughtful technology so teams can
                anticipate demand, respond to disruptions, and delight customers.
              </p>
            </div>
            <div className="rounded-2xl border border-secondary-color-soft bg-secondary-color-soft/50 p-4 text-sm text-primary-color-muted lg:w-80">
              <div className="flex items-center gap-3">
                <Leaf className="h-5 w-5 text-secondary-color" />
                <p className="font-semibold text-primary-color">
                  Resilience pledge
                </p>
              </div>
              <p className="mt-3">
                We reinvest part of every subscription into programmes that reduce
                inventory waste, optimise last-mile logistics, and improve supplier
                collaboration across the region.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map((highlight) => (
              <div
                key={highlight.id}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm transition hover:border-secondary-color-soft hover:shadow-lg dark:bg-slate-900"
              >
                <p className="text-3xl font-semibold text-primary-color">
                  {highlight.value}
                </p>
                <p className="mt-2 text-sm text-primary-color-muted">
                  {highlight.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition sm:p-8">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-secondary-color" />
              <h2 className="text-lg font-semibold text-primary-color">
                How we partner
              </h2>
            </div>
            <p className="mt-3 text-sm text-primary-color-muted">
              Every engagement starts with a co-design sprint alongside
              warehouse managers, procurement leads, and frontline operators. From there we:
            </p>
            <ul className="mt-5 space-y-3 text-sm text-primary-color-muted">
              <li className="rounded-xl border border-secondary-color-soft bg-secondary-color-soft/40 px-4 py-3">
                Map end-to-end inventory flows—covering inbound, storage, and sales—to pinpoint automation opportunities.
              </li>
              <li className="rounded-xl border border-secondary-color-soft bg-secondary-color-soft/40 px-4 py-3">
                Integrate live demand signals, supplier updates, and point-of-sale data into one command centre.
              </li>
              <li className="rounded-xl border border-secondary-color-soft bg-secondary-color-soft/40 px-4 py-3">
                Train cross-functional teams and embed shared KPIs that reinforce adoption and continuous improvement.
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition sm:p-8">
            <div className="flex items-center gap-3">
              <Users2 className="h-5 w-5 text-secondary-color" />
              <h2 className="text-lg font-semibold text-primary-color">
                Our values
              </h2>
            </div>
            <div className="mt-6 grid gap-4">
              {CORE_VALUES.map((value) => (
                <div
                  key={value.id}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-secondary-color-soft hover:shadow-lg dark:bg-slate-900"
                >
                  <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-color-soft text-secondary-color dark:bg-slate-800">
                    <value.icon className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-primary-color">
                      {value.title}
                    </p>
                    <p className="text-sm leading-relaxed text-primary-color-muted">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-secondary-color">
                Leadership
              </p>
              <h2 className="text-2xl font-semibold text-primary-color">
                Meet the team guiding our roadmap.
              </h2>
            </div>
            <p className="text-sm text-primary-color-muted sm:max-w-md">
              We combine supply chain operations, enterprise software, and partnership
              strategy to continuously raise the bar for connected inventory management.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {LEADERSHIP.map((leader) => (
              <article
                key={leader.name}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-secondary-color-soft hover:shadow-lg dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-lg font-semibold text-primary-color">
                    {leader.name}
                  </h3>
                  <p className="text-sm text-primary-color-muted">
                    {leader.title}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-primary-color-muted">
                  {leader.bio}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
