import React from 'react';

const SummaryCard = ({ label, value, icon, color, trend, positive = true, subtitle }) => (
    <div className={`summary-card ${color}`}>
        <div className="summary-card-icon">
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="summary-card-body">
            <div className="summary-card-label">{label}</div>
            <div className="summary-card-value">{value}</div>
            {trend ? (
                <div className={`summary-card-change ${positive ? 'change-up' : 'change-down'}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                        {positive ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                    {trend}
                </div>
            ) : null}
            {subtitle ? <div className="summary-card-subtitle">{subtitle}</div> : null}
        </div>
    </div>
);

export default SummaryCard;
