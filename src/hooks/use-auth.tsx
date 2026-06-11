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

  const applyDerivedState = useCallback(
    (next: { profile: Profile | null; roles: AppRole[]; instructorCourseIds: string[] }) => {
      setProfile(next.profile);
      setRoles(next.roles);
      setInstructorCourseIds(next.instructorCourseIds);
    },
    [],
  );

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
    return {
      profile: prof ?? null,
      roles: (roleRows ?? []).map((r) => r.role as AppRole),
      instructorCourseIds: (ciRows ?? []).map((c) => c.course_id),
    };
  }, []);

  useEffect(() => {
    let active = true;
    let sessionVersion = 0;

    let initialSessionResolved = false;

    const applySession = (nextSession: Session | null, markReady: boolean) => {
      if (!active) return;

      const currentVersion = ++sessionVersion;

      setSession(nextSession);

      if (nextSession?.user) {
        // Keep loading=true until profile/roles are loaded for this session,
        // so consumers never see user-present with roles-empty (which would
        // briefly classify an admin as a student).
        void loadProfile(nextSession.user.id)
          .then((nextDerivedState) => {
            if (!active || currentVersion !== sessionVersion) return;
            applyDerivedState(nextDerivedState);
            if (markReady) initialSessionResolved = true;
            setLoading(false);
          })
          .catch(() => {
            if (!active || currentVersion !== sessionVersion) return;
            clearDerivedState();
            if (markReady) initialSessionResolved = true;
            setLoading(false);
          });
        return;
      }

      clearDerivedState();
      if (markReady) initialSessionResolved = true;
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, nextSession) => {
      // Do NOT mark ready here — wait for getSession() to settle so we never
      // briefly report `user = null` before the persisted session restores.
      applySession(nextSession, false);
    });

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        applySession(data.session, true);
      })
      .catch(() => {
        applySession(null, true);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [applyDerivedState, clearDerivedState, loadProfile]);

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
      if (session?.user) {
        const nextDerivedState = await loadProfile(session.user.id);
        applyDerivedState(nextDerivedState);
      }
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
