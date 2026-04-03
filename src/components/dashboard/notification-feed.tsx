"use client";

import React from "react";
import { useData } from "@/components/providers/auth-provider";
import { motion } from "framer-motion";
import { Bell, MessageCircle, Phone, Send, Clock, Info } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

const typeConfig: Record<string, { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string; bg: string; label: string }> = {
  reminder: {
    icon: Bell,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    label: "Reminder",
  },
  guardian: {
    icon: Phone,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    label: "Guardian Alert",
  },
  doctor: {
    icon: MessageCircle,
    color: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-950/30",
    label: "Doctor Alert",
  },
  whatsapp: {
    icon: Send,
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/30",
    label: "WhatsApp",
  },
};

// Fallback config for unknown/future notification types
const fallbackConfig = {
  icon: Info,
  color: "text-muted-foreground",
  bg: "bg-muted",
  label: "Notification",
};

export function NotificationFeed() {
  const { notifications } = useData();

  const recent = notifications.slice(0, 20);

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden card-hover">
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Notification Log</h3>
          <p className="text-xs text-muted-foreground">
            Recent reminders and alerts
          </p>
        </div>
      </div>

      {recent.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Bell className="w-8 h-8 text-muted-foreground/50" />
            </motion.div>
          </div>
          <h4 className="text-sm font-medium text-foreground mb-1">No notifications yet</h4>
          <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
            They&apos;ll appear here when your medication reminders fire.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border max-h-96 overflow-y-auto">
          {recent.map((notif, i) => {
            const config = typeConfig[notif.type] || fallbackConfig;
            const Icon = config.icon;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors"
              >
                <div className={cn("p-2 rounded-xl", config.bg)}>
                  <Icon className={cn("w-4 h-4", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      {config.label}
                    </span>
                    {notif.status === "demo" && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-md">
                        DEMO
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground truncate">
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(parseISO(notif.created_at), "MMM d, h:mm a")}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
