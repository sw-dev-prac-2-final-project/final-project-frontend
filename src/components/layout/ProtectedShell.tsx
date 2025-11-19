"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/sidebar/Sidebar";

type ProtectedShellProps = {
  children: ReactNode;
};

export default function ProtectedShell({ children }: ProtectedShellProps) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const callbackUrl = useMemo(() => {
    if (!pathname) {
      return "/";
    }
    const search = typeof window === "undefined" ? "" : window.location.search;
    return search ? `${pathname}${search}` : pathname;
  }, [pathname]);

  useEffect(() => {
    if (status !== "unauthenticated") {
      return;
    }

    const hasCallback = Boolean(callbackUrl);
    const redirectTarget = hasCallback
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login";

    router.replace(redirectTarget);
  }, [status, router, callbackUrl]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="flex items-center gap-3 rounded-2xl border border-secondary-color-soft bg-white px-6 py-4 text-sm shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="h-5 w-5 animate-spin text-secondary-color" />
          <span>
            {status === "loading"
              ? "Checking your session…"
              : "Redirecting to login…"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen w-full overflow-hidden bg-slate-50 transition-colors duration-300 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto">{children}</main>
    </div>
  );
}
