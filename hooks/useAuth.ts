"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { hasSupabaseEnv, supabase } from "../lib/supabase";

type AuthResult = { ok: true } | { ok: false; message: string };

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      if (!hasSupabaseEnv()) {
        setIsLoading(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setCurrentUser(data.session?.user ?? null);
      setIsLoading(false);
    }

    bootstrap();

    const { data: listener } = hasSupabaseEnv()
      ? supabase.auth.onAuthStateChange((_event, session) => {
          setCurrentUser(session?.user ?? null);
          setIsLoading(false);
        })
      : { data: { subscription: { unsubscribe: () => {} } } };

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      const cleanedName = name.trim();
      const cleanedEmail = email.trim().toLowerCase();
      const cleanedPassword = password.trim();

      if (!cleanedName || !cleanedEmail || cleanedPassword.length < 6) {
        return { ok: false, message: "Enter valid details. Password must be 6+ chars." };
      }
      if (!hasSupabaseEnv()) {
        return { ok: false, message: "Supabase env is missing. Configure it in .env.local first." };
      }

      const { error } = await supabase.auth.signUp({
        email: cleanedEmail,
        password: cleanedPassword,
        options: {
          data: {
            display_name: cleanedName,
          },
        },
      });

      if (error) {
        return { ok: false, message: error.message };
      }

      return { ok: true };
    },
    [],
  );

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!hasSupabaseEnv()) {
      return { ok: false, message: "Supabase env is missing. Configure it in .env.local first." };
    }
    const cleanedEmail = email.trim().toLowerCase();
    const cleanedPassword = password.trim();

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanedEmail,
      password: cleanedPassword,
    });
    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    if (!hasSupabaseEnv()) return;
    await supabase.auth.signOut();
  }, []);

  return {
    currentUser,
    isLoading,
    isLoggedIn: Boolean(currentUser),
    register,
    login,
    logout,
  };
}
