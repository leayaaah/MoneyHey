import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vpztqqjlbtoszfomvshx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwenRxcWpsYnRvc3pmb212c2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MzU0NTAsImV4cCI6MjA5MDAxMTQ1MH0.sKE7seUV-fhkX1Fj2Cpu7ojAokhGk9iUt3OBoXz4-uE'
const rememberKey = 'moneyhey_remember'

const resolveStorage = () =>
    localStorage.getItem(rememberKey) ? localStorage : sessionStorage

const authStorage = {
    getItem: (key) => resolveStorage().getItem(key),
    setItem: (key, value) => resolveStorage().setItem(key, value),
    removeItem: (key) => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
    }
}

export const setRememberSession = (shouldRemember) => {
    if (shouldRemember) {
        localStorage.setItem(rememberKey, 'true')
    } else {
        localStorage.removeItem(rememberKey)
    }
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        storage: authStorage
    }
})
