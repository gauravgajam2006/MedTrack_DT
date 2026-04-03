"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { motion } from "framer-motion";
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  Bell,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useData } from "@/components/providers/auth-provider";
import { formatDistanceToNow, parseISO } from "date-fns";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { profile, signOut } = useAuth();
  const { notifications } = useData();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [bellAnimating, setBellAnimating] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = React.useRef<HTMLDivElement>(null);

  // Track scroll for border glow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Periodic bell ring animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBellAnimating(true);
      setTimeout(() => setBellAnimating(false), 1000);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    toast.success("Signed out successfully");
    router.push("/login");
  }, [signOut, router]);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b navbar-scroll",
        scrolled && "scrolled"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              MedTrack
            </h2>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Notifications Indicator */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl hover:bg-secondary transition-colors group"
            >
              <motion.div
                animate={bellAnimating ? {
                  rotate: [0, 12, -10, 8, -5, 2, 0],
                } : {}}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </motion.div>
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-dot-pulse" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 bg-popover border border-border shadow-lg rounded-2xl overflow-hidden z-50 origin-top-right"
              >
                <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-muted/50">
                  <h3 className="font-semibold text-sm">Quick Reminders</h3>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                    {notifications.length} New
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-border">
                      {notifications.slice(0, 5).map((notif) => (
                        <div key={notif.id} className="px-4 py-3 hover:bg-secondary/50 transition-colors">
                          <div className="flex gap-3">
                            <div className="mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(parseISO(notif.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No new reminders.
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-border bg-muted/30 text-center">
                    <button 
                      onClick={() => {
                        setShowNotifications(false);
                        router.push("/dashboard");
                      }}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      View all in dashboard log
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            whileTap={{ scale: 0.9, rotate: 180 }}
            className="p-2.5 rounded-xl hover:bg-secondary transition-colors"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-500" />
            )}
          </motion.button>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="p-2.5 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>

          {/* Avatar with glow ring */}
          <div className="relative ml-1">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name || "User"}
                className="w-10 h-10 rounded-full border-2 border-primary/20 object-cover shadow-sm p-0.5 bg-background"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-primary/20">
                {profile?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
