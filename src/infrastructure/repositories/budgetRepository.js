import { supabase } from '../supabaseClient';

export const fetchBudgetsByUserId = async (userId) => {
    let query = supabase
        .from('budgets')
        .select(`
            *,
            categories ( category_name )
        `)
        .order('start_date', { ascending: false });

    if (userId) {
        query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching budgets:', error);
        throw error;
    }

    return data;
};
