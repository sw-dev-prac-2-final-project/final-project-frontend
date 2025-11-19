"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import clsx from "clsx";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthShellProps) {
  return (
    <div className={clsx("flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10", className)}>
      <div className="flex w-full max-w-5xl overflow-hidden rounded-[40px] bg-white shadow-2xl">
        <aside className="relative hidden flex-1 flex-col justify-between bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 px-10 py-12 sm:flex">
          <div className="absolute inset-y-0 left-0 w-3 bg-secondary-color/70" />
          <div className="absolute -left-24 top-10 h-44 w-44 rounded-full bg-secondary-color/10 blur-xl" />
          <div className="absolute bottom-16 left-16 h-16 w-16 rounded-full bg-danger-color/20 blur-lg" />
          <div className="absolute right-10 top-10 h-20 w-20 rounded-full bg-secondary-color/20 blur-xl" />
          <div className="relative mx-auto flex w-full max-w-md flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/90 p-6 text-center shadow-lg">
            <Image
              src="/images/auth-mascot.svg"
              width={280}
              height={320}
              priority
              alt="Friendly inventory mascot standing near warehouse shelves"
              className="h-auto w-full"
            />
          </div>
          <div className="relative mt-10 text-center text-primary-color">
            <h2 className="text-2xl font-semibold">Team Inventory Management</h2>
            <p className="mt-2 text-sm text-primary-color-muted">
              The fastest and most systematic way to handle your stock.
            </p>
          </div>
        </aside>

        <main className="flex-1 bg-white px-8 py-12 sm:px-12">
          <div className="mx-auto flex h-full w-full max-w-md flex-col justify-center">
            <header className="mb-10">
              <h1 className="text-3xl font-semibold text-primary-color">{title}</h1>
              <p className="mt-2 text-sm text-primary-color-muted">{subtitle}</p>
            </header>
            <div className="flex flex-1 flex-col gap-6">{children}</div>
            {footer && (
              <footer className="mt-10 border-t border-slate-200 pt-6 text-center text-sm text-primary-color-muted">
                {footer}
              </footer>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
