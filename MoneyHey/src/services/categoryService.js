import { getCategories } from "../api/categoryRepo";

export const fetchCategories = async () => {
    return await getCategories();
};
