"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Boxes,
  Users,
  Info,
  ChevronDown,
  EllipsisVertical,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role ?? "staff";
  const name = session?.user?.name ?? "User";
  const [open, setOpen] = useState({
    inventory: true,
    contact: true,
  });
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const NavItem = ({
    href,
    label,
    icon: Icon,
    badge,
  }: {
    href: string;
    label: string;
    icon: LucideIcon;
    badge?: string;
  }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={clsx(
          "flex items-center gap-3 px-5 py-2.5 text-[15px] font-medium transition-colors",
          active
            ? "bg-secondary-color text-white"
            : "text-white/90 hover:bg-white/10 hover:text-white"
        )}
      >
        <Icon size={18} />
        <span className="flex-1">{label}</span>
        {badge && (
          <span className="rounded-full bg-danger-color text-xs font-semibold px-1.5 py-0.5">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="flex w-72 shrink-0 flex-col justify-between bg-primary-color text-white transition-colors duration-300 dark:bg-slate-900 dark:text-slate-100">
      <div>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Image
            src="/logo.png"
            alt="logo"
            width={28}
            height={28}
            className="object-contain"
          />
          <h1 className="text-lg font-semibold tracking-wide">Team Inventory</h1>
        </div>

        <div className="px-5 py-4 border-b border-white/10">
          <div
            ref={profileMenuRef}
            className="relative flex items-center justify-between gap-2"
          >
            <div>
              <p className="font-medium text-[15px]">{name}</p>
              <p className="text-warning-color text-sm capitalize">{role}</p>
            </div>
            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="rounded-md p-1.5 transition hover:bg-white/10"
              title="Account options"
            >
              <EllipsisVertical className="h-5 w-5" />
            </button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full z-10 mt-3 w-44">
                <div className="relative rounded-xl bg-white py-2 text-sm text-primary-color-muted shadow-lg ring-1 ring-black/5">
                  <div className="pointer-events-none absolute -top-2 right-4 h-3 w-3 rotate-45 bg-white ring-1 ring-black/5" />
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left font-semibold text-danger-color transition hover:bg-secondary-color-soft/40"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="py-3 flex flex-col gap-1">
          <NavItem href="/" label="Dashboard" icon={LayoutDashboard} />
          <button
            onClick={() =>
              setOpen((o) => ({ ...o, inventory: !o.inventory }))
            }
            className="flex items-center gap-3 px-5 py-2.5 text-[15px] font-medium text-white/90 hover:bg-white/10"
          >
            <Boxes size={18} />
            <span className="flex-1">Inventory</span>
            <ChevronDown
              size={16}
              className={clsx(
                "transition-transform",
                open.inventory ? "rotate-180" : "rotate-0"
              )}
            />
          </button>
          {open.inventory && (
            <div className="ml-9 flex flex-col gap-1">
              <NavItem href="/inventory" label="View Stock" icon={Boxes} />
              <NavItem href="/requests" label="Requests" icon={Boxes} />
            </div>
          )}

          <button
            onClick={() => setOpen((o) => ({ ...o, contact: !o.contact }))}
            className="flex items-center gap-3 px-5 py-2.5 text-[15px] font-medium text-white/90 hover:bg-white/10"
          >
            <Users size={18} />
            <span className="flex-1">Contact Management</span>
            <ChevronDown
              size={16}
              className={clsx(
                "transition-transform",
                open.contact ? "rotate-180" : "rotate-0"
              )}
            />
          </button>
          {open.contact && (
            <div className="ml-9 flex flex-col gap-1">
              <NavItem href="/users" label="Users Directory" icon={Users} />
            </div>
          )}

          <hr className="border-white/10 my-2 mx-4" />
          <NavItem href="/about" label="About us" icon={Info} />
        </nav>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/10 text-xs text-white/70 flex justify-between">
        <span>Powered by Dream Team</span>
        <span>v1.1.2</span>
      </div>
    </aside>
  );
}
