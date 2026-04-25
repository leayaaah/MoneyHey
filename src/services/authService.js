import { supabase } from '../config/supabase'

export const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

export const signOut = () => supabase.auth.signOut()

export const setSession = (session) => supabase.auth.setSession(session)

export const getUser = () => supabase.auth.getUser()
