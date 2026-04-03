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
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();
        if (error) {
          console.warn("[AuthProvider] Profile fetch failed:", error.message);
        }
        if (data) setProfile(data);
      } catch (err) {
        console.warn("[AuthProvider] Profile may not exist yet:", err);
      } finally {
        fetchingRef.current = false;
      }
    },
    [supabase]
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        if (mounted && currentUser) {
          setUser(currentUser);
          fetchProfile(currentUser.id);
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
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("[DataProvider] Failed to fetch medications:", error.message);
        return;
      }
      if (data) setMedications(data);
    } catch (err) {
      console.error("[DataProvider] Medications fetch error:", err);
    }
  }, [user, supabase]);

  const refreshLogs = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("medication_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_date", { ascending: false })
        .limit(500);
      if (error) {
        console.error("[DataProvider] Failed to fetch logs:", error.message);
        return;
      }
      if (data) setLogs(data);
    } catch (err) {
      console.error("[DataProvider] Logs fetch error:", err);
    }
  }, [user, supabase]);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("notification_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) {
        console.error("[DataProvider] Failed to fetch notifications:", error.message);
        return;
      }
      if (data) setNotifications(data);
    } catch (err) {
      console.error("[DataProvider] Notifications fetch error:", err);
    }
  }, [user, supabase]);

  // refreshAll is ONLY for the initial load — individual refreshes are never blocked
  const refreshAll = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      await Promise.all([refreshMedications(), refreshLogs(), refreshNotifications()]);
    } finally {
      setLoadingData(false);
      initialLoadDone.current = true;
    }
  }, [user, refreshMedications, refreshLogs, refreshNotifications]);

  // Initial data load when user changes
  useEffect(() => {
    if (user) {
      initialLoadDone.current = false;
      refreshAll();
    } else {
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
        () => {
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
        () => {
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
        () => {
          refreshNotifications();
        }
      )
      .subscribe();

    return () => {
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
