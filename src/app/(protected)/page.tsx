"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Package,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useSession } from "next-auth/react";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar";
import { apiFetch } from "@/lib/api/client";
import type {
  PaginatedResponse,
  ProductDto,
  RequestDto,
  UserDirectoryResponse,
} from "@/lib/api/types";

export default function Home() {
  const { data: session } = useSession();
  const token = session?.accessToken ?? null;
  const role = session?.user?.role?.toString().toLowerCase() ?? "staff";
  const isAdmin = role === "admin";

  const [products, setProducts] = useState<ProductDto[]>([]);
  const [productError, setProductError] = useState<string | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const [requests, setRequests] = useState<RequestDto[]>([]);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  const [userCounts, setUserCounts] = useState<{
    total: number;
    admin: number;
    staff: number;
  } | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      setProductError(null);
      try {
        const response = await apiFetch<PaginatedResponse<ProductDto>>(
          "/api/v1/products"
        );
        if (!cancelled) {
          setProducts(response.data ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("[dashboard] Failed to load products", error);
          setProducts([]);
          setProductError(
            error instanceof Error
              ? error.message
              : "Unable to load products."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProducts(false);
        }
      }
    };

    loadProducts().catch((error) =>
      console.error("[dashboard] Unexpected product fetch error", error)
    );

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setRequests([]);
      setRequestError(null);
      return;
    }

    const loadRequests = async () => {
      setIsLoadingRequests(true);
      setRequestError(null);
      try {
        const response = await apiFetch<PaginatedResponse<RequestDto>>(
          "/api/v1/requests",
          { token }
        );
        if (!cancelled) {
          setRequests(response.data ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("[dashboard] Failed to load requests", error);
          setRequests([]);
          setRequestError(
            error instanceof Error
              ? error.message
              : "Unable to load requests."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingRequests(false);
        }
      }
    };

    loadRequests().catch((error) =>
      console.error("[dashboard] Unexpected request fetch error", error)
    );

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    if (!token || !isAdmin) {
      setUserCounts(null);
      setUserError(null);
      return;
    }

    const loadUsers = async () => {
      setIsLoadingUsers(true);
      setUserError(null);
      try {
        const response = await apiFetch<UserDirectoryResponse>("/api/v1/users", {
          token,
        });
        if (cancelled) {
          return;
        }
        const total =
          typeof response.count === "number"
            ? response.count
            : response.data?.length ?? 0;
        const adminCount =
          typeof response.roleSummary?.admin === "number"
            ? response.roleSummary.admin
            : Number(response.roleSummary?.admin) || 0;
        const staffCount =
          typeof response.roleSummary?.staff === "number"
            ? response.roleSummary.staff
            : Number(response.roleSummary?.staff) || 0;
        setUserCounts({
          total,
          admin: adminCount,
          staff: staffCount,
        });
      } catch (error) {
        if (!cancelled) {
          console.error("[dashboard] Failed to load user directory", error);
          setUserCounts(null);
          setUserError(
            error instanceof Error
              ? error.message
              : "Unable to load user directory."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingUsers(false);
        }
      }
    };

    loadUsers().catch((error) =>
      console.error("[dashboard] Unexpected user fetch error", error)
    );

    return () => {
      cancelled = true;
    };
  }, [token, isAdmin]);

  const totalProducts = products.length;
  const totalStockUnits = useMemo(() => {
    return products.reduce((sum, product) => {
      const quantity = Number(product.stockQuantity);
      return Number.isFinite(quantity) ? sum + quantity : sum;
    }, 0);
  }, [products]);

  const totalRequestCount = requests.length;
  const stockInCount = useMemo(
    () =>
      requests.filter((request) => request.transactionType === "stockIn").length,
    [requests]
  );
  const stockOutCount = totalRequestCount - stockInCount;

  const formatValue = (value: number | null | undefined): string => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "—";
    }
    return value.toLocaleString();
  };

  const summaryCards = useMemo(
    () => [
      {
        id: "products",
        label: "Total Products",
        value: formatValue(totalProducts),
        icon: Package,
        accent: "bg-secondary-color",
        iconBg: "bg-secondary-color-soft",
        iconColor: "text-secondary-color",
        ctaLabel: "Visit Inventory",
        ctaHref: "/inventory",
        ctaClass: "bg-secondary-color text-white hover:opacity-90",
      },
      {
        id: "requests",
        label: "Total Requests",
        value: formatValue(totalRequestCount),
        icon: BadgeCheck,
        accent: "bg-warning-color",
        iconBg: "bg-warning-color-soft",
        iconColor: "text-warning-color",
        ctaLabel: "Review Requests",
        ctaHref: "/requests",
        ctaClass: "bg-warning-color text-slate-900 hover:opacity-90",
      },
      {
        id: "stockIn",
        label: "Stock In Transactions",
        value: formatValue(stockInCount),
        icon: ShieldCheck,
        accent: "bg-success-color",
        iconBg: "bg-success-color-soft",
        iconColor: "text-success-color",
        ctaLabel: "View Detailed Report",
        ctaHref: "/reports",
        ctaClass: "bg-success-color text-slate-900 hover:opacity-90",
      },
      {
        id: "stockOut",
        label: "Stock Out Transactions",
        value: formatValue(stockOutCount),
        icon: AlertTriangle,
        accent: "bg-danger-color",
        iconBg: "bg-danger-color-soft",
        iconColor: "text-danger-color",
        ctaLabel: "View Detailed Report",
        ctaHref: "/reports",
        ctaClass: "bg-danger-color text-white hover:opacity-90",
      },
    ],
    [totalProducts, totalRequestCount, stockInCount, stockOutCount]
  );

  const inventoryStats = useMemo(
    () => [
      {
        id: "products",
        label: "Total products",
        value: formatValue(totalProducts),
      },
      {
        id: "stock",
        label: "Total stock units",
        value: formatValue(totalStockUnits),
      },
    ],
    [totalProducts, totalStockUnits]
  );

  const userStats = useMemo(
    () => [
      {
        id: "staffs",
        label: "Total staff",
        value: formatValue(userCounts?.staff ?? null),
      },
      {
        id: "admins",
        label: "Total admins",
        value: formatValue(userCounts?.admin ?? null),
      },
    ],
    [userCounts]
  );

  const requestSegments = useMemo(
    () => [
      {
        id: "stockIn",
        label: "Stock In",
        value: stockInCount,
        color: "#34D399",
        legendClass: "bg-success-color",
      },
      {
        id: "stockOut",
        label: "Stock Out",
        value: stockOutCount,
        color: "#F97316",
        legendClass: "bg-warning-color",
      },
    ],
    [stockInCount, stockOutCount]
  );

  const totalRequests = useMemo(
    () => requestSegments.reduce((sum, segment) => sum + segment.value, 0),
    [requestSegments]
  );

  const donutSegments = useMemo(() => {
    if (totalRequests === 0) {
      return [];
    }
    let cumulative = 0;
    return requestSegments.map((segment) => {
      if (segment.value <= 0) {
        return {
          ...segment,
          percentage: 0,
          dashArray: "0 100",
          dashOffset: 25 - cumulative,
        };
      }
      const percentage = (segment.value / totalRequests) * 100;
      const dashArray = `${percentage} ${100 - percentage}`;
      const dashOffset = 25 - cumulative;
      cumulative += percentage;
      return {
        ...segment,
        percentage: Math.round(percentage),
        dashArray,
        dashOffset,
      };
    });
  }, [requestSegments, totalRequests]);

  const hasRequestData = totalRequests > 0;

  return (
    <div className="flex flex-col gap-8 px-6 py-6 sm:px-8 lg:px-12 lg:py-10">
      <DashboardToolbar />

      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          A quick data overview of the inventory.
        </p>
      </div>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.id}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={`absolute inset-x-0 top-0 h-1 ${card.accent}`} />
            <div className="flex flex-col gap-5 p-5">
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-semibold text-slate-900">
                  {card.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{card.label}</p>
              </div>
              <Link
                href={card.ctaHref}
                className={`inline-flex w-max items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${card.ctaClass}`}
              >
                {card.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Inventory
                </h2>
                <p className="text-sm text-slate-500">
                  Current stock performance snapshot.
                </p>
              </div>
              <Link
                href="/inventory"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
              >
                View Inventory
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {inventoryStats.map((stat) => (
                <div
                  key={stat.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4"
                >
                  <p className="text-2xl font-semibold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
            {isLoadingProducts && (
              <p className="mt-4 text-sm text-slate-500">
                Loading inventory metrics...
              </p>
            )}
            {productError && (
              <p className="mt-4 text-sm text-danger-color">{productError}</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  User Management
                </h2>
                <p className="text-sm text-slate-500">
                  Monitor the people responsible for inventory updates.
                </p>
              </div>
              <Link
                href="/users"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
              >
                Go to User Management
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {userStats.map((stat) => (
                <div
                  key={stat.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4"
                >
                  <p className="text-2xl font-semibold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
            {isLoadingUsers && (
              <p className="mt-4 text-sm text-slate-500">
                Loading user metrics...
              </p>
            )}
            {userError && (
              <p className="mt-4 text-sm text-danger-color">{userError}</p>
            )}
            {!isAdmin && (
              <p className="mt-4 text-sm text-slate-500">
                Sign in as an administrator to view directory metrics.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Quick Report
              </h2>
              <p className="text-sm text-slate-500">
                Request status distribution this month.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
            >
              October 2025
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          <div className="mt-8 flex flex-col items-center gap-6">
            {isLoadingRequests ? (
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-2xl font-semibold text-slate-900">
                  —
                </span>
                <p className="text-sm text-slate-500">
                  Loading request metrics...
                </p>
              </div>
            ) : hasRequestData ? (
              <>
                <div className="relative flex h-48 w-48 items-center justify-center">
                  <svg
                    viewBox="0 0 36 36"
                    className="h-full w-full -rotate-90 transform"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="4"
                      opacity="0.4"
                    />
                    {donutSegments.map((segment) => (
                      <circle
                        key={segment.id}
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke={segment.color}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={segment.dashArray}
                        strokeDashoffset={segment.dashOffset}
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Total
                    </span>
                    <span className="text-2xl font-semibold text-slate-900">
                      {totalRequests.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500">Requests</span>
                  </div>
                </div>

                <div className="w-full border-t border-slate-100 pt-4">
                  <div className="flex flex-col gap-3 text-sm text-slate-600">
                    {donutSegments.map((segment) => (
                      <div
                        key={segment.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${segment.legendClass}`}
                          />
                          <span className="font-medium text-slate-700">
                            {segment.label}
                          </span>
                          <span className="text-xs text-slate-400">
                            {segment.percentage}%
                          </span>
                        </div>
                        <span className="font-semibold text-slate-900">
                          {segment.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-2xl font-semibold text-slate-900">
                  {formatValue(totalRequests)}
                </span>
                <p className="text-sm text-slate-500">
                  {requestError ?? "No request activity recorded yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
