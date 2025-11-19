"use client";

import { useState } from "react";
import clsx from "clsx";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar";
import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  Cog,
  Database,
  HardDrive,
  History,
  Keyboard,
  Laptop,
  Lock,
  MapPin,
  Moon,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react";

type GeneralSettings = {
  workspaceName: string;
  workspaceTagline: string;
  supportEmail: string;
  supportPhone: string;
  timezone: string;
  locale: string;
  currency: string;
  releaseChannel: string;
  inventoryPrefix: string;
};

type ToggleKey =
  | "adaptiveTheme"
  | "compactSidebar"
  | "contextualHelp"
  | "keyboardShortcuts"
  | "enforceMfa"
  | "sessionTimeout"
  | "deviceAlerts"
  | "ipAllowlist"
  | "autoBackups"
  | "exportSnapshots"
  | "sandboxSafety";

type ToggleState = Record<ToggleKey, boolean>;

type ToggleOption = {
  key: ToggleKey;
  title: string;
  description: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  workspaceName: "Dream Team Inventory",
  workspaceTagline: "Operational source of truth for every item",
  supportEmail: "operations@dreamteam.com",
  supportPhone: "+66 2 123 4567",
  timezone: "Asia/Bangkok (GMT+7)",
  locale: "English (Thailand)",
  currency: "THB — Thai Baht",
  releaseChannel: "Stable",
  inventoryPrefix: "INV-",
};

const DEFAULT_TOGGLE_STATE: ToggleState = {
  adaptiveTheme: true,
  compactSidebar: false,
  contextualHelp: true,
  keyboardShortcuts: true,
  enforceMfa: true,
  sessionTimeout: true,
  deviceAlerts: true,
  ipAllowlist: false,
  autoBackups: true,
  exportSnapshots: false,
  sandboxSafety: true,
};

const TIMEZONE_OPTIONS = [
  "Asia/Bangkok (GMT+7)",
  "Asia/Singapore (GMT+8)",
  "UTC",
  "America/New_York (GMT-5)",
];

const LOCALE_OPTIONS = [
  "English (Thailand)",
  "English (International)",
  "ไทย (Thai)",
  "日本語 (Japanese)",
];

const CURRENCY_OPTIONS = [
  "THB — Thai Baht",
  "USD — US Dollar",
  "EUR — Euro",
  "JPY — Japanese Yen",
];

const RELEASE_CHANNEL_OPTIONS = ["Stable", "Preview", "Insider"];

const INTERFACE_OPTIONS: ToggleOption[] = [
  {
    key: "adaptiveTheme",
    title: "Adaptive theming",
    description: "Match interface colours with the user's device preference.",
    icon: Moon,
    iconBg: "bg-secondary-color-soft",
    iconColor: "text-secondary-color",
  },
  {
    key: "compactSidebar",
    title: "Compact navigation",
    description: "Collapse sidebar labels on smaller breakpoints automatically.",
    icon: Laptop,
    iconBg: "bg-neutral-color",
    iconColor: "text-primary-color",
  },
  {
    key: "contextualHelp",
    title: "Contextual guides",
    description: "Surface quick tips for new workflows and fresh releases.",
    icon: Sparkles,
    iconBg: "bg-warning-color-soft",
    iconColor: "text-warning-color",
  },
  {
    key: "keyboardShortcuts",
    title: "Keyboard shortcuts",
    description: "Keep power user shortcuts active across the workspace.",
    icon: Keyboard,
    iconBg: "bg-success-color-soft",
    iconColor: "text-success-color",
  },
];

const SECURITY_OPTIONS: ToggleOption[] = [
  {
    key: "enforceMfa",
    title: "Enforce multi-factor",
    description: "Require an authenticator prompt for every administrator login.",
    icon: ShieldCheck,
    iconBg: "bg-danger-color-soft",
    iconColor: "text-danger-color",
  },
  {
    key: "sessionTimeout",
    title: "Session timeout alerts",
    description: "Warn admins after 20 minutes of inactivity before signing out.",
    icon: Timer,
    iconBg: "bg-secondary-color-soft",
    iconColor: "text-secondary-color",
  },
  {
    key: "deviceAlerts",
    title: "New device alerts",
    description: "Notify the security email when accounts sign in from new devices.",
    icon: Laptop,
    iconBg: "bg-slate-200",
    iconColor: "text-primary-color-muted",
  },
  {
    key: "ipAllowlist",
    title: "Restrict admin tools",
    description: "Limit configuration pages to the organisation IP allowlist.",
    icon: MapPin,
    iconBg: "bg-warning-color-soft",
    iconColor: "text-warning-color",
  },
];

const DATA_OPTIONS: ToggleOption[] = [
  {
    key: "autoBackups",
    title: "Nightly backups",
    description: "Archive critical inventory data to the configured object storage.",
    icon: Cloud,
    iconBg: "bg-secondary-color-soft",
    iconColor: "text-secondary-color",
  },
  {
    key: "exportSnapshots",
    title: "Monthly exports",
    description: "Send a CSV snapshot to finance on the first business day.",
    icon: History,
    iconBg: "bg-neutral-color",
    iconColor: "text-primary-color",
  },
  {
    key: "sandboxSafety",
    title: "Sandbox safeguards",
    description: "Block destructive actions from non-production environments.",
    icon: Lock,
    iconBg: "bg-danger-color-soft",
    iconColor: "text-danger-color",
  },
];

function createDefaultGeneralSettings(): GeneralSettings {
  return { ...DEFAULT_GENERAL_SETTINGS };
}

function createDefaultToggleState(): ToggleState {
  return { ...DEFAULT_TOGGLE_STATE };
}

function SwitchVisual({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={clsx(
        "relative inline-flex h-6 w-11 items-center rounded-full transition",
        enabled ? "bg-secondary-color" : "bg-slate-200"
      )}
    >
      <span
        className={clsx(
          "h-5 w-5 transform rounded-full bg-white shadow transition",
          enabled ? "translate-x-5" : "translate-x-1"
        )}
      />
    </span>
  );
}

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(
    createDefaultGeneralSettings
  );
  const [toggles, setToggles] = useState<ToggleState>(
    createDefaultToggleState
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  const updateGeneralSetting = (
    key: keyof GeneralSettings,
    value: string
  ) => {
    setGeneralSettings((prev) => ({ ...prev, [key]: value }));
    markAsChanged();
  };

  const toggleSetting = (key: ToggleKey) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    markAsChanged();
  };

  const handleSave = () => {
    if (!hasUnsavedChanges) {
      return;
    }
    const now = new Date();
    const formatted = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);
    setLastSavedAt(formatted);
    setHasUnsavedChanges(false);
  };

  const handleReset = () => {
    setGeneralSettings(createDefaultGeneralSettings());
    setToggles(createDefaultToggleState());
    setLastSavedAt(null);
    setHasUnsavedChanges(true);
  };

  const interfaceEnabled = INTERFACE_OPTIONS.filter(
    (option) => toggles[option.key]
  ).length;
  const securityEnabled = SECURITY_OPTIONS.filter(
    (option) => toggles[option.key]
  ).length;
  const dataEnabled = DATA_OPTIONS.filter(
    (option) => toggles[option.key]
  ).length;

  return (
    <div className="flex flex-col gap-8 px-6 py-6 sm:px-8 lg:px-12 lg:py-10">
      <DashboardToolbar />

      <div>
        <h1 className="text-3xl font-semibold text-slate-900">
          Application settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Control workspace defaults, guardrails, and data protections for the
          inventory platform.
        </p>
      </div>

      <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-color-soft">
            <Cog className="h-6 w-6 text-secondary-color" />
          </span>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-900">
              Global configuration
            </p>
            <p className="text-sm text-slate-500">
              These changes apply across every module and signed in user.
            </p>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary-color-soft px-3 py-1 text-xs font-semibold text-secondary-color">
              <ShieldCheck className="h-3.5 w-3.5" />
              {[
                interfaceEnabled,
                securityEnabled,
                dataEnabled,
              ].reduce((sum, count) => sum + count, 0)}{" "}
              active safeguards
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Status:</span>{" "}
            {hasUnsavedChanges ? (
              <span className="text-warning-color">Unsaved changes</span>
            ) : lastSavedAt ? (
              <span>Saved {lastSavedAt}</span>
            ) : (
              <span>Not saved yet</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset defaults
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className={clsx(
                "inline-flex items-center gap-2 rounded-full bg-secondary-color px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90",
                !hasUnsavedChanges && "cursor-not-allowed opacity-50"
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              Save updates
            </button>
          </div>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Workspace identity
                </h2>
                <p className="text-sm text-slate-500">
                  Update the name, language, and communication defaults shared
                  with your organisation.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 self-start rounded-full bg-neutral-color px-3 py-1 text-xs font-semibold text-primary-color">
                <Database className="h-3.5 w-3.5" />
                Org wide
              </span>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Workspace name
                <input
                  type="text"
                  value={generalSettings.workspaceName}
                  onChange={(event) =>
                    updateGeneralSetting("workspaceName", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
                  placeholder="Inventory workspace name"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Tagline
                <input
                  type="text"
                  value={generalSettings.workspaceTagline}
                  onChange={(event) =>
                    updateGeneralSetting("workspaceTagline", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
                  placeholder="Short description"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Support email
                <input
                  type="email"
                  value={generalSettings.supportEmail}
                  onChange={(event) =>
                    updateGeneralSetting("supportEmail", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
                  placeholder="help@company.com"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Support phone
                <input
                  type="tel"
                  value={generalSettings.supportPhone}
                  onChange={(event) =>
                    updateGeneralSetting("supportPhone", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
                  placeholder="+66 2 000 0000"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Timezone
                <select
                  value={generalSettings.timezone}
                  onChange={(event) =>
                    updateGeneralSetting("timezone", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
                >
                  {TIMEZONE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Default language
                <select
                  value={generalSettings.locale}
                  onChange={(event) =>
                    updateGeneralSetting("locale", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
                >
                  {LOCALE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Currency
                <select
                  value={generalSettings.currency}
                  onChange={(event) =>
                    updateGeneralSetting("currency", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
                >
                  {CURRENCY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Release channel
                <select
                  value={generalSettings.releaseChannel}
                  onChange={(event) =>
                    updateGeneralSetting("releaseChannel", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
                >
                  {RELEASE_CHANNEL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Inventory code prefix
                <input
                  type="text"
                  value={generalSettings.inventoryPrefix}
                  onChange={(event) =>
                    updateGeneralSetting("inventoryPrefix", event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
                  placeholder="INV-"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Interface preferences
                </h2>
                <p className="text-sm text-slate-500">
                  Personalise how the platform feels for everyone by default.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 self-start rounded-full bg-secondary-color-soft px-3 py-1 text-xs font-semibold text-secondary-color">
                <Sparkles className="h-3.5 w-3.5" />
                {interfaceEnabled} enabled
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {INTERFACE_OPTIONS.map((option) => {
                const enabled = toggles[option.key];
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => toggleSetting(option.key)}
                    className="flex w-full items-start justify-between gap-4 rounded-xl border border-slate-200 px-5 py-4 text-left transition hover:border-secondary-color hover:bg-secondary-color-soft/40 focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
                  >
                    <span className="flex items-start gap-4">
                      <span
                        className={clsx(
                          "mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl",
                          option.iconBg
                        )}
                      >
                        <option.icon
                          className={clsx("h-5 w-5", option.iconColor)}
                        />
                      </span>
                      <span className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-slate-900">
                          {option.title}
                        </span>
                        <span className="text-sm text-slate-500">
                          {option.description}
                        </span>
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span
                        className={clsx(
                          "text-xs font-medium uppercase tracking-wide",
                          enabled ? "text-secondary-color" : "text-slate-400"
                        )}
                      >
                        {enabled ? "On" : "Off"}
                      </span>
                      <SwitchVisual enabled={enabled} />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Security controls
                </h2>
                <p className="text-sm text-slate-500">
                  Guard sensitive modules and require extra verification when
                  needed.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 self-start rounded-full bg-danger-color-soft px-3 py-1 text-xs font-semibold text-danger-color">
                <ShieldCheck className="h-3.5 w-3.5" />
                {securityEnabled} enforced
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {SECURITY_OPTIONS.map((option) => {
                const enabled = toggles[option.key];
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => toggleSetting(option.key)}
                    className="flex w-full items-start justify-between gap-4 rounded-xl border border-slate-200 px-5 py-4 text-left transition hover:border-secondary-color hover:bg-secondary-color-soft/40 focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
                  >
                    <span className="flex items-start gap-4">
                      <span
                        className={clsx(
                          "mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl",
                          option.iconBg
                        )}
                      >
                        <option.icon
                          className={clsx("h-5 w-5", option.iconColor)}
                        />
                      </span>
                      <span className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-slate-900">
                          {option.title}
                        </span>
                        <span className="text-sm text-slate-500">
                          {option.description}
                        </span>
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span
                        className={clsx(
                          "text-xs font-medium uppercase tracking-wide",
                          enabled ? "text-secondary-color" : "text-slate-400"
                        )}
                      >
                        {enabled ? "On" : "Off"}
                      </span>
                      <SwitchVisual enabled={enabled} />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Data & backups
              </h2>
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary-color-soft px-3 py-1 text-xs font-semibold text-secondary-color">
                <Cloud className="h-3.5 w-3.5" />
                {dataEnabled} enabled
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Define how records move between production, finance, and archival
              systems.
            </p>
            <div className="mt-6 space-y-4">
              {DATA_OPTIONS.map((option) => {
                const enabled = toggles[option.key];
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => toggleSetting(option.key)}
                    className="flex w-full items-start justify-between gap-4 rounded-xl border border-slate-200 px-5 py-4 text-left transition hover:border-secondary-color hover:bg-secondary-color-soft/40 focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
                  >
                    <span className="flex items-start gap-4">
                      <span
                        className={clsx(
                          "mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl",
                          option.iconBg
                        )}
                      >
                        <option.icon
                          className={clsx("h-5 w-5", option.iconColor)}
                        />
                      </span>
                      <span className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-slate-900">
                          {option.title}
                        </span>
                        <span className="text-sm text-slate-500">
                          {option.description}
                        </span>
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span
                        className={clsx(
                          "text-xs font-medium uppercase tracking-wide",
                          enabled ? "text-secondary-color" : "text-slate-400"
                        )}
                      >
                        {enabled ? "On" : "Off"}
                      </span>
                      <SwitchVisual enabled={enabled} />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-color-soft">
                <HardDrive className="h-5 w-5 text-secondary-color" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Environment overview
                </h2>
                <p className="text-sm text-slate-500">
                  Monitor the current release footprint and escalation contacts.
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span className="font-medium text-slate-700">
                  Release channel
                </span>
                <span className="text-slate-500">
                  {generalSettings.releaseChannel}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span className="font-medium text-slate-700">
                  Default timezone
                </span>
                <span className="text-slate-500">
                  {generalSettings.timezone}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span className="font-medium text-slate-700">
                  Support channel
                </span>
                <span className="text-slate-500">
                  {generalSettings.supportEmail}
                </span>
              </div>
              <div className="rounded-xl border border-secondary-color-soft bg-secondary-color-soft/40 px-4 py-3 text-xs text-secondary-color">
                Tip: keep one release ahead in staging to trial new automation
                before enabling for your operators.
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Audit highlights
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Track the most recent changes made inside the settings workspace.
            </p>
            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <ShieldCheck className="h-4 w-4 text-secondary-color" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    MFA enforcement
                  </p>
                  <p className="text-xs text-slate-500">
                    Enabled by Security Ops on 12 Dec, 14:20 ICT
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <History className="h-4 w-4 text-secondary-color" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Nightly backups
                  </p>
                  <p className="text-xs text-slate-500">
                    Verified last successful export 2 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <Lock className="h-4 w-4 text-secondary-color" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Admin IP allowlist
                  </p>
                  <p className="text-xs text-slate-500">
                    Pending review — recommended before next release
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
