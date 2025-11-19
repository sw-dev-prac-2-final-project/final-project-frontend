"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar";
import { apiFetch } from "@/lib/api/client";
import type {
  UserDirectoryEntry,
  UserDirectoryResponse,
} from "@/lib/api/types";
import { USER_ROLE_LABEL, USER_ROLES, type UserRole } from "@/lib/users";
import clsx from "clsx";
import {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  Loader2,
  Lock,
  Mail,
  Phone,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

type RoleFilter = "all" | UserRole;

type DirectoryMeta = {
  totalUsers: number;
  roleSummary: Partial<Record<UserRole, number>>;
  requestSummary: {
    totalRequests: number;
    stockIn: number;
    stockOut: number;
  };
};

const ROLE_FILTER_LABEL: Record<RoleFilter, string> = {
  all: "All",
  admin: USER_ROLE_LABEL.admin,
  staff: USER_ROLE_LABEL.staff,
};

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  admin: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100",
  staff:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
};

const createDefaultMeta = (): DirectoryMeta => ({
  totalUsers: 0,
  roleSummary: {},
  requestSummary: {
    totalRequests: 0,
    stockIn: 0,
    stockOut: 0,
  },
});

const toNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const formatCount = (value: number): string => value.toLocaleString();

const formatDate = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function UsersPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserDirectoryEntry[]>([]);
  const [meta, setMeta] = useState<DirectoryMeta>(() => createDefaultMeta());
  const [isFetching, setIsFetching] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const accessToken = session?.accessToken ?? null;
  const role = (session?.user?.role?.toString().toLowerCase() ??
    "staff") as UserRole;
  const isAdmin = role === "admin";
  const showDirectoryControls = sessionStatus === "authenticated" && isAdmin;

  useEffect(() => {
    if (sessionStatus === "authenticated" && !isAdmin) {
      setUsers([]);
      setMeta(createDefaultMeta());
      setHasLoaded(false);
      setFetchError(null);
    }
  }, [sessionStatus, isAdmin]);

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      return;
    }
    if (!isAdmin) {
      return;
    }
    if (!accessToken) {
      setUsers([]);
      setMeta(createDefaultMeta());
      setFetchError("Missing access token. Please sign in again.");
      setHasLoaded(true);
      return;
    }

    const controller = new AbortController();

    const loadDirectory = async () => {
      setIsFetching(true);
      setFetchError(null);

      const params = new URLSearchParams();
      if (roleFilter !== "all") {
        params.set("role", roleFilter);
      }
      const path =
        params.size > 0
          ? `/api/v1/users?${params.toString()}`
          : "/api/v1/users";

      try {
        const response = await apiFetch<UserDirectoryResponse>(path, {
          token: accessToken,
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        const roleSummary: Partial<Record<UserRole, number>> = {};
        USER_ROLES.forEach((roleKey) => {
          const raw = (
            response.roleSummary as Record<string, unknown> | undefined
          )?.[roleKey];
          roleSummary[roleKey] = toNumber(raw);
        });

        const requestSummaryRaw = response.requestSummary ?? {
          totalRequests: 0,
          stockIn: 0,
          stockOut: 0,
        };

        setUsers(response.data ?? []);
        setMeta({
          totalUsers: toNumber(response.count ?? response.data?.length),
          roleSummary,
          requestSummary: {
            totalRequests: toNumber(requestSummaryRaw.totalRequests),
            stockIn: toNumber(requestSummaryRaw.stockIn),
            stockOut: toNumber(requestSummaryRaw.stockOut),
          },
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("[users] Failed to load user directory", error);
        setUsers([]);
        setMeta(createDefaultMeta());
        setFetchError(
          error instanceof Error
            ? error.message
            : "Unable to load the user directory."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsFetching(false);
          setHasLoaded(true);
        }
      }
    };

    void loadDirectory();

    return () => {
      controller.abort();
    };
  }, [sessionStatus, isAdmin, accessToken, roleFilter, reloadToken]);

  const filteredUsers = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    if (trimmedQuery.length === 0) {
      return users;
    }
    return users.filter((user) => {
      const matchesName =
        user.name?.toLowerCase().includes(trimmedQuery) ?? false;
      const matchesEmail =
        user.email?.toLowerCase().includes(trimmedQuery) ?? false;
      const matchesRole = user.role.toLowerCase().includes(trimmedQuery);
      const matchesTel = user.tel
        ? user.tel.toLowerCase().includes(trimmedQuery)
        : false;
      const matchesRequestCount =
        typeof user.requestSummary?.totalRequests === "number"
          ? user.requestSummary.totalRequests.toString().includes(trimmedQuery)
          : false;
      return (
        matchesName ||
        matchesEmail ||
        matchesRole ||
        matchesTel ||
        matchesRequestCount
      );
    });
  }, [users, query]);

  const visibleCount = filteredUsers.length;

  const summaryCards = useMemo(() => {
    const totalUsers = meta.totalUsers;
    const adminCount = meta.roleSummary?.admin ?? 0;
    const staffCount = meta.roleSummary?.staff ?? 0;
    const totalRequests = meta.requestSummary.totalRequests;
    const stockIn = meta.requestSummary.stockIn;
    const stockOut = meta.requestSummary.stockOut;

    return [
      {
        id: "total",
        label: "Total Users",
        value: formatCount(totalUsers),
        subLabel:
          roleFilter === "all"
            ? "All active members"
            : `${ROLE_FILTER_LABEL[roleFilter]} directory`,
        icon: Users,
      },
      {
        id: "admins",
        label: "Admins",
        value: formatCount(adminCount),
        subLabel: "With elevated access",
        icon: ShieldCheck,
      },
      {
        id: "staff",
        label: "Staff",
        value: formatCount(staffCount),
        subLabel: "Operational updates",
        icon: UserRound,
      },
      {
        id: "requests",
        label: "Stock Movements",
        value: formatCount(totalRequests),
        subLabel: `In ${formatCount(stockIn)} • Out ${formatCount(stockOut)}`,
        icon: RefreshCcw,
      },
    ];
  }, [meta, roleFilter]);

  const handleRetry = () => {
    setReloadToken((value) => value + 1);
  };

  const handleResetFilters = () => {
    setRoleFilter("all");
    setQuery("");
  };

  let bodyContent: ReactNode = null;

  if (sessionStatus === "loading") {
    bodyContent = (
      <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-secondary-color-soft bg-neutral-color/60 px-6 py-16 text-center text-sm text-primary-color-muted">
        <Loader2 className="h-6 w-6 animate-spin text-secondary-color" />
        <p>Loading your session…</p>
      </div>
    );
  } else if (!showDirectoryControls) {
    bodyContent = (
      <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-secondary-color-soft bg-neutral-color/60 px-6 py-16 text-center text-sm text-primary-color-muted">
        <Lock className="h-6 w-6 text-secondary-color" />
        <p className="text-base font-semibold text-primary-color">
          Admin access required
        </p>
        <p className="max-w-md text-sm text-primary-color-muted">
          Only administrators can view the full user directory and activity
          summary.
        </p>
      </div>
    );
  } else if (fetchError) {
    bodyContent = (
      <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-danger-color/40 bg-danger-color/5 px-6 py-16 text-center">
        <AlertCircle className="h-6 w-6 text-danger-color" />
        <div className="space-y-1">
          <p className="text-base font-semibold text-danger-color">
            Unable to load the user directory
          </p>
          <p className="text-sm text-danger-color/80">{fetchError}</p>
        </div>
        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex items-center gap-2 rounded-full bg-secondary-color px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <RefreshCcw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  } else if (isFetching && !hasLoaded) {
    bodyContent = (
      <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-secondary-color-soft bg-neutral-color/60 px-6 py-16 text-center text-sm text-primary-color-muted">
        <Loader2 className="h-6 w-6 animate-spin text-secondary-color" />
        <p>Loading the latest user directory…</p>
      </div>
    );
  } else if (showDirectoryControls && hasLoaded && filteredUsers.length === 0) {
    bodyContent = (
      <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-secondary-color-soft bg-neutral-color/60 px-6 py-16 text-center text-sm text-primary-color-muted">
        <p>No users match your current filters.</p>
        <button
          type="button"
          onClick={handleResetFilters}
          className="inline-flex items-center gap-2 rounded-full border border-secondary-color-soft bg-white px-5 py-2.5 text-sm font-medium text-primary-color-muted shadow-sm transition hover:border-secondary-color hover:text-primary-color dark:bg-slate-900"
        >
          Reset search
        </button>
      </div>
    );
  } else if (showDirectoryControls) {
    bodyContent = (
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {filteredUsers.map((user) => {
          const requestSummary = user.requestSummary ?? {
            totalRequests: 0,
            stockIn: 0,
            stockOut: 0,
          };
          const joinedOn = formatDate(user.createdAt);

          return (
            <article
              key={user.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-secondary-color-soft hover:shadow-lg dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-secondary-color-soft text-secondary-color dark:bg-slate-800">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-color">
                      {user.name}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-primary-color-muted">
                      {joinedOn && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-color px-3 py-1">
                          <Calendar className="h-3.5 w-3.5 text-secondary-color" />
                          Joined {joinedOn}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-primary-color-muted shadow-sm ring-1 ring-secondary-color-soft">
                        <RefreshCcw className="h-3.5 w-3.5 text-secondary-color" />
                        {formatCount(requestSummary.totalRequests)} updates
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={clsx(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                    ROLE_BADGE_STYLES[user.role]
                  )}
                >
                  {USER_ROLE_LABEL[user.role]}
                </span>
              </div>

              <div className="flex flex-col gap-2 text-sm text-primary-color-muted">
                <a
                  href={`mailto:${user.email}`}
                  className="inline-flex items-center gap-2 text-secondary-color transition hover:text-secondary-color/80"
                >
                  <Mail className="h-4 w-4" />
                  {user.email}
                </a>
                {user.tel && (
                  <a
                    href={`tel:${user.tel}`}
                    className="inline-flex items-center gap-2 text-secondary-color transition hover:text-secondary-color/80"
                  >
                    <Phone className="h-4 w-4" />
                    {user.tel}
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1 rounded-full bg-success-color-soft px-3 py-1 text-success-color">
                  <ArrowUpCircle className="h-3.5 w-3.5" />
                  Stock In {formatCount(requestSummary.stockIn)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-danger-color-soft px-3 py-1 text-danger-color">
                  <ArrowDownCircle className="h-3.5 w-3.5" />
                  Stock Out {formatCount(requestSummary.stockOut)}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex-1 bg-neutral-color/60 p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <DashboardToolbar />

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-secondary-color">
                Team Directory
              </p>
              <div className="mt-1 flex flex-col gap-1">
                <h2 className="text-2xl font-semibold text-primary-color">
                  Users ({visibleCount.toString().padStart(2, "0")})
                </h2>
                <p className="text-sm text-primary-color-muted">
                  {showDirectoryControls
                    ? "Browse admins and staff with their stock activity."
                    : "Sign in with an administrator account to manage users."}
                </p>
              </div>
            </div>

            {showDirectoryControls && (
              <div className="flex flex-wrap gap-2">
                {(Object.keys(ROLE_FILTER_LABEL) as RoleFilter[]).map(
                  (roleOption) => (
                    <button
                      key={roleOption}
                      type="button"
                      onClick={() => setRoleFilter(roleOption)}
                      className={clsx(
                        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                        roleFilter === roleOption
                          ? "border-secondary-color bg-secondary-color text-white shadow-sm"
                          : "border-secondary-color-soft bg-white text-primary-color-muted hover:border-secondary-color hover:text-primary-color dark:bg-slate-900"
                      )}
                    >
                      {ROLE_FILTER_LABEL[roleOption]}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {showDirectoryControls && (
            <>
              <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-sm">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-color-muted/60" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by name, role, or email"
                    className="w-full rounded-full border border-secondary-color-soft bg-white py-3 pl-12 pr-4 text-sm text-primary-color-muted shadow-sm transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft dark:bg-slate-900"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-primary-color-muted">
                  <span>
                    Showing{" "}
                    <span className="font-semibold text-primary-color">
                      {visibleCount}
                    </span>{" "}
                    result{visibleCount === 1 ? "" : "s"}
                  </span>
                  {isFetching && (
                    <span className="inline-flex items-center gap-2 text-secondary-color">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Updating…
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => (
                  <div
                    key={card.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-secondary-color-soft hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-primary-color-muted">
                        {card.label}
                      </span>
                      <card.icon className="h-4 w-4 text-secondary-color" />
                    </div>
                    <p className="text-2xl font-semibold text-primary-color">
                      {card.value}
                    </p>
                    <p className="text-xs text-primary-color-muted">
                      {card.subLabel}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {bodyContent}
        </section>
      </div>
    </div>
  );
}
