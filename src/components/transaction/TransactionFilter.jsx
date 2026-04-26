import React from 'react';
import '/src/css/TransactionPage.css';
const TransactionFilter = ({ filters, setFilters, categories }) => {

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        console.log(name,value);
        
    };

    const handleReset = () => {
        setFilters({
            fromDate: '',
            toDate: '',
            category: 'all'
        });
    };

    return (
        <div className="filter-bar">
            <div className="filter-group">
                <label>Từ ngày</label>
                <input
                    type="date"
                    name="fromDate"
                    value={filters.fromDate}
                    onChange={handleChange}
                />
            </div>

            <div className="filter-group">
                <label>Đến ngày</label>
                <input
                    type="date"
                    name="toDate"
                    value={filters.toDate}
                    onChange={handleChange}
                />
            </div>

            <div className="filter-group">
                <label>Danh mục</label>
                <select
                    name="category"
                    value={filters.category}
                    onChange={handleChange}
                >
                    <option value="all">Tất cả</option>
                    {categories.map(c => (
                        <option key={c.category_id} value={c.category_id}>
                            {c.category_name}
                        </option>
                    ))}
                </select>
            </div>

            <button className="btn-reset" onClick={handleReset}>
                Reset
            </button>
        </div>
    );
};

export default TransactionFilter;