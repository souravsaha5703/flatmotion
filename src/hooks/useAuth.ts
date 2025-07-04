import { useState, useEffect } from "react";
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/supabase/supabaseConfig';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
        const getInitialSession = async () => {
            try {
                const { data, error } = await supabase.auth.getSession()
                if (error) {
                    console.error('Error getting initial session:', error)
                } else {
                    setSession(data.session)
                    setUser(session?.user ?? null)
                }
            } catch (error) {
                console.error('Error in getInitialSession:', error)
            }
        }

        getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log('Auth state changed:', event, session?.user?.email)
                setSession(session)
                setUser(session?.user ?? null)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, []);

    return { user, session, setSession };
}