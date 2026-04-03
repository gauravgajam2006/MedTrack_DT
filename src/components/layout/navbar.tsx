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

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { profile, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [bellAnimating, setBellAnimating] = useState(false);

  // Track scroll for border glow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
              {getGreeting()}{profile?.name ? `, ${profile.name}` : ""} 👋
            </h2>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Notifications Indicator */}
          <button className="relative p-2.5 rounded-xl hover:bg-secondary transition-colors group">
            <motion.div
              animate={bellAnimating ? {
                rotate: [0, 12, -10, 8, -5, 2, 0],
              } : {}}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </motion.div>
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-dot-pulse" />
          </button>

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
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-primary/20 animate-glow-pulse">
              {profile?.name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
