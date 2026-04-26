import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ open }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const NAV_ITEMS = [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'transactions', label: 'Transactions', icon: 'receipt_long' },
        { id: 'reports', label: 'Reports', icon: 'bar_chart' },
        { id: 'budget', label: 'Budget', icon: 'account_balance_wallet' },
        { id: 'settings', label: 'Settings', icon: 'settings' },
    ];
    const routes = {
        dashboard: '/dashboard',
        transactions: '/transactions',
        reports: '/reports',
        budget: '/budget',
        settings: '/settings',
    };

    return (
        <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
            <nav className="sidebar-nav pt-3">
                {NAV_ITEMS.map(item => (
                    <button
                        key={item.id}
                        className={`sidebar-nav-item ${
                            location.pathname === routes[item.id] ? 'active' : ''
                        }`}
                        onClick={() => navigate(routes[item.id])}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};
export default Sidebar;