import { getUser, setSession, signInWithPassword, signOut } from '../../infrastructure/repositories/authRepository'

export const signIn = (email, password) => signInWithPassword(email, password)

export { signOut, setSession, getUser }
