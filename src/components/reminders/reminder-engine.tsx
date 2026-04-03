"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth, useData } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { playSound } from "@/lib/utils";
import { format } from "date-fns";
import toast from "react-hot-toast";

export function ReminderEngine() {
  const { user, profile } = useAuth();
  const { medications, refreshLogs, refreshNotifications } = useData();
  const supabase = createClient();
  const checkedRef = useRef<Set<string>>(new Set());
  const lastCleanupDateRef = useRef<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const missedIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup stale entries from checkedRef when the date changes
  const cleanupCheckedRef = useCallback(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    if (lastCleanupDateRef.current && lastCleanupDateRef.current !== today) {
      checkedRef.current.clear();
    }
    lastCleanupDateRef.current = today;
  }, []);

  const checkReminders = useCallback(async () => {
    if (!user || medications.length === 0) return;

    cleanupCheckedRef();

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const today = format(now, "yyyy-MM-dd");

    for (const med of medications) {
      if (!med.is_active) continue;

      const startDate = new Date(med.start_date);
      if (startDate > now) continue;
      if (med.end_date && new Date(med.end_date) < now) continue;

      for (const time of med.times) {
        const key = `${med.id}-${today}-${time}`;
        if (checkedRef.current.has(key)) continue;

        // Check if the scheduled time is within a 2-minute window
        const [schedH, schedM] = time.split(":").map(Number);
        const schedMinutes = schedH * 60 + schedM;
        const diff = nowMinutes - schedMinutes;

        // Fire if current time is 0-1 minutes past the scheduled time
        if (diff >= 0 && diff <= 1) {
          checkedRef.current.add(key);

          // Check if log already exists
          const { data: existingLog } = await supabase
            .from("medication_logs")
            .select("id")
            .eq("medication_id", med.id)
            .eq("scheduled_date", today)
            .eq("scheduled_time", time)
            .maybeSingle();

          if (!existingLog) {
            try {
              // Create pending log
              const { error: logError } = await supabase.from("medication_logs").insert({
                medication_id: med.id,
                user_id: user.id,
                scheduled_date: today,
                scheduled_time: time,
                status: "pending",
              });

              if (logError) {
                console.error("[ReminderEngine] Failed to create medication log:", logError.message);
              }

              // Create notification log
              const { error: notifError } = await supabase.from("notification_logs").insert({
                user_id: user.id,
                medication_id: med.id,
                type: "reminder",
                message: `Time to take ${med.name} (${med.dosage})`,
                status: "sent",
              });

              if (notifError) {
                console.error("[ReminderEngine] Failed to create notification:", notifError.message);
              }
              
              refreshLogs();
              refreshNotifications();
            } catch (err) {
              console.error("[ReminderEngine] Failed to sync reminder to DB, showing local fallback", err);
            } finally {
              // Always play sound and show toast as fallback
              playSound("reminder");
              toast(`💊 Time to take ${med.name} (${med.dosage})`, {
                duration: 10000,
                icon: "⏰",
                style: {
                  background: "var(--card)",
                  color: "var(--foreground)",
                  border: "2px solid var(--primary)",
                },
              });
            }
          }
        }
      }
    }
  }, [user, medications, supabase, refreshLogs, refreshNotifications, cleanupCheckedRef]);

  // Auto-mark as missed: check for pending logs older than 2 hours
  const checkMissed = useCallback(async () => {
    if (!user) return;

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const today = format(new Date(), "yyyy-MM-dd");

    try {
      const { data: pendingLogs, error } = await supabase
        .from("medication_logs")
        .select("*, medications(name, dosage)")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .eq("scheduled_date", today);

      if (error) {
        console.error("[ReminderEngine] Failed to fetch pending logs:", error.message);
        return;
      }

      if (!pendingLogs) return;

      for (const log of pendingLogs) {
        const [h, m] = log.scheduled_time.split(":").map(Number);
        const scheduledAt = new Date();
        scheduledAt.setHours(h, m, 0, 0);

        if (scheduledAt < twoHoursAgo) {
          await supabase
            .from("medication_logs")
            .update({ status: "missed" })
            .eq("id", log.id);

          // Guardian/Doctor notification (demo)
          if (profile?.guardian_contact) {
            await supabase.from("notification_logs").insert({
              user_id: user.id,
              medication_id: log.medication_id,
              type: "guardian",
              message: `Missed dose alert: ${(log as Record<string, unknown>).medications ? ((log as Record<string, unknown>).medications as Record<string, string>).name : "Medication"} was not taken on time.`,
              status: "demo",
            });
          }

          if (profile?.doctor_contact) {
            await supabase.from("notification_logs").insert({
              user_id: user.id,
              medication_id: log.medication_id,
              type: "doctor",
              message: `Patient missed dose: ${(log as Record<string, unknown>).medications ? ((log as Record<string, unknown>).medications as Record<string, string>).name : "Medication"}`,
              status: "demo",
            });
          }

          refreshLogs();
          refreshNotifications();
        }
      }
    } catch (err) {
      console.error("[ReminderEngine] checkMissed error:", err);
    }
  }, [user, profile, supabase, refreshLogs, refreshNotifications]);

  useEffect(() => {
    if (!user) return;

    // Check immediately
    checkReminders();
    checkMissed();

    // Then check every 30 seconds
    intervalRef.current = setInterval(() => {
      checkReminders();
    }, 30000);

    // Check missed every 5 minutes
    missedIntervalRef.current = setInterval(() => {
      checkMissed();
    }, 300000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (missedIntervalRef.current) clearInterval(missedIntervalRef.current);
    };
  }, [user, checkReminders, checkMissed]);

  return null;
}

