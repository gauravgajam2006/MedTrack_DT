"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import type { UserProfile, Medication, MedicationLog, NotificationLog } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  signInWithGoogle: async () => {},
  refreshProfile: async () => {},
});

interface DataContextType {
  medications: Medication[];
  logs: MedicationLog[];
  notifications: NotificationLog[];
  loadingData: boolean;
  refreshMedications: () => Promise<void>;
  refreshLogs: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  medications: [],
  logs: [],
  notifications: [],
  loadingData: true,
  refreshMedications: async () => {},
  refreshLogs: async () => {},
  refreshNotifications: async () => {},
  refreshAll: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const fetchingRef = useRef(false);

  const fetchProfile = useCallback(
    async (userId: string) => {
      if (fetchingRef.current) {
        console.log("[MEDTRACK_DEBUG][AuthProvider] fetchProfile SKIPPED — already fetching");
        return;
      }
      fetchingRef.current = true;
      console.log(`[MEDTRACK_DEBUG][AuthProvider] fetchProfile START for userId=${userId}`);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();
        if (error) {
          console.warn("[MEDTRACK_DEBUG][AuthProvider] Profile fetch FAILED:", error.message, "| code:", error.code);
        }
        if (data) {
          console.log("[MEDTRACK_DEBUG][AuthProvider] Profile LOADED:", { id: data.id, name: data.name });
          setProfile(data);
        } else {
          console.warn("[MEDTRACK_DEBUG][AuthProvider] Profile fetch returned NULL data (no error)");
        }
      } catch (err) {
        console.warn("[MEDTRACK_DEBUG][AuthProvider] Profile fetch EXCEPTION:", err);
      } finally {
        fetchingRef.current = false;
      }
    },
    [supabase]
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      console.log("[MEDTRACK_DEBUG][AuthProvider] init() — getting session...");
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        console.log(`[MEDTRACK_DEBUG][AuthProvider] Session result: user=${currentUser?.id ?? 'NULL'}, email=${currentUser?.email ?? 'N/A'}`);
        if (mounted && currentUser) {
          setUser(currentUser);
          fetchProfile(currentUser.id);
        } else if (mounted && !currentUser) {
          console.log("[MEDTRACK_DEBUG][AuthProvider] No active session — user is logged out");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [supabase]);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      fetchingRef.current = false; // Reset mutex so profile can be re-fetched
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const authValue = useMemo(
    () => ({ user, profile, loading, signOut, signInWithGoogle, refreshProfile }),
    [user, profile, loading, signOut, signInWithGoogle, refreshProfile]
  );

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const supabase = createClient();
  const initialLoadDone = useRef(false);

  const refreshMedications = useCallback(async () => {
    if (!user) {
      console.log("[MEDTRACK_DEBUG][DataProvider] refreshMedications SKIPPED — no user");
      return;
    }
    console.log(`[MEDTRACK_DEBUG][DataProvider] refreshMedications START for userId=${user.id}`);
    try {
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("[MEDTRACK_DEBUG][DataProvider] Medications fetch FAILED:", error.message, "| code:", error.code);
        return;
      }
      console.log(`[MEDTRACK_DEBUG][DataProvider] Medications LOADED: ${data?.length ?? 0} rows`, data?.map((m: Medication) => ({ id: m.id, name: m.name, is_active: m.is_active, times: m.times })));
      if (data) setMedications(data);
    } catch (err) {
      console.error("[MEDTRACK_DEBUG][DataProvider] Medications fetch EXCEPTION:", err);
    }
  }, [user, supabase]);

  const refreshLogs = useCallback(async () => {
    if (!user) {
      console.log("[MEDTRACK_DEBUG][DataProvider] refreshLogs SKIPPED — no user");
      return;
    }
    console.log(`[MEDTRACK_DEBUG][DataProvider] refreshLogs START for userId=${user.id}`);
    try {
      const { data, error } = await supabase
        .from("medication_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_date", { ascending: false })
        .limit(500);
      if (error) {
        console.error("[MEDTRACK_DEBUG][DataProvider] Logs fetch FAILED:", error.message, "| code:", error.code);
        return;
      }
      const todayStr = new Date().toISOString().split('T')[0];
      const todayLogs = data?.filter((l: MedicationLog) => l.scheduled_date === todayStr) ?? [];
      console.log(`[MEDTRACK_DEBUG][DataProvider] Logs LOADED: ${data?.length ?? 0} total, ${todayLogs.length} today`, todayLogs.map((l: MedicationLog) => ({ id: l.id, med_id: l.medication_id, time: l.scheduled_time, status: l.status })));
      if (data) setLogs(data);
    } catch (err) {
      console.error("[MEDTRACK_DEBUG][DataProvider] Logs fetch EXCEPTION:", err);
    }
  }, [user, supabase]);

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      console.log("[MEDTRACK_DEBUG][DataProvider] refreshNotifications SKIPPED — no user");
      return;
    }
    console.log(`[MEDTRACK_DEBUG][DataProvider] refreshNotifications START for userId=${user.id}`);
    try {
      const { data, error } = await supabase
        .from("notification_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) {
        console.error("[MEDTRACK_DEBUG][DataProvider] Notifications fetch FAILED:", error.message, "| code:", error.code);
        return;
      }
      console.log(`[MEDTRACK_DEBUG][DataProvider] Notifications LOADED: ${data?.length ?? 0} rows`);
      if (data) setNotifications(data);
    } catch (err) {
      console.error("[MEDTRACK_DEBUG][DataProvider] Notifications fetch EXCEPTION:", err);
    }
  }, [user, supabase]);

  // refreshAll is ONLY for the initial load — individual refreshes are never blocked
  const refreshAll = useCallback(async () => {
    if (!user) {
      console.log("[MEDTRACK_DEBUG][DataProvider] refreshAll SKIPPED — no user");
      return;
    }
    console.log(`[MEDTRACK_DEBUG][DataProvider] refreshAll START for userId=${user.id}`);
    const startTime = performance.now();
    setLoadingData(true);
    try {
      await Promise.all([refreshMedications(), refreshLogs(), refreshNotifications()]);
    } finally {
      const elapsed = Math.round(performance.now() - startTime);
      console.log(`[MEDTRACK_DEBUG][DataProvider] refreshAll COMPLETE in ${elapsed}ms`);
      setLoadingData(false);
      initialLoadDone.current = true;
    }
  }, [user, refreshMedications, refreshLogs, refreshNotifications]);

  // Initial data load when user changes
  useEffect(() => {
    if (user) {
      console.log(`[MEDTRACK_DEBUG][DataProvider] User changed → triggering refreshAll. userId=${user.id}`);
      initialLoadDone.current = false;
      refreshAll();
    } else {
      console.log("[MEDTRACK_DEBUG][DataProvider] User is null → clearing all data");
      setMedications([]);
      setLogs([]);
      setNotifications([]);
      setLoadingData(false);
      initialLoadDone.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Realtime subscriptions for all relevant tables
  useEffect(() => {
    if (!user) return;

    console.log(`[MEDTRACK_DEBUG][DataProvider] Setting up realtime subscriptions for userId=${user.id}`);

    const channel = supabase
      .channel(`realtime-data-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "medication_logs",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: { eventType: string; new: unknown }) => {
          console.log("[MEDTRACK_DEBUG][Realtime] medication_logs changed:", payload.eventType, payload.new);
          refreshLogs();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "medications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: { eventType: string; new: unknown }) => {
          console.log("[MEDTRACK_DEBUG][Realtime] medications changed:", payload.eventType, payload.new);
          refreshMedications();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notification_logs",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: { eventType: string; new: unknown }) => {
          console.log("[MEDTRACK_DEBUG][Realtime] notification_logs changed:", payload.eventType, payload.new);
          refreshNotifications();
        }
      )
      .subscribe((status: string) => {
        console.log(`[MEDTRACK_DEBUG][Realtime] Subscription status: ${status}`);
      });

    return () => {
      console.log("[MEDTRACK_DEBUG][Realtime] Removing channel");
      supabase.removeChannel(channel);
    };
  }, [user, supabase, refreshLogs, refreshMedications, refreshNotifications]);

  const dataValue = useMemo(
    () => ({
      medications,
      logs,
      notifications,
      loadingData,
      refreshMedications,
      refreshLogs,
      refreshNotifications,
      refreshAll,
    }),
    [
      medications,
      logs,
      notifications,
      loadingData,
      refreshMedications,
      refreshLogs,
      refreshNotifications,
      refreshAll,
    ]
  );

  return (
    <DataContext.Provider value={dataValue}>
      {children}
    </DataContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useData() {
  return useContext(DataContext);
}
