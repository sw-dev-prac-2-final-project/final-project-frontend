"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar";
import clsx from "clsx";
import {
  AlertCircle,
  Filter,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import type {
  ApiSuccessResponse,
  PaginatedResponse,
  ProductDto,
  RequestDto,
} from "@/lib/api/types";

type ModalMode = "create" | "edit";

type TransactionFilter = "all" | "stockIn" | "stockOut";

type RequestFormState = {
  productId: string;
  transactionType: "stockIn" | "stockOut";
  itemAmount: string;
  transactionDate: string;
};

const INITIAL_FORM_STATE: RequestFormState = {
  productId: "",
  transactionType: "stockOut",
  itemAmount: "",
  transactionDate: new Date().toISOString().split("T")[0],
};

const TRANSACTION_LABEL: Record<"stockIn" | "stockOut", string> = {
  stockIn: "Stock In",
  stockOut: "Stock Out",
};

export default function RequestsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const role = session?.user?.role?.toString().toLowerCase() ?? "staff";
  const token = session?.accessToken ?? null;
  const isAdmin = role === "admin";

  const [requests, setRequests] = useState<RequestDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [productError, setProductError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [transactionFilter, setTransactionFilter] =
    useState<TransactionFilter>("all");
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [editingRecord, setEditingRecord] = useState<RequestDto | null>(null);
  const [formState, setFormState] =
    useState<RequestFormState>(INITIAL_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRestriction, setShowRestriction] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!token) {
      return;
    }
    setIsFetching(true);
    setFetchError(null);
    try {
      const response = await apiFetch<PaginatedResponse<RequestDto>>(
        "/api/v1/requests",
        { token }
      );
      setRequests(response.data);
    } catch (error) {
      setFetchError(
        error instanceof Error
          ? error.message
          : "Unable to load requests from the API."
      );
    } finally {
      setIsFetching(false);
    }
  }, [token]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await apiFetch<PaginatedResponse<ProductDto>>(
        "/api/v1/products"
      );
      setProducts(response.data);
    } catch (error) {
      setProductError(
        error instanceof Error
          ? error.message
          : "Unable to load products for request creation."
      );
    }
  }, []);

  useEffect(() => {
    fetchProducts().catch((error) =>
      console.error("[requests] Failed to preload products", error)
    );
  }, [fetchProducts]);

  useEffect(() => {
    if (token) {
      fetchRequests().catch((error) =>
        console.error("[requests] Initial fetch failed", error)
      );
    }
  }, [fetchRequests, token]);

  const productLookup = useMemo(() => {
    return new Map(products.map((product) => [product._id, product]));
  }, [products]);

  const selectedProduct = formState.productId
    ? productLookup.get(formState.productId)
    : undefined;
  const availableStock = selectedProduct?.stockQuantity ?? 0;
  const parsedItemAmount = Number(formState.itemAmount);
  const noStockAvailable =
    formState.transactionType === "stockOut" &&
    selectedProduct &&
    availableStock <= 0;
  const exceedsAvailableStock =
    formState.transactionType === "stockOut" &&
    selectedProduct &&
    Number.isFinite(parsedItemAmount) &&
    parsedItemAmount > availableStock;

  const filteredRequests = useMemo(() => {
    const trimmedSearch = search.trim().toLowerCase();
    return requests.filter((request) => {
      const product =
        typeof request.product_id === "object"
          ? request.product_id
          : productLookup.get(request.product_id);
      const productName =
        (typeof product === "object" && product?.name) || "Unknown product";

      const matchesTransaction =
        transactionFilter === "all" ||
        request.transactionType === transactionFilter;

      const matchesSearch =
        trimmedSearch.length === 0 ||
        productName.toLowerCase().includes(trimmedSearch) ||
        request._id.toLowerCase().includes(trimmedSearch);

      return matchesTransaction && matchesSearch;
    });
  }, [requests, productLookup, transactionFilter, search]);

  const resetForm = (state?: RequestFormState) => {
    setFormState(state ?? INITIAL_FORM_STATE);
    setFormError(null);
  };

  const openCreateModal = () => {
    if (isAdmin) {
      setShowRestriction(true);
      return;
    }
    resetForm({
      ...INITIAL_FORM_STATE,
      productId: products[0]?._id ?? "",
    });
    setEditingRecord(null);
    setModalMode("create");
  };

  const openEditModal = (record: RequestDto) => {
    resetForm({
      productId:
        typeof record.product_id === "string"
          ? record.product_id
          : record.product_id?._id ?? "",
      transactionType: record.transactionType,
      itemAmount: record.itemAmount.toString(),
      transactionDate: record.transactionDate
        ? record.transactionDate.slice(0, 10)
        : new Date().toISOString().split("T")[0],
    });
    setEditingRecord(record);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingRecord(null);
    setIsSubmitting(false);
    resetForm();
  };

  const validateForm = () => {
    if (!formState.productId) {
      setFormError("Please select a product for this request.");
      return false;
    }
    const amountValue = Number(formState.itemAmount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setFormError("Amount must be a positive number.");
      return false;
    }
    if (formState.transactionType === "stockOut") {
      if (!selectedProduct) {
        setFormError(
          "Unable to determine available stock for the selected product."
        );
        return false;
      }
      if (availableStock <= 0) {
        setFormError("This product has no stock available for stock-out.");
        return false;
      }
      if (amountValue > availableStock) {
        setFormError(
          `Stock-out requests cannot exceed available stock (${availableStock} units).`
        );
        return false;
      }
    }
    if (!formState.transactionDate) {
      setFormError("Transaction date is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!modalMode || !token) {
      return;
    }
    if (!validateForm()) {
      return;
    }

    const payload = {
      product_id: formState.productId,
      transactionType: formState.transactionType,
      itemAmount: Number(formState.itemAmount),
      transactionDate: new Date(formState.transactionDate),
    };

    try {
      setIsSubmitting(true);
      if (modalMode === "create") {
        const response = await apiFetch<ApiSuccessResponse<RequestDto>>(
          "/api/v1/requests",
          {
            method: "POST",
            body: JSON.stringify(payload),
            token,
          }
        );
        setRequests((prev) => [response.data, ...prev]);
      }

      if (modalMode === "edit" && editingRecord?._id) {
        const response = await apiFetch<ApiSuccessResponse<RequestDto>>(
          `/api/v1/requests/${editingRecord._id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
            token,
          }
        );
        setRequests((prev) =>
          prev.map((record) =>
            record._id === editingRecord._id ? response.data : record
          )
        );
      }
      closeModal();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save request. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (record: RequestDto) => {
    if (!token) {
      return;
    }
    try {
      await apiFetch<ApiSuccessResponse<unknown>>(
        `/api/v1/requests/${record._id}`,
        {
          method: "DELETE",
          token,
        }
      );
      setRequests((prev) => prev.filter((item) => item._id !== record._id));
      closeModal();
    } catch (error) {
      setFetchError(
        error instanceof Error
          ? error.message
          : "Unable to delete request. Please try again."
      );
    }
  };

  const setFieldValue = (
    key: keyof RequestFormState,
    value: string | "stockIn" | "stockOut"
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex-1 bg-neutral-color/60 p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <DashboardToolbar />

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-secondary-color">
                Inventory
              </p>
              <div className="mt-1 flex flex-col gap-1">
                <h2 className="text-2xl font-semibold text-primary-color">
                  Requests ({requests.length.toString().padStart(2, "0")})
                </h2>
                <p className="text-sm text-primary-color-muted">
                  Data sourced directly from the StockMe API.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-success-color px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-success-color/40 transition hover:bg-success-color/90"
            >
              <Plus className="h-4 w-4" />
              New Request
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex w-full max-w-md items-center">
              <Search className="pointer-events-none absolute left-4 h-5 w-5 text-primary-color-muted/60" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search requests..."
                className="w-full rounded-xl border border-secondary-color-soft bg-white py-3 pl-12 pr-4 text-sm text-primary-color-muted shadow-sm transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-secondary-color-soft bg-white px-4 py-2.5 text-sm font-medium text-primary-color-muted shadow-sm transition hover:border-secondary-color hover:text-primary-color"
                aria-label="Filter requests"
              >
                <Filter className="h-4 w-4 text-secondary-color" />
                Filters
              </button>

              <select
                value={transactionFilter}
                onChange={(event) =>
                  setTransactionFilter(event.target.value as TransactionFilter)
                }
                className="rounded-xl border border-secondary-color-soft bg-white px-4 py-2.5 text-sm font-medium text-primary-color-muted shadow-sm transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
              >
                <option value="all">All transactions</option>
                <option value="stockIn">Stock in</option>
                <option value="stockOut">Stock out</option>
              </select>
            </div>
          </div>

          {productError && (
            <div className="mt-6 rounded-xl border border-warning-color/40 bg-warning-color/10 px-4 py-3 text-sm text-warning-color">
              {productError}
            </div>
          )}

          {fetchError && (
            <div className="mt-6 rounded-xl border border-danger-color/40 bg-danger-color/10 px-4 py-3 text-sm text-danger-color">
              {fetchError}
            </div>
          )}

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-neutral-color">
                <tr className="text-left text-sm font-semibold text-primary-color-muted">
                  <th className="px-6 py-4">Request ID</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4">Requested By</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-sm text-primary-color-muted">
                {isFetching && (
                  <tr>
                    <td colSpan={7} className="px-6 py-6">
                      <div className="flex items-center justify-center gap-2 text-sm text-primary-color-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading requests…
                      </div>
                    </td>
                  </tr>
                )}

                {!isFetching &&
                  filteredRequests.map((record) => {
                    const product =
                      typeof record.product_id === "object"
                        ? record.product_id
                        : productLookup.get(record.product_id);
                    const user =
                      typeof record.user === "object"
                        ? record.user
                        : undefined;
                    return (
                      <tr
                        key={record._id}
                        className={clsx(
                          "transition hover:bg-secondary-color-soft/60"
                        )}
                      >
                        <td className="px-6 py-4 font-medium text-primary-color">
                          {record._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-primary-color">
                              {product?.name ?? "Unknown product"}
                            </span>
                            <span className="text-xs text-primary-color-muted">
                              {product?.sku}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={clsx(
                              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                              record.transactionType === "stockIn"
                                ? "bg-success-color/10 text-success-color"
                                : "bg-danger-color/10 text-danger-color"
                            )}
                          >
                            {TRANSACTION_LABEL[record.transactionType]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-primary-color">
                          {record.itemAmount}
                        </td>
                        <td className="px-6 py-4">
                          {user?.name ?? "Staff Member"}
                          <div className="text-xs text-primary-color-muted">
                            {user?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {record.transactionDate
                            ? new Date(record.transactionDate).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(record)}
                              className="inline-flex items-center justify-center rounded-lg bg-secondary-color px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-secondary-color/90"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(record)}
                              className="inline-flex items-center justify-center rounded-lg border border-danger-color/60 px-3 py-2 text-xs font-semibold text-danger-color transition hover:bg-danger-color/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                {!isFetching && filteredRequests.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm text-primary-color-muted/70"
                    >
                      {requests.length === 0
                        ? "No requests available yet."
                        : "No requests match your current filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {modalMode && (
        <Modal
          title={modalMode === "create" ? "Create Request" : "Edit Request"}
          onClose={closeModal}
        >
          <div className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-primary-color">
              Product
              <select
                value={formState.productId}
                onChange={(event) =>
                  setFieldValue("productId", event.target.value)
                }
                className="rounded-xl border border-secondary-color-soft px-4 py-3 text-sm text-primary-color-muted shadow-sm transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-primary-color">
              Transaction Type
              <select
                value={formState.transactionType}
                onChange={(event) =>
                  setFieldValue(
                    "transactionType",
                    event.target.value as "stockIn" | "stockOut"
                  )
                }
                className="rounded-xl border border-secondary-color-soft px-4 py-3 text-sm text-primary-color-muted shadow-sm transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
              >
                <option value="stockOut">Stock out</option>
                <option value="stockIn">Stock in</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-primary-color">
              Amount
              <input
                type="number"
                min={1}
                max={
                  formState.transactionType === "stockOut" &&
                  selectedProduct &&
                  selectedProduct.stockQuantity > 0
                    ? selectedProduct.stockQuantity
                    : undefined
                }
                value={formState.itemAmount}
                onChange={(event) =>
                  setFieldValue("itemAmount", event.target.value)
                }
                className="rounded-xl border border-secondary-color-soft px-4 py-3 text-sm text-primary-color-muted shadow-sm transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-primary-color">
              Transaction Date
              <input
                type="date"
                value={formState.transactionDate}
                onChange={(event) =>
                  setFieldValue("transactionDate", event.target.value)
                }
                className="rounded-xl border border-secondary-color-soft px-4 py-3 text-sm text-primary-color-muted shadow-sm transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
              />
            </label>

            {formState.transactionType === "stockOut" &&
              (selectedProduct ? (
                noStockAvailable ? (
                  <p className="rounded-xl border border-warning-color/40 bg-warning-color/10 px-4 py-3 text-sm text-warning-color">
                    This product currently has no stock available for stock-out.
                  </p>
                ) : exceedsAvailableStock ? (
                  <p className="rounded-xl border border-warning-color/40 bg-warning-color/10 px-4 py-3 text-sm text-warning-color">
                    Only {availableStock.toLocaleString()} units are available
                    for stock-out.
                  </p>
                ) : null
              ) : (
                <p className="rounded-xl border border-warning-color/40 bg-warning-color/10 px-4 py-3 text-sm text-warning-color">
                  Select a product to view available stock.
                </p>
              ))}

            {formError && (
              <p className="rounded-xl border border-danger-color/40 bg-danger-color/10 px-4 py-3 text-sm text-danger-color">
                {formError}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-success-color px-4 py-3 text-sm font-semibold text-white transition hover:bg-success-color/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : modalMode === "create" ? (
                "Create"
              ) : (
                "Update"
              )}
            </button>
            {modalMode === "edit" && (
              <button
                type="button"
                onClick={() => editingRecord && handleDelete(editingRecord)}
                disabled={isSubmitting}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-danger-color px-4 py-3 text-sm font-semibold text-white transition hover:bg-danger-color/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Delete
              </button>
            )}
          </div>
        </Modal>
      )}

      {showRestriction && (
        <Modal
          title="Admin Access Only"
          onClose={() => setShowRestriction(false)}
          icon={<AlertCircle className="h-6 w-6 text-warning-color" />}
        >
          <p className="mt-4 text-sm text-primary-color-muted">
            Only staff members can create stock requests. Please switch to a
            staff account to submit a new request.
          </p>
        </Modal>
      )}

      {sessionStatus === "loading" && (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-color text-white px-4 py-2 text-xs shadow-lg shadow-primary-color/30">
            <Loader2 className="h-4 w-4 animate-spin" />
            Syncing user role...
          </div>
        </div>
      )}
    </div>
  );
}

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  icon?: ReactNode;
};

function Modal({ title, onClose, children, icon }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-neutral-color text-primary-color-muted transition hover:bg-secondary-color-soft hover:text-primary-color"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-xl font-semibold text-primary-color">{title}</h3>
        </div>

        {children}
      </div>
    </div>
  );
}
