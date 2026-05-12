import { getCategories } from "../../infrastructure/repositories/categoryRepository";

export const fetchCategories = async () => {
    return await getCategories();
};
