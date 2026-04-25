// src/components/dashboard/SummaryCard.jsx
// Presentation layer — single summary metric card
import React from 'react';

const SummaryCard = ({ label, value, change, positive, icon, color }) => (
    <div className={`summary-card ${color}`}>
        <div className="summary-card-icon">
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="summary-card-body">
            <div className="summary-card-label">{label}</div>
            <div className="summary-card-value">{value}</div>
            <div className={`summary-card-change ${positive ? 'change-up' : 'change-down'}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    {positive ? 'arrow_upward' : 'arrow_downward'}
                </span>
                {change} so với tháng trước
            </div>
        </div>
    </div>
);

export default SummaryCard;
