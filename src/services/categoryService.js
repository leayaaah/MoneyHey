import { getCategories } from "../repository/categoryRepo";

export const fetchCategories = async () => {
    return await getCategories();
};
