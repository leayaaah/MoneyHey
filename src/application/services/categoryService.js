import { addCategory, getCategories } from "../../infrastructure/repositories/categoryRepository";

export const fetchCategories = async () => {
    return await getCategories();
};

const normalizeCategoryType = (value) => {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    if (!['expense', 'income'].includes(value)) {
        throw new Error('Category type must be "expense", "income", or empty');
    }

    return value;
};

export const createCategory = async (input) => {
    const categoryName = typeof input === 'string' ? input : input?.categoryName;
    const txType = typeof input === 'string' ? null : normalizeCategoryType(input?.txType);
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
