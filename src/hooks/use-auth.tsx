import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
export type AppRole = "admin" | "instructor" | "student";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  instructorCourseIds: string[];
  isAdmin: boolean;
  isInstructor: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  session: null,
  user: null,
  profile: null,
  roles: [],
  instructorCourseIds: [],
  isAdmin: false,
  isInstructor: false,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [instructorCourseIds, setInstructorCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const clearDerivedState = useCallback(() => {
    setProfile(null);
    setRoles([]);
    setInstructorCourseIds([]);
  }, []);

  const loadProfile = useCallback(async (userId: string) => {
    const [{ data: prof }, { data: roleRows }, { data: ciRows }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("course_instructors").select("course_id").eq("instructor_id", userId),
    ]);
    setProfile(prof ?? null);
    setRoles((roleRows ?? []).map((r) => r.role as AppRole));
    setInstructorCourseIds((ciRows ?? []).map((c) => c.course_id));
  }, []);

  useEffect(() => {
    let active = true;

    const applySession = (nextSession: Session | null) => {
      if (!active) return;

      setSession(nextSession);
      setLoading(false);

      if (nextSession?.user) {
        setTimeout(() => {
          void loadProfile(nextSession.user.id).catch(() => {
            if (!active) return;
            clearDerivedState();
          });
        }, 0);
        return;
      }

      clearDerivedState();
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, nextSession) => {
      applySession(nextSession);
    });

    void supabase.auth.getSession()
      .then(({ data }) => {
        applySession(data.session);
      })
      .catch(() => {
        applySession(null);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [clearDerivedState, loadProfile]);

  const value: AuthCtx = {
    session,
    user: session?.user ?? null,
    profile,
    roles,
    instructorCourseIds,
    isAdmin: roles.includes("admin"),
    isInstructor: roles.includes("instructor"),
    loading,
    refreshProfile: async () => {
      if (session?.user) await loadProfile(session.user.id);
    },
    signOut: async () => {
      await supabase.auth.signOut();
      clearDerivedState();
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
