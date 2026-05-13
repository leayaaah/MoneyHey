import { addCategory, getCategories } from "../../infrastructure/repositories/categoryRepository";

export const fetchCategories = async () => {
    return await getCategories();
};

export const createCategory = async (input) => {
    const categoryName = typeof input === 'string' ? input : input?.categoryName;
    const txType = typeof input === 'string' ? 'expense' : input?.txType || 'expense';
    const normalizedName = String(categoryName || '').trim();

    if (!normalizedName) {
        throw new Error('Category name is required');
    }

    return await addCategory({
        category_name: normalizedName,
        tx_type: txType,
        is_active: true
    });
};
