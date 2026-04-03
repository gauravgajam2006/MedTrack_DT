"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useAuth, useData } from "@/components/providers/auth-provider";
import { motion } from "framer-motion";
import {
  Pill,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { format, subDays, parseISO } from "date-fns";
import dynamic from "next/dynamic";
import Link from "next/link";

const TodaysMedications = dynamic(() => import("@/components/dashboard/todays-medications").then(mod => ({ default: mod.TodaysMedications })), { 
  ssr: false, 
  loading: () => <div className="skeleton h-64 w-full rounded-2xl" /> 
});

const AdherenceCharts = dynamic(() => import("@/components/dashboard/adherence-charts").then(mod => ({ default: mod.AdherenceCharts })), { 
  ssr: false, 
  loading: () => <div className="skeleton h-72 w-full rounded-2xl" /> 
});

const NotificationFeed = dynamic(() => import("@/components/dashboard/notification-feed").then(mod => ({ default: mod.NotificationFeed })), { 
  ssr: false, 
  loading: () => <div className="skeleton h-72 w-full rounded-2xl" /> 
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 800) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    prevTarget.current = target;

    const startTime = Date.now();
    const startVal = 0;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startVal + (target - startVal) * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [target, duration]);

  return count;
}

function AnimatedStatValue({ value }: { value: string | number }) {
  const isPercentage = typeof value === "string" && value.endsWith("%");
  const numericValue = isPercentage
    ? parseInt(value as string, 10)
    : typeof value === "number"
    ? value
    : 0;
  const animatedValue = useAnimatedCounter(numericValue);

  return (
    <span>
      {animatedValue}
      {isPercentage ? "%" : ""}
    </span>
  );
}

export default function DashboardPage() {
  const { medications, logs, loadingData } = useData();
  const { profile } = useAuth();

  const stats = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const todayLogs = logs.filter((l) => l.scheduled_date === today);
    const taken = todayLogs.filter((l) => l.status === "taken").length;
    const missed = todayLogs.filter((l) => l.status === "missed").length;
    const pending = todayLogs.filter((l) => l.status === "pending").length;
    const total = todayLogs.length;

    // Last 7 days adherence
    const last7Days: { date: string; taken: number; missed: number; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      const dayLogs = logs.filter((l) => l.scheduled_date === d);
      const dayTaken = dayLogs.filter((l) => l.status === "taken").length;
      const dayMissed = dayLogs.filter((l) => l.status === "missed").length;
      last7Days.push({
        date: format(parseISO(d), "EEE"),
        taken: dayTaken,
        missed: dayMissed,
        total: dayLogs.length,
      });
    }

    // Overall adherence
    const allCompleted = logs.filter((l) => l.status === "taken" || l.status === "missed");
    const allTaken = logs.filter((l) => l.status === "taken").length;
    const adherenceRate = allCompleted.length > 0 ? Math.round((allTaken / allCompleted.length) * 100) : 0;

    // Pie chart data
    const allTakenCount = logs.filter((l) => l.status === "taken").length;
    const allMissedCount = logs.filter((l) => l.status === "missed").length;

    // Streak calculation: consecutive days with 100% adherence ending today
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      const dayLogs = logs.filter((l) => l.scheduled_date === d);
      const dayTotal = dayLogs.length;
      if (dayTotal === 0) break;
      const dayTaken = dayLogs.filter((l) => l.status === "taken").length;
      if (dayTaken === dayTotal) {
        streak++;
      } else {
        break;
      }
    }

    return {
      activeMeds: medications.filter((m) => m.is_active).length,
      taken,
      missed,
      pending,
      total,
      adherenceRate,
      streak,
      last7Days,
      pieData: [
        { name: "Taken", value: allTakenCount, color: "#10b981" },
        { name: "Missed", value: allMissedCount, color: "#ef4444" },
      ],
    };
  }, [medications, logs]);

  const statCards = useMemo(
    () => [
      {
        label: "Active Medications",
        value: stats.activeMeds,
        icon: Pill,
        color: "from-indigo-500 to-purple-500",
        bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
        textColor: "text-indigo-600 dark:text-indigo-400",
      },
      {
        label: "Taken Today",
        value: stats.taken,
        icon: CheckCircle2,
        color: "from-emerald-500 to-teal-500",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
        textColor: "text-emerald-600 dark:text-emerald-400",
      },
      {
        label: "Missed Today",
        value: stats.missed,
        icon: XCircle,
        color: "from-red-500 to-rose-500",
        bgColor: "bg-red-50 dark:bg-red-950/30",
        textColor: "text-red-600 dark:text-red-400",
      },
      {
        label: "Adherence Rate",
        value: `${stats.adherenceRate}%`,
        icon: TrendingUp,
        color: "from-amber-500 to-orange-500",
        bgColor: "bg-amber-50 dark:bg-amber-950/30",
        textColor: "text-amber-600 dark:text-amber-400",
      },
    ],
    [stats]
  );

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  // Dashboard skeleton during data loading
  if (loadingData) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div>
          <div className="skeleton h-8 w-48 mb-2" />
          <div className="skeleton h-5 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-card border border-border p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="skeleton h-4 w-24 mb-3" />
                  <div className="skeleton h-9 w-16" />
                </div>
                <div className="skeleton h-12 w-12 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
        <div className="skeleton h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-72 w-full rounded-2xl" />
          <div className="skeleton h-72 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {greeting}{profile?.name ? `, ${profile.name}` : ""} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
          {stats.streak > 0 && (
            <span className="ml-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              🔥 {stats.streak} day streak
            </span>
          )}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative overflow-hidden rounded-2xl bg-card border border-border p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  <AnimatedStatValue value={card.value} />
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
            <div
              className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${card.color} opacity-80`}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Today's Medications */}
      <motion.div variants={itemVariants}>
        <TodaysMedications />
      </motion.div>

      {/* Empty State Onboarding */}
      {stats.activeMeds === 0 && (
        <motion.div variants={itemVariants} className="rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-primary/20 p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Pill className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Welcome to MedTrack! 🎉</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get started by adding your first medication. You&apos;ll receive smart reminders and see your adherence improve over time.
          </p>
          <Link
            href="/medications"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
          >
            <Pill className="w-5 h-5" />
            Add Your First Medication
          </Link>
        </motion.div>
      )}

      {/* Charts Section */}
      <motion.div variants={itemVariants}>
        <AdherenceCharts
          lineData={stats.last7Days}
          pieData={stats.pieData}
        />
      </motion.div>

      {/* Notification Feed */}
      <motion.div variants={itemVariants}>
        <NotificationFeed />
      </motion.div>
    </motion.div>
  );
}
