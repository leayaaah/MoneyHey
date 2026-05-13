import { supabase } from '../supabaseClient'
export const getCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
    if (error) {
        console.error('Error fetching categories:', error)
        throw error
    }  
    return data
}

export const addCategory = async (category) => {
    const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single()
    if (error) {
        console.error('Error adding category:', error)
        throw error
    }
    return data
}
