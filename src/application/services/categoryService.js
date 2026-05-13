import { addCategory, getCategories } from "../../infrastructure/repositories/categoryRepository";

export const fetchCategories = async () => {
    return await getCategories();
};

export const createCategory = async (categoryName) => {
    const normalizedName = String(categoryName || '').trim();

    if (!normalizedName) {
        throw new Error('Category name is required');
    }

    return await addCategory({
        category_name: normalizedName
    });
};
