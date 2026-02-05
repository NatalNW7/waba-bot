"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

interface HeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      {/* Left side - Logo and mobile menu */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Abrir menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Logo/Brand */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">C</span>
          </div>
          <span className="font-semibold text-foreground">Cliqtree</span>
        </Link>
      </div>

      {/* User menu */}
      <div className="flex items-center gap-3">
        {/* Notifications - placeholder */}
        <button
          className="p-2 rounded-lg hover:bg-muted transition-colors relative"
          aria-label="Notificações"
        >
          <svg
            className="w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* User info display */}
        <div className="flex items-center gap-2 p-1.5">
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name || "Avatar"}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {user?.name?.charAt(0) || user?.email.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
            {user?.name || user?.email.split("@")[0]}
          </span>
        </div>
      </div>
    </header>
  );
}
