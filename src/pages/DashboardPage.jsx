// src/pages/DashboardPage.jsx
// Presentation layer — dashboard page (orchestrates layout + dashboard widgets)
import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/dashboard/Sidebar';
import SummaryCard from '../components/dashboard/SummaryCard';
import SpendingChart from '../components/dashboard/SpendingChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import QuickActions from '../components/dashboard/QuickActions';
import { useWallet } from '../hooks/useWallet';
import '../css/Dashboard.css';

const SUMMARY_CARDS = [];

const DashboardPage = ({ onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeNav, setActiveNav] = useState('dashboard');
    const { totalBalance } = useWallet();

    const formattedDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <div className="dashboard-shell">
            <Header onToggleSidebar={() => setSidebarOpen(v => !v)} onLogout={onLogout} />

            <div className="dashboard-body">
                <Sidebar open={sidebarOpen} activeNav={activeNav} onNav={setActiveNav} />

                <main className={`dashboard-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                    <div className="page-title-row">
                        <div>
                            <h1 className="page-title font-headline">Tổng quan</h1>
                            <p className="page-subtitle">{formattedDate}</p>
                            {totalBalance > 0 && (
                                <p className="page-subtitle fw-semibold">
                                    Số dư: {totalBalance.toLocaleString('vi-VN')} ₫
                                </p>
                            )}
                        </div>
                        <button className="btn-primary-emerald px-4 py-2 d-flex align-items-center gap-2 shadow-sm">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                            Thêm giao dịch
                        </button>
                    </div>

                    <div className="summary-grid">
                        {SUMMARY_CARDS.map(card => (
                            <SummaryCard key={card.id} {...card} />
                        ))}
                    </div>

                    <div className="row g-4 mt-0">
                        <div className="col-12 col-xl-4">
                            <QuickActions />
                        </div>
                        <div className="col-12 col-xl-8">
                            <SpendingChart />
                        </div>
                    </div>

                    <div className="mt-4">
                        <RecentTransactions />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
