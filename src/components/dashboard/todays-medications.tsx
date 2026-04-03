"use client";

import React, { useMemo, useState } from "react";
import { useData } from "@/components/providers/auth-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Pill, Send, Calendar, Sparkles } from "lucide-react";
import { playSound, formatTime, cn } from "@/lib/utils";
import toast from "react-hot-toast";

// Confetti particle component for success animation
function ConfettiParticle({ delay, x }: { delay: number; x: number }) {
  const colors = ["#10b981", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return (
    <motion.div
      initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
      animate={{ y: [0, -20, 40], x: [0, x], opacity: [1, 1, 0], scale: [1, 1.2, 0.5] }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full pointer-events-none"
      style={{ backgroundColor: color }}
    />
  );
}

export function TodaysMedications() {
  const { user } = useAuth();
  const { medications, logs, refreshLogs, refreshNotifications } = useData();
  const supabase = createClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const [celebratingId, setCelebratingId] = useState<string | null>(null);

  const todaysMeds = useMemo(() => {
    
    // Parse "YYYY-MM-DD" as local midnight (not UTC)
    const parseLocal = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
    const nowDate = new Date();
    const todayLocal = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());

    const result = medications
      .filter((med) => {
        if (!med.is_active) {
          return false;
        }
        const start = parseLocal(med.start_date);
        if (start > todayLocal) {
          console.log(`[TodaysMedications] FILTER OUT "${med.name}" — start_date=${med.start_date} is future`);
          return false;
        }
        if (med.end_date && parseLocal(med.end_date) < todayLocal) {
          console.log(`[TodaysMedications] FILTER OUT "${med.name}" — end_date=${med.end_date} has passed`);
          return false;
        }
        return true;
      })
      .flatMap((med) =>
        med.times.map((time) => {
          const log = logs.find(
            (l) =>
              l.medication_id === med.id &&
              l.scheduled_date === today &&
              l.scheduled_time === time
          );
          return {
            medication: med,
            time,
            log,
            status: log?.status || "upcoming",
          };
        })
      )
      .sort((a, b) => a.time.localeCompare(b.time));


    return result;
  }, [medications, logs, today]);

  const completionPercent = useMemo(() => {
    if (todaysMeds.length === 0) return 0;
    const taken = todaysMeds.filter((m) => m.status === "taken").length;
    return Math.round((taken / todaysMeds.length) * 100);
  }, [todaysMeds]);

  const markAsTaken = async (medId: string, time: string, logId?: string) => {
    if (!user) return;
    const itemKey = `${medId}-${time}`;

    try {
      if (logId) {
        await supabase
          .from("medication_logs")
          .update({ status: "taken", taken_at: new Date().toISOString() })
          .eq("id", logId);
      } else {
        await supabase.from("medication_logs").insert({
          medication_id: medId,
          scheduled_date: today,
          scheduled_time: time,
          status: "taken",
          taken_at: new Date().toISOString(),
        });
      }

      // Trigger celebration animation
      setCelebratingId(itemKey);
      setTimeout(() => setCelebratingId(null), 1200);

      playSound("complete");
      toast.success("Marked as taken! 🎉");
      refreshLogs();
    } catch {
      toast.error("Failed to update");
    }
  };

  const markAsMissed = async (medId: string, time: string, logId?: string) => {
    if (!user) return;

    try {
      if (logId) {
        await supabase
          .from("medication_logs")
          .update({ status: "missed" })
          .eq("id", logId);
      } else {
        await supabase.from("medication_logs").insert({
          medication_id: medId,
          scheduled_date: today,
          scheduled_time: time,
          status: "missed",
        });
      }

      toast("Marked as missed", { icon: "😔" });
      refreshLogs();
    } catch {
      toast.error("Failed to update");
    }
  };

  const sendWhatsAppDemo = async (medName: string, medId: string) => {
    if (!user) return;

    await supabase.from("notification_logs").insert({
      medication_id: medId,
      type: "whatsapp",
      message: `WhatsApp Reminder: Time to take ${medName}`,
      status: "demo",
    });

    toast.success("WhatsApp reminder sent (Demo)", { icon: "📱" });
    refreshNotifications();
  };

  if (todaysMeds.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border p-8 text-center card-hover">
        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Pill className="w-8 h-8 text-primary/60" />
          </motion.div>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No medications scheduled today
        </h3>
        <p className="text-muted-foreground text-sm max-w-[260px] mx-auto">
          Add medications to start tracking your daily schedule and stay on top of your health.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden card-hover">
      {/* Header with progress bar */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Today&apos;s Schedule</h3>
              <p className="text-xs text-muted-foreground">
                {todaysMeds.filter((m) => m.status === "taken").length} of{" "}
                {todaysMeds.length} completed
              </p>
            </div>
          </div>
          {completionPercent === 100 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1 bg-success/10 rounded-full"
            >
              <Sparkles className="w-3.5 h-3.5 text-success" />
              <span className="text-xs font-semibold text-success">All Done!</span>
            </motion.div>
          )}
        </div>
        {/* Progress bar */}
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-success rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="divide-y divide-border">
        {todaysMeds.map((item, i) => {
          const itemKey = `${item.medication.id}-${item.time}`;
          const isCelebrating = celebratingId === itemKey;

          return (
            <motion.div
              key={itemKey}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "flex items-center justify-between px-6 py-4 transition-colors relative",
                item.status === "taken" && "bg-success/5",
                item.status === "missed" && "bg-destructive/5"
              )}
            >
              {/* Confetti particles on success */}
              <AnimatePresence>
                {isCelebrating && (
                  <>
                    {Array.from({ length: 8 }).map((_, idx) => (
                      <ConfettiParticle
                        key={idx}
                        delay={idx * 0.05}
                        x={(Math.random() - 0.5) * 60}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    item.status === "taken"
                      ? "bg-success/10"
                      : item.status === "missed"
                      ? "bg-destructive/10"
                      : "bg-primary/10"
                  )}
                >
                  {item.status === "taken" ? (
                    <motion.div
                      initial={isCelebrating ? { scale: 0, rotate: -180 } : false}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </motion.div>
                  ) : item.status === "missed" ? (
                    <XCircle className="w-5 h-5 text-destructive" />
                  ) : (
                    <Clock className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {item.medication.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.medication.dosage} · {formatTime(item.time)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(item.status === "pending" || item.status === "upcoming") && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        markAsTaken(
                          item.medication.id,
                          item.time,
                          item.log?.id
                        )
                      }
                      className="px-3 py-1.5 text-xs font-medium bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors"
                    >
                      Taken
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        markAsMissed(
                          item.medication.id,
                          item.time,
                          item.log?.id
                        )
                      }
                      className="px-3 py-1.5 text-xs font-medium bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                    >
                      Missed
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        sendWhatsAppDemo(
                          item.medication.name,
                          item.medication.id
                        )
                      }
                      className="px-3 py-1.5 text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-500/20 transition-colors flex items-center gap-1.5"
                      title="Send WhatsApp Reminder (Demo)"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </motion.button>
                  </>
                )}
                {item.status === "taken" && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs font-medium text-success px-3 py-1.5 bg-success/10 rounded-lg flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Taken
                  </motion.span>
                )}
                {item.status === "missed" && (
                  <span className="text-xs font-medium text-destructive px-3 py-1.5 bg-destructive/10 rounded-lg">
                    ✗ Missed
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
