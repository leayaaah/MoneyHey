import { supabase } from '../config/supabase'
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