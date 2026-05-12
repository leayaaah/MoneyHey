import { supabase } from '../supabaseClient';

export const fetchProfileByUserId = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_img')
        .eq('user_id', userId)
        .single();
    if (error) throw error;
    return data;
};
