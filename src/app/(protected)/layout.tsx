import type { ReactNode } from "react";
import { Suspense } from "react";
import ProtectedShell from "@/components/layout/ProtectedShell";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
          <div className="flex items-center gap-3 rounded-2xl border border-secondary-color-soft bg-white px-6 py-4 text-sm shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <span>Preparing your workspace…</span>
          </div>
        </div>
      }
    >
      <ProtectedShell>{children}</ProtectedShell>
    </Suspense>
  );
}
