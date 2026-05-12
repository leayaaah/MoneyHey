import { getUser, setSession, signInWithPassword, signOut } from '../../infrastructure/repositories/authRepository'
import { setRememberSession } from '../../infrastructure/supabaseClient'

export const signIn = (email, password) => signInWithPassword(email, password)

export { signOut, setSession, getUser, setRememberSession }
