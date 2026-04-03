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
  MessageCircle,
  Users,
  ShieldAlert,
  Clock,
  CheckCircle2,
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
                className="absolute right-0 mt-3 w-[360px] bg-card/95 backdrop-blur-2xl border border-border shadow-2xl rounded-2xl overflow-hidden z-50 origin-top-right ring-1 ring-black/5"
              >
                <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-secondary/30">
                  <div>
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" />
                      Quick Reminders
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Your recent activity</p>
                  </div>
                  <span className="text-[11px] bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-bold shadow-sm border border-primary/10">
                    {notifications.length} New
                  </span>
                </div>

                <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-border/50">
                      {notifications.slice(0, 10).map((notif) => {
                        // Icon and color based on type
                        let Icon = Clock;
                        let iconBg = "bg-blue-500/10";
                        let iconColor = "text-blue-500";
                        
                        if (notif.type === "whatsapp") {
                          Icon = MessageCircle;
                          iconBg = "bg-green-500/10";
                          iconColor = "text-green-500";
                        } else if (notif.type === "guardian" || notif.type === "doctor") {
                          Icon = ShieldAlert;
                          iconBg = "bg-amber-500/10";
                          iconColor = "text-amber-500";
                        } else if (notif.status === "sent") {
                          Icon = CheckCircle2;
                          iconBg = "bg-success/10";
                          iconColor = "text-success";
                        }

                        return (
                          <div 
                            key={notif.id} 
                            className="px-5 py-4 hover:bg-secondary/40 transition-all cursor-pointer group relative overflow-hidden"
                          >
                            {/* Hover accent */}
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="flex gap-4">
                              <div className={cn("shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", iconBg)}>
                                <Icon className={cn("w-5 h-5", iconColor)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground leading-snug">
                                  {notif.message}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <Clock className="w-3 h-3 text-muted-foreground/60" />
                                  <p className="text-[11px] text-muted-foreground font-medium">
                                    {formatDistanceToNow(parseISO(notif.created_at), { addSuffix: true })}
                                  </p>
                                  {notif.status === "demo" && (
                                    <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-primary/60 px-1.5 py-0.5 rounded bg-primary/5 border border-primary/10">
                                      Demo
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                      <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center mb-3">
                        <Bell className="w-6 h-6 text-muted-foreground/40" />
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">No new reminders</h4>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[180px]">We'll notify you here when it's time for your medication.</p>
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 border-t border-border bg-muted/20">
                  <button 
                    onClick={() => {
                      setShowNotifications(false);
                      router.push("/dashboard");
                    }}
                    className="w-full text-center py-2 text-xs font-bold text-primary hover:text-primary-light transition-colors rounded-lg hover:bg-primary/5"
                  >
                    View all in dashboard log
                  </button>
                </div>
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
