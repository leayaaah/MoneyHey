import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/dashboard/Sidebar';
import SummaryCard from '../components/dashboard/SummaryCard';
import SpendingChart from '../components/dashboard/SpendingChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import QuickActions from '../components/dashboard/QuickActions';
import '../css/Dashboard.css';
import { getTotalBalance } from '../services/walletService';
import { useNavigate, useLocation } from 'react-router-dom';


const SUMMARY_CARDS = [];


const DashboardPage = ({ onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeNav, setActiveNav] = useState('dashboard');
    const [totalBalance, setTotalBalance] = useState(0);

    const formattedDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const navigate = useNavigate();
    const location = useLocation();


    console.log("render dashboard");

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const total = await getTotalBalance();
                setTotalBalance(total);
                console.log(total);
            } catch (err) {
                console.error("Lỗi mạng lưới:", err);
            }
        };
        fetchBalance();
    }, []);
    

    return (
        <div className="dashboard-shell">
        
            <Header onToggleSidebar={() => setSidebarOpen(v => !v)} onLogout={onLogout} />

            <div className="dashboard-body">
                <Sidebar open={sidebarOpen}/>

                <main className={`dashboard-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                    {/* Page title */}
                    <div className="page-title-row">
                        <div>
                            <h1 className="page-title font-headline">Tổng quan</h1>
                            <p className="page-subtitle">{formattedDate}</p>
                        </div>
                        <button className="btn-primary-emerald px-4 py-2 d-flex align-items-center gap-2 shadow-sm">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                            Thêm giao dịch
                        </button>
                    </div>

                    {/* Summary cards */}
                    <div className="summary-grid">
                        {SUMMARY_CARDS.map(card => (
                            <SummaryCard key={card.id} {...card} />
                        ))}
                    </div>

                    {/* Bottom row */}
                    <div className="row g-4 mt-0">
                        <div className="col-12 col-xl-4">
                            <QuickActions />
                        </div>
                        <div className="col-12 col-xl-8">
                            <SpendingChart />
                        </div>
                    </div>

                    {/* Recent transactions */}
                    <div className="mt-4">
                        <RecentTransactions />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
