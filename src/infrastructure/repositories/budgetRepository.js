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

export const getBudgetById = async (budgetId) => {
    const { data, error } = await supabase
        .from('budgets')
        .select(`
            *,
            categories ( category_name )
        `)
        .eq('budget_id', budgetId)
        .single();

    if (error) {
        console.error('Error fetching budget:', error);
        throw error;
    }

    return data;
};

export const addBudget = async (budget) => {
    const { data, error } = await supabase
        .from('budgets')
        .insert(budget)
        .select()
        .single();

    if (error) {
        console.error('Error adding budget:', error);
        throw error;
    }

    return data;
};

export const updateBudgetById = async (budgetId, budget) => {
    const { data, error } = await supabase
        .from('budgets')
        .update(budget)
        .eq('budget_id', budgetId)
        .select()
        .single();

    if (error) {
        console.error('Error updating budget:', error);
        throw error;
    }

    return data;
};

export const deleteBudgetById = async (budgetId) => {
    const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('budget_id', budgetId);

    if (error) {
        console.error('Error deleting budget:', error);
        throw error;
    }
};
