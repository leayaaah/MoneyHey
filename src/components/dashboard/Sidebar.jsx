import React from 'react';

const NAV_ITEMS = [
    { id: 'dashboard',    label: 'Tổng quan',    icon: 'dashboard' },
    { id: 'transactions', label: 'Giao dịch',    icon: 'swap_horiz' },
    { id: 'reports',      label: 'Báo cáo',      icon: 'bar_chart' },
    { id: 'budget',       label: 'Ngân sách',    icon: 'savings' },
    { id: 'settings',     label: 'Cài đặt',      icon: 'settings' },
];

const Sidebar = ({ open, activeNav, onNav }) => (
    <>
        {open && <div className="sidebar-backdrop d-md-none" />}
        <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
            <nav className="sidebar-nav pt-3">
                {NAV_ITEMS.map(item => (
                    <button
                        key={item.id}
                        className={`sidebar-nav-item ${activeNav === item.id ? 'active' : ''}`}
                        onClick={() => onNav(item.id)}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    </>
);

export default Sidebar;
