"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import {
  LayoutDashboard,
  Pill,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/medications", label: "Medications", icon: Pill },
  { href: "/profile", label: "Profile", icon: User },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { profile } = useAuth();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
            <Image src="/medtrack_logo.png" alt="MedTrack Logo" width={40} height={40} className="object-cover" />
          </div>
          <span className="text-xl font-bold gradient-text">MedTrack</span>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* User Info */}
      <div className="px-4 mb-6">
        <div className="px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 flex items-center gap-3">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name || "User"}
              className="w-10 h-10 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-border">
              <User className="w-5 h-5 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">
              {profile?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.phone || "Patient"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative nav-glow group",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full bg-gradient-to-b from-primary to-primary-light"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
              </motion.div>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* App Info */}
      <div className="px-4 pb-6">
        <div className="px-4 py-3 rounded-xl bg-secondary/30 border border-border/50">
          <p className="text-xs text-muted-foreground font-medium">MedTrack v1.0</p>
          <p className="text-[10px] text-muted-foreground/70 mt-1">Medication Adherence Platform</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col overflow-y-auto bg-sidebar border-r border-sidebar-border">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
