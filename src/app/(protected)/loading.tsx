import clsx from "clsx";

type SkeletonProps = {
  className?: string;
};

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800/70",
        className
      )}
    />
  );
}

const summaryCards = Array.from({ length: 4 });
const statCards = Array.from({ length: 2 });

export default function Loading() {
  return (
    <div className="flex flex-col gap-8 px-6 py-6 sm:px-8 lg:px-12 lg:py-10">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center gap-3 rounded-full border border-secondary-color-soft bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-5 flex-1 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="hidden h-3 w-14 rounded-full sm:inline-flex" />
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-6">
          <Skeleton className="h-11 w-40 rounded-full" />
          <div className="sm:border-l sm:border-secondary-color-soft sm:pl-6">
            <Skeleton className="h-3 w-28 rounded-full" />
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <Skeleton className="h-4 w-40 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        <Skeleton className="h-9 w-48 rounded-lg" />
        <Skeleton className="h-4 w-64 rounded-lg" />
      </div>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((_, index) => (
          <div
            key={`summary-${index}`}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <Skeleton className="absolute inset-x-0 top-0 h-1 rounded-none" />
            <div className="flex flex-col gap-5 p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-28 rounded-lg" />
                <Skeleton className="h-4 w-32 rounded-lg" />
              </div>
              <Skeleton className="h-9 w-36 rounded-full" />
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32 rounded-lg" />
                <Skeleton className="h-4 w-52 rounded-lg" />
              </div>
              <Skeleton className="h-9 w-36 rounded-full" />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {statCards.map((_, index) => (
                <div
                  key={`inventory-stat-${index}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <Skeleton className="h-8 w-24 rounded-lg" />
                  <Skeleton className="mt-2 h-4 w-32 rounded-lg" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-6 h-4 w-40 rounded-full" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-40 rounded-lg" />
                <Skeleton className="h-4 w-56 rounded-lg" />
              </div>
              <Skeleton className="h-9 w-48 rounded-full" />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {statCards.map((_, index) => (
                <div
                  key={`user-stat-${index}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <Skeleton className="h-8 w-24 rounded-lg" />
                  <Skeleton className="mt-2 h-4 w-32 rounded-lg" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-6 h-4 w-48 rounded-full" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32 rounded-lg" />
              <Skeleton className="h-4 w-48 rounded-lg" />
            </div>
            <Skeleton className="h-9 w-40 rounded-full" />
          </div>

          <div className="mt-8 flex flex-col items-center gap-6">
            <div className="relative flex h-48 w-48 items-center justify-center">
              <Skeleton className="absolute inset-0 h-full w-full rounded-full" />
              <div className="absolute inset-8 flex flex-col items-center justify-center gap-2">
                <Skeleton className="h-3 w-12 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
              </div>
            </div>
            <div className="w-full space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              {statCards.map((_, index) => (
                <div
                  key={`request-row-${index}`}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-3 w-10 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
