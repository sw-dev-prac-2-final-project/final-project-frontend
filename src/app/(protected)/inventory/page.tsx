"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar";
import {
  AlertCircle,
  Filter,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import type {
  ApiSuccessResponse,
  PaginatedResponse,
  ProductDto,
} from "@/lib/api/types";

type ModalMode = "create" | "edit";

type InventoryFormState = {
  name: string;
  sku: string;
  category: string;
  stockQuantity: string;
  unit: string;
  price: string;
  description: string;
  picture: string;
};

const INITIAL_FORM_STATE: InventoryFormState = {
  name: "",
  sku: "",
  category: "",
  stockQuantity: "",
  unit: "",
  price: "",
  description: "",
  picture: "",
};

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const role = session?.user?.role?.toString().toLowerCase() ?? "staff";
  const canManageItems = role === "admin";
  const token = session?.accessToken ?? null;

  const [records, setRecords] = useState<ProductDto[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [editingRecord, setEditingRecord] = useState<ProductDto | null>(null);
  const [formState, setFormState] =
    useState<InventoryFormState>(INITIAL_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);

  const resetForm = (nextState?: InventoryFormState) => {
    setFormState(nextState ?? INITIAL_FORM_STATE);
    setFormError(null);
  };

  const fetchProducts = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);
    try {
      const response = await apiFetch<PaginatedResponse<ProductDto>>(
        "/api/v1/products"
      );
      setRecords(response.data);
    } catch (error) {
      setFetchError(
        error instanceof Error
          ? error.message
          : "Failed to load inventory records."
      );
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts().catch((error) => {
      console.error("[inventory] Initial fetch failed", error);
    });
  }, [fetchProducts]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    records.forEach((record) => {
      if (record.category) {
        unique.add(record.category);
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [records]);

  const filteredRecords = useMemo(() => {
    const trimmedSearch = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesCategory =
        categoryFilter === "all" || record.category === categoryFilter;
      const matchesSearch =
        trimmedSearch.length === 0 ||
        record.name.toLowerCase().includes(trimmedSearch) ||
        record.sku.toLowerCase().includes(trimmedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [records, categoryFilter, search]);

  const openCreateModal = () => {
    if (!canManageItems) {
      setShowRestrictionModal(true);
      return;
    }
    resetForm({
      ...INITIAL_FORM_STATE,
      category: categories[0] ?? "",
      unit: "unit",
    });
    setModalMode("create");
    setEditingRecord(null);
  };

  const openEditModal = (record: ProductDto) => {
    if (!canManageItems) {
      setShowRestrictionModal(true);
      return;
    }
    resetForm({
      name: record.name ?? "",
      sku: record.sku ?? "",
      category: record.category ?? "",
      stockQuantity: record.stockQuantity?.toString() ?? "",
      unit: record.unit ?? "",
      price: record.price?.toString() ?? "",
      description: record.description ?? "",
      picture: record.picture ?? "",
    });
    setEditingRecord(record);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingRecord(null);
    setIsSaving(false);
    resetForm();
  };

  const validateForm = () => {
    if (!formState.name.trim()) {
      setFormError("Product name is required.");
      return false;
    }
    if (!formState.sku.trim()) {
      setFormError("SKU is required.");
      return false;
    }
    if (!formState.category.trim()) {
      setFormError("Category is required.");
      return false;
    }
    if (!formState.unit.trim()) {
      setFormError("Unit is required.");
      return false;
    }
    if (!formState.description.trim()) {
      setFormError("Description is required.");
      return false;
    }
    if (!formState.picture.trim()) {
      setFormError("Product image URL is required.");
      return false;
    }
    const priceValue = Number(formState.price);
    if (Number.isNaN(priceValue) || priceValue < 0) {
      setFormError("Price must be a valid non-negative number.");
      return false;
    }
    const stockValue = Number(formState.stockQuantity);
    if (!Number.isFinite(stockValue) || stockValue < 0) {
      setFormError("Stock quantity must be a valid non-negative number.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!modalMode) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (!token) {
      setFormError("You must be signed in as an administrator to manage items.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        name: formState.name.trim(),
        sku: formState.sku.trim(),
        category: formState.category.trim(),
        stockQuantity: Number(formState.stockQuantity),
        unit: formState.unit.trim(),
        price: Number(formState.price),
        description: formState.description.trim(),
        picture: formState.picture.trim(),
        isActive: true,
      };

      if (modalMode === "create") {
        const response = await apiFetch<ApiSuccessResponse<ProductDto>>(
          "/api/v1/products",
          {
            method: "POST",
            body: JSON.stringify(payload),
            token,
          }
        );
        setRecords((prev) => [response.data, ...prev]);
      }

      if (modalMode === "edit" && editingRecord?._id) {
        const response = await apiFetch<ApiSuccessResponse<ProductDto>>(
          `/api/v1/products/${editingRecord._id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
            token,
          }
        );
        setRecords((prev) =>
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
          : "Unable to save product changes. Please try again."
      );
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingRecord?._id) {
      return;
    }

    if (!token) {
      setFormError("You must be signed in as an administrator to manage items.");
      return;
    }

    try {
      setIsSaving(true);
      await apiFetch<ApiSuccessResponse<unknown>>(
        `/api/v1/products/${editingRecord._id}`,
        { method: "DELETE", token }
      );
      setRecords((prev) =>
        prev.filter((record) => record._id !== editingRecord._id)
      );
      closeModal();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to delete product. Please try again."
      );
      setIsSaving(false);
    }
  };

  const handleRestrictedAction = () => {
    setShowRestrictionModal(true);
  };

  const setFieldValue = (key: keyof InventoryFormState, value: string) => {
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
                  View Stock ({records.length})
                </h2>
                <p className="text-sm text-primary-color-muted">
                  Live product data powered by the StockMe API.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={canManageItems ? openCreateModal : handleRestrictedAction}
              className="inline-flex items-center gap-2 rounded-xl bg-danger-color px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-danger-color/40 transition hover:bg-danger-color/90"
            >
              <Plus className="h-4 w-4" />
              Add New Item
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex w-full max-w-md items-center">
              <Search className="pointer-events-none absolute left-4 h-5 w-5 text-primary-color-muted/60" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or SKU..."
                className="w-full rounded-xl border border-secondary-color-soft bg-white py-3 pl-12 pr-4 text-sm text-primary-color-muted shadow-sm transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-secondary-color-soft bg-white px-4 py-2.5 text-sm font-medium text-primary-color-muted shadow-sm transition hover:border-secondary-color hover:text-primary-color"
                aria-label="Filter inventory"
              >
                <Filter className="h-4 w-4 text-secondary-color" />
                Filters
              </button>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-xl border border-secondary-color-soft bg-white px-4 py-2.5 text-sm font-medium text-primary-color-muted shadow-sm transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {fetchError && (
            <div className="mt-6 rounded-xl border border-danger-color/40 bg-danger-color/10 px-4 py-3 text-sm text-danger-color">
              {fetchError}
            </div>
          )}

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-neutral-color">
                <tr className="text-left text-sm font-semibold text-primary-color-muted">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4 text-right">Stock</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-sm text-primary-color-muted">
                {isFetching && (
                  <tr>
                    <td className="px-6 py-6" colSpan={4}>
                      <div className="flex items-center justify-center gap-2 text-sm text-primary-color-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading inventory…
                      </div>
                    </td>
                  </tr>
                )}
                {!isFetching &&
                  filteredRecords.map((record) => (
                    <tr
                      key={record._id}
                      className="transition hover:bg-secondary-color-soft/60"
                    >
                      <td className="px-6 py-4 text-primary-color font-medium">
                        <div className="flex flex-col">
                          <span>{record.name}</span>
                          <span className="text-xs font-normal text-primary-color-muted">
                            {record.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{record.sku}</td>
                      <td className="px-6 py-4 text-right">
                        {record.stockQuantity.toLocaleString()}{" "}
                        <span className="text-xs uppercase text-primary-color-muted">
                          {record.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            canManageItems
                              ? openEditModal(record)
                              : handleRestrictedAction()
                          }
                          className="inline-flex items-center justify-center rounded-lg bg-success-color px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-success-color/90"
                        >
                          Edit Item
                        </button>
                      </td>
                    </tr>
                  ))}
                {!isFetching && filteredRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-sm text-primary-color-muted/70"
                    >
                      {records.length === 0
                        ? "No inventory items available. Try adding a new record."
                        : "No items match your current filters."}
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
          onClose={closeModal}
          title={modalMode === "edit" ? "Edit Item" : "Add New Item"}
        >
          <div className="mt-4 flex flex-col gap-5">
            <FormField
              label="Product Name"
              value={formState.name}
              onChange={(value) => setFieldValue("name", value)}
            />
            <FormField
              label="SKU"
              value={formState.sku}
              onChange={(value) => setFieldValue("sku", value)}
            />
            <FormField
              label="Category"
              value={formState.category}
              onChange={(value) => setFieldValue("category", value)}
              placeholder="Type category"
              suggestions={categories}
            />
            <FormField
              label="Stock Quantity"
              type="number"
              value={formState.stockQuantity}
              onChange={(value) => setFieldValue("stockQuantity", value)}
            />
            <FormField
              label="Unit of Measurement"
              value={formState.unit}
              onChange={(value) => setFieldValue("unit", value)}
            />
            <FormField
              label="Price"
              type="number"
              value={formState.price}
              onChange={(value) => setFieldValue("price", value)}
            />
            <FormField
              label="Picture URL"
              value={formState.picture}
              onChange={(value) => setFieldValue("picture", value)}
            />
            <FormField
              label="Description"
              value={formState.description}
              onChange={(value) => setFieldValue("description", value)}
              as="textarea"
              rows={3}
            />

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
              disabled={isSaving}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-success-color px-4 py-3 text-sm font-semibold text-white transition hover:bg-success-color/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : modalMode === "edit" ? (
                "Update"
              ) : (
                "Create"
              )}
            </button>
            {modalMode === "edit" && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-danger-color px-4 py-3 text-sm font-semibold text-white transition hover:bg-danger-color/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Delete
              </button>
            )}
          </div>
        </Modal>
      )}

      {showRestrictionModal && (
        <Modal
          title="Access Restricted"
          onClose={() => setShowRestrictionModal(false)}
          icon={<AlertCircle className="h-6 w-6 text-danger-color" />}
        >
          <p className="mt-4 text-sm text-primary-color-muted">
            Only administrators can add or edit inventory items. Ask an admin to
            update the stock levels for you.
          </p>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setShowRestrictionModal(false)}
              className="rounded-xl bg-secondary-color px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary-color/90"
            >
              Got it
            </button>
          </div>
        </Modal>
      )}

      {status === "loading" && (
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

type FormFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  as?: "input" | "select" | "textarea";
  options?: string[];
  placeholder?: string;
  rows?: number;
  suggestions?: string[];
};

function FormField({
  label,
  value,
  onChange,
  type = "text",
  as = "input",
  options,
  placeholder,
  rows,
  suggestions,
}: FormFieldProps) {
  const generatedListId = useId();
  const listId =
    as === "input" && suggestions?.length
      ? `${generatedListId}-suggestions`
      : undefined;

  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-primary-color">
      {label}
      {as === "select" ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-xl border border-secondary-color-soft px-4 py-3 text-sm font-normal text-primary-color-muted shadow-sm transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
        >
          {options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
          {!options?.length && (
            <option value="">No categories available</option>
          )}
        </select>
      ) : as === "textarea" ? (
        <textarea
          value={value}
          rows={rows ?? 4}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-xl border border-secondary-color-soft px-4 py-3 text-sm font-normal text-primary-color-muted shadow-sm transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
        />
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          list={listId}
          className="rounded-xl border border-secondary-color-soft px-4 py-3 text-sm font-normal text-primary-color-muted shadow-sm transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
        />
      )}
      {listId && (
        <datalist id={listId}>
          {suggestions?.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      )}
    </label>
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
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
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
