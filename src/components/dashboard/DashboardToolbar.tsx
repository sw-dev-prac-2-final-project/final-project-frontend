"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import {
  CalendarDays,
  Clock3,
  Loader2,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import type {
  PaginatedResponse,
  RequestDto,
  UserDirectoryEntry,
  UserDirectoryResponse,
} from "@/lib/api/types";
import { useTheme } from "@/providers/theme-provider";

type DashboardToolbarProps = {
  className?: string;
};

type SearchMode = "requests" | "users";

type ResultBadge = "Request" | "Staff" | "Admin";

type SearchResult = {
  id: string;
  title: string;
  description: string;
  href: string;
  badge: ResultBadge;
};

const BADGE_STYLES: Record<ResultBadge, string> = {
  Request:
    "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
  Staff:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  Admin:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100",
};

const MODE_LABEL: Record<SearchMode, string> = {
  requests: "Requests",
  users: "Users",
};

const TRANSACTION_LABEL: Record<"stockIn" | "stockOut", string> = {
  stockIn: "Stock In",
  stockOut: "Stock Out",
};

export default function DashboardToolbar({
  className,
}: DashboardToolbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const token = session?.accessToken ?? null;
  const role = session?.user?.role?.toString().toLowerCase();
  const isAdmin = role === "admin";
  const [now, setNow] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("requests");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [requestItems, setRequestItems] = useState<RequestDto[]>([]);
  const [userDirectory, setUserDirectory] = useState<UserDirectoryEntry[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setRequestItems([]);
      return;
    }

    const fetchRequests = async () => {
      setIsLoadingRequests(true);
      try {
        const response = await apiFetch<PaginatedResponse<RequestDto>>(
          "/api/v1/requests",
          { token }
        );
        if (!cancelled) {
          setRequestItems(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("[toolbar] Failed to load requests", error);
          setRequestItems([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingRequests(false);
        }
      }
    };

    fetchRequests().catch((error) =>
      console.error("[toolbar] Unexpected request fetch error", error)
    );

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    if (!token || !isAdmin) {
      setUserDirectory([]);
      return;
    }

    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const response = await apiFetch<UserDirectoryResponse>("/api/v1/users", {
          token,
        });
        if (!cancelled) {
          setUserDirectory(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("[toolbar] Failed to load user directory", error);
          setUserDirectory([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingUsers(false);
        }
      }
    };

    fetchUsers().catch((error) =>
      console.error("[toolbar] Unexpected user directory fetch error", error)
    );

    return () => {
      cancelled = true;
    };
  }, [token, isAdmin]);

  const formattedDate = useMemo(() => {
    if (!now) {
      return "—";
    }
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now);
  }, [now]);

  const formattedTime = useMemo(() => {
    if (!now) {
      return "--:--:--";
    }
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);
  }, [now]);

  const requestResults = useMemo<SearchResult[]>(() => {
    if (!requestItems.length) {
      return [];
    }
    const query = searchQuery.trim().toLowerCase();
    const mapped = requestItems.map((record) => {
      const product =
        typeof record.product_id === "object" ? record.product_id : undefined;
      const requester =
        typeof record.user === "object" ? record.user.name : "Team member";
      const shortId = record._id.slice(-6).toUpperCase();
      const dateLabel = record.transactionDate
        ? new Date(record.transactionDate).toLocaleDateString()
        : "—";
      return {
        id: record._id,
        title: product?.name ?? `Request #${shortId}`,
        description: `#${shortId} • ${TRANSACTION_LABEL[record.transactionType]} • ${record.itemAmount} units · ${requester} · ${dateLabel}`,
        href: "/requests",
        badge: "Request" as const,
      };
    });
    if (!query) {
      return mapped;
    }
    return mapped.filter((entry) =>
      [entry.title, entry.description].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [requestItems, searchQuery]);

  const userResults = useMemo<SearchResult[]>(() => {
    if (!userDirectory.length) {
      return [];
    }
    const query = searchQuery.trim().toLowerCase();
    const mapped = userDirectory.map((user) => ({
      id: user.id,
      title: user.name,
      description: `${user.role.toUpperCase()} · ${user.email} · ${
        user.requestSummary?.totalRequests ?? 0
      } requests`,
      href: "/users",
      badge: user.role === "admin" ? ("Admin" as const) : ("Staff" as const),
    }));
    if (!query) {
      return mapped;
    }
    return mapped.filter((entry) =>
      [entry.title, entry.description].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [userDirectory, searchQuery]);

  const results = mode === "requests" ? requestResults : userResults;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setIsDropdownOpen(true);
  };

  const handleModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setMode(event.target.value as SearchMode);
    setIsDropdownOpen(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsDropdownOpen(false);
      event.currentTarget.blur();
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsDropdownOpen(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const isLoadingCurrent =
    mode === "requests" ? isLoadingRequests : isLoadingUsers;

  const showDropdown =
    isDropdownOpen &&
    (isLoadingCurrent || searchQuery.trim().length > 0 || results.length > 0);

  return (
    <div
      className={clsx(
        "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
        className
      )}
    >
      <div className="flex w-full flex-col gap-2" ref={searchRef}>
        <div className="relative flex-1">
          <div className="flex w-full items-center gap-3 rounded-full border border-secondary-color-soft bg-white pl-4 pr-3 shadow-sm transition focus-within:border-secondary-color focus-within:ring-2 focus-within:ring-secondary-color-soft dark:bg-slate-900">
            <Search className="h-5 w-5 shrink-0 text-primary-color-muted/60" />
            <select
              value={mode}
              onChange={handleModeChange}
              className="h-8 shrink-0 rounded-full border border-transparent bg-secondary-color-soft px-3 text-xs font-semibold uppercase tracking-wide text-secondary-color transition focus:outline-none focus:ring-2 focus:ring-secondary-color/60 dark:bg-slate-800 dark:text-slate-200"
              aria-label="Select search mode"
            >
              {Object.entries(MODE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input
              ref={inputRef}
              type="search"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={`Search ${MODE_LABEL[mode].toLowerCase()}...`}
              aria-label={`Search ${MODE_LABEL[mode]}`}
              className="flex-1 bg-transparent py-3 text-sm text-primary-color-muted placeholder:text-primary-color-muted/60 focus:outline-none dark:text-slate-100"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={clearSearch}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-color text-primary-color-muted transition hover:bg-secondary-color-soft hover:text-primary-color dark:bg-slate-800"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <span className="hidden text-xs font-medium uppercase tracking-wide text-primary-color-muted/60 sm:inline-flex">
                {MODE_LABEL[mode]}
              </span>
            )}
          </div>

          {showDropdown && (
            <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-20 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl transition dark:border-slate-700 dark:bg-slate-900">
              {isLoadingCurrent ? (
                <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-primary-color-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading {MODE_LABEL[mode].toLowerCase()}…
                </div>
              ) : results.length > 0 ? (
                <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                  {results.slice(0, 6).map((result) => (
                    <li key={result.id}>
                      <Link
                        href={result.href}
                        className="group flex flex-col gap-2 rounded-xl px-3 py-3 transition hover:bg-secondary-color-soft/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-color"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-primary-color transition group-hover:text-secondary-color">
                            {result.title}
                          </p>
                          <span
                            className={clsx(
                              "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                              BADGE_STYLES[result.badge]
                            )}
                          >
                            {result.badge}
                          </span>
                        </div>
                        <p className="text-xs text-primary-color-muted">
                          {result.description}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : mode === "users" && !isAdmin ? (
                <div className="flex flex-col items-center gap-2 px-4 py-6 text-center text-sm text-primary-color-muted">
                  <p>User directory search is available for administrators.</p>
                  <p className="text-xs text-primary-color-muted/80">
                    Switch to the Requests tab to search your activity.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 px-4 py-6 text-center text-sm text-primary-color-muted">
                  <p>
                    No matches for{" "}
                    <span className="font-semibold text-primary-color">
                      {"\""}
                      {searchQuery.trim()}
                      {"\""}
                    </span>
                    .
                  </p>
                  <p className="text-xs text-primary-color-muted/80">
                    Try searching by{" "}
                    {mode === "requests"
                      ? "ID, product, or requester."
                      : "name, role, or email."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-6">
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 rounded-full border border-secondary-color-soft bg-white px-5 py-2.5 text-sm font-medium text-primary-color-muted shadow-sm transition hover:border-secondary-color hover:text-primary-color dark:bg-slate-900"
          aria-pressed={theme === "dark"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-primary-color-muted/70" />
          ) : (
            <Moon className="h-4 w-4 text-primary-color-muted/70" />
          )}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
        <div className="sm:border-l sm:border-secondary-color-soft sm:pl-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-color">
            Good Morning
          </p>
          <div className="mt-1 flex flex-col gap-1 text-sm text-primary-color-muted sm:flex-row sm:items-center sm:gap-4">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary-color-muted/70" />
              {formattedDate}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary-color-muted/70" />
              {formattedTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
