"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth, useData } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { playSound } from "@/lib/utils";
import { format } from "date-fns";
import toast from "react-hot-toast";

/**
 * Parse a "YYYY-MM-DD" date string as LOCAL midnight (not UTC).
 * `new Date("2026-04-04")` produces midnight UTC, which is wrong
 * for timezone-ahead users (e.g. IST = UTC+5:30).
 * This function produces midnight in the browser's local timezone.
 */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d); // months are 0-indexed
}

export function ReminderEngine() {
  const { user, profile } = useAuth();
  const { medications, refreshLogs, refreshNotifications } = useData();
  const supabase = createClient();
  const checkedRef = useRef<Set<string>>(new Set());
  const lastCleanupDateRef = useRef<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const missedIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── Refs that always hold the latest callback versions ──
  // This prevents stale closures inside setInterval callbacks.
  // The interval never tears down/recreates — it always calls
  // the ref, which points to the latest version of the function.
  const checkRemindersRef = useRef<() => Promise<void>>(async () => {});
  const checkMissedRef = useRef<() => Promise<void>>(async () => {});

  // Cleanup stale entries from checkedRef when the date changes
  const cleanupCheckedRef = useCallback(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    if (lastCleanupDateRef.current && lastCleanupDateRef.current !== today) {
      checkedRef.current.clear();
    }
    lastCleanupDateRef.current = today;
  }, []);

  const checkReminders = useCallback(async () => {
    if (!user) {
      return;
    }
    if (medications.length === 0) {
      console.log("[ReminderEngine] checkReminders — 0 medications in state");
      return;
    }

    cleanupCheckedRef();

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const today = format(now, "yyyy-MM-dd");

    console.log(`[ReminderEngine] ──── TICK ──── now=${now.toLocaleTimeString()} (${nowMinutes} min), today=${today}, meds=${medications.length}, checked=${checkedRef.current.size}`);

    for (const med of medications) {
      if (!med.is_active) {
        continue;
      }

      // ── FIX: Compare dates in LOCAL timezone, not UTC ──
      // Previously: `new Date(med.start_date)` produced midnight UTC,
      // causing meds created "today" in UTC+ timezones to be skipped
      // until UTC midnight catches up (e.g., 5:30 AM IST).
      const startLocal = parseLocalDate(med.start_date);
      const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (startLocal > todayLocal) {
        console.log(`[ReminderEngine]   SKIP "${med.name}" — start_date=${med.start_date} is in the future`);
        continue;
      }

      if (med.end_date) {
        const endLocal = parseLocalDate(med.end_date);
        if (endLocal < todayLocal) {
          console.log(`[ReminderEngine]   SKIP "${med.name}" — end_date=${med.end_date} has passed`);
          continue;
        }
      }

      for (const time of med.times) {
        const key = `${med.id}-${today}-${time}`;
        if (checkedRef.current.has(key)) {
          continue;
        }

        const [schedH, schedM] = time.split(":").map(Number);
        const schedMinutes = schedH * 60 + schedM;
        const diff = nowMinutes - schedMinutes;

        // Fire if current time is 0-2 minutes past the scheduled time.
        // Widened from 0-1 to account for the 30s interval granularity —
        // previously, a 1-minute window could be missed if the interval
        // tick landed at second 31 of the target minute.
        if (diff >= 0 && diff <= 2) {
          checkedRef.current.add(key);
          console.log(`[ReminderEngine]   🔔 MATCH "${med.name}" @${time} (diff=${diff}min)`);

          // Check if log already exists
          const { data: existingLog } = await supabase
            .from("medication_logs")
            .select("id")
            .eq("medication_id", med.id)
            .eq("scheduled_date", today)
            .eq("scheduled_time", time)
            .maybeSingle();

          if (existingLog) {
            console.log(`[ReminderEngine]   ⚠️ Log already exists for "${med.name}" @${time} — skipping`);
          } else {
            console.log(`[ReminderEngine]   🔔 FIRING REMINDER for "${med.name}" @${time}`);
            try {
              // Create pending log
              const { data: logData, error: logError } = await supabase.from("medication_logs").insert({
                medication_id: med.id,
                scheduled_date: today,
                scheduled_time: time,
                status: "pending",
              }).select();

              if (logError) {
                console.error(`[ReminderEngine]   ❌ medication_log INSERT FAILED:`, logError.message);
              } else {
                console.log(`[ReminderEngine]   ✅ medication_log INSERTED:`, logData);
              }

              // Create notification log
              const { data: notifData, error: notifError } = await supabase.from("notification_logs").insert({
                medication_id: med.id,
                type: "reminder",
                message: `Time to take ${med.name} (${med.dosage})`,
                status: "sent",
              }).select();

              if (notifError) {
                console.error(`[ReminderEngine]   ❌ notification_log INSERT FAILED:`, notifError.message);
              } else {
                console.log(`[ReminderEngine]   ✅ notification_log INSERTED:`, notifData);
              }
              
              refreshLogs();
              refreshNotifications();
            } catch (err) {
              console.error("[ReminderEngine]   ❌ EXCEPTION during reminder DB sync:", err);
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
    if (!user) {
      return;
    }

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
        console.error("[ReminderEngine] checkMissed FETCH FAILED:", error.message);
        return;
      }

      if (!pendingLogs) return;

      for (const log of pendingLogs) {
        const [h, m] = log.scheduled_time.split(":").map(Number);
        const scheduledAt = new Date();
        scheduledAt.setHours(h, m, 0, 0);

        if (scheduledAt < twoHoursAgo) {
          console.log(`[ReminderEngine]   → Marking as MISSED: ${log.id}`);
          await supabase
            .from("medication_logs")
            .update({ status: "missed" })
            .eq("id", log.id);

          // Guardian/Doctor notification (demo)
          if (profile?.guardian_contact) {
            await supabase.from("notification_logs").insert({
              medication_id: log.medication_id,
              type: "guardian",
              message: `Missed dose alert: ${(log as Record<string, unknown>).medications ? ((log as Record<string, unknown>).medications as Record<string, string>).name : "Medication"} was not taken on time.`,
              status: "demo",
            });
          }

          if (profile?.doctor_contact) {
            await supabase.from("notification_logs").insert({
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
      console.error("[ReminderEngine] checkMissed EXCEPTION:", err);
    }
  }, [user, profile, supabase, refreshLogs, refreshNotifications]);

  // ── Keep refs in sync with latest callbacks ──
  // This runs on every render, ensuring the interval functions
  // always call the most up-to-date version.
  useEffect(() => {
    checkRemindersRef.current = checkReminders;
  }, [checkReminders]);

  useEffect(() => {
    checkMissedRef.current = checkMissed;
  }, [checkMissed]);

  // ── When medications change, immediately check reminders ──
  // This ensures newly added medications are evaluated right away
  // without waiting for the next 30-second interval tick.
  const prevMedCountRef = useRef(medications.length);
  useEffect(() => {
    if (medications.length > prevMedCountRef.current && user) {
      console.log(`[ReminderEngine] 🆕 New medication detected (${prevMedCountRef.current} → ${medications.length}) — running immediate check`);
      // Small delay to ensure state is fully settled
      const timer = setTimeout(() => {
        checkRemindersRef.current();
      }, 500);
      prevMedCountRef.current = medications.length;
      return () => clearTimeout(timer);
    }
    prevMedCountRef.current = medications.length;
  }, [medications.length, user]);

  // ── Main interval setup — runs ONCE per user, never tears down on medication changes ──
  useEffect(() => {
    if (!user) {
      return;
    }

    console.log(`[ReminderEngine] Setting up intervals for userId=${user.id}`);

    // Initial check
    checkRemindersRef.current();
    checkMissedRef.current();

    // Check reminders every 30 seconds via ref (no stale closures)
    intervalRef.current = setInterval(() => {
      checkRemindersRef.current();
    }, 30000);

    // Check missed every 5 minutes
    missedIntervalRef.current = setInterval(() => {
      checkMissedRef.current();
    }, 300000);

    return () => {
      console.log("[ReminderEngine] Clearing intervals");
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (missedIntervalRef.current) clearInterval(missedIntervalRef.current);
    };
  // Only depend on user — the interval callbacks use refs that
  // always point to the latest version of the functions.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return null;
}
