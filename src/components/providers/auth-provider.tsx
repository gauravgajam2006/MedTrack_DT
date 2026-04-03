"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
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
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();
        if (data) setProfile(data);
      } catch {
        // Profile may not exist yet
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
          fetchProfile(currentUser.id); // don't await to speed up loading
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
        fetchProfile(currentUser.id); // don't await to speed up loading
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
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, signInWithGoogle, refreshProfile }}>
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
  const fetchingRef = useRef(false);

  const refreshMedications = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setMedications(data);
    } catch {
      // ignore
    }
  }, [user, supabase]);

  const refreshLogs = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("medication_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_date", { ascending: false })
        .limit(500);
      if (data) setLogs(data);
    } catch {
      // ignore
    }
  }, [user, supabase]);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("notification_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (data) setNotifications(data);
    } catch {
      // ignore
    }
  }, [user, supabase]);

  const refreshAll = useCallback(async () => {
    if (fetchingRef.current || !user) return;
    fetchingRef.current = true;
    setLoadingData(true);
    try {
      await Promise.all([refreshMedications(), refreshLogs(), refreshNotifications()]);
    } finally {
      setLoadingData(false);
      fetchingRef.current = false;
    }
  }, [user, refreshMedications, refreshLogs, refreshNotifications]);

  useEffect(() => {
    if (user) {
      refreshAll();
    } else {
      setMedications([]);
      setLogs([]);
      setNotifications([]);
      setLoadingData(false);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime subscription for medication_logs
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("realtime-logs")
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, refreshLogs]);

  return (
    <DataContext.Provider
      value={{
        medications,
        logs,
        notifications,
        loadingData,
        refreshMedications,
        refreshLogs,
        refreshNotifications,
        refreshAll,
      }}
    >
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
