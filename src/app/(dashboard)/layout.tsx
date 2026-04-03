"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { ReminderEngine } from "@/components/reminders/reminder-engine";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Pill } from "lucide-react";

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Animated logo */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Pill className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-2xl animate-pulse-ring bg-primary/20" />
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold gradient-text mb-1">MedTrack</h2>
          <p className="text-muted-foreground text-sm">Loading your dashboard...</p>
        </div>

        {/* Skeleton bars */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-primary/40"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Handle redirect without render flash
  useEffect(() => {
    if (!loading && !user) {
      setRedirecting(true);
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || redirecting) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <ReminderEngine />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
