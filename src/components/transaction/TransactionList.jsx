import React from 'react';

const TransactionList = ({ transactions }) => {
    if (!transactions || transactions.length === 0) {
        return <div className="text-muted">Chưa có giao dịch nào</div>;
    }

    return (
        <div className="transaction-list">
            {transactions.map(tx => (
                <div
                    key={tx.trans_id}
                    className="transaction-item d-flex align-items-center justify-content-between p-3 mb-2 rounded bg-light "
                >
                    <div className="d-flex align-items-center gap-3">
                        <div>
                            <div className="transaction-note font-headline">
                                {tx.note}
                            </div>
                            <div
                                className="transaction-date text-muted"
                                style={{ fontSize: '14px' }}
                            >
                                {new Date(tx.tx_date).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <div className="d-flex flex-column align-items-start gap-1">
                        <div className="transaction-category badge bg-secondary">
                            {tx.categoryName}
                        </div>
                    </div>

                    <div className={`transaction-amount ${tx.tx_type === 'expense' ? 'expense' : 'income'}`}>
                        {tx.tx_type === 'expense' ? '-' : '+'}
                        {tx.amount?.toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                        })}
                    </div>
                    <div>
                        <div className="transaction-wallet badge bg-info">
                            {tx.walletName}
                        </div>
                    </div>
                    <div>
                        <button className="btn btn-outline-primary btn-sm">
                            Sửa
                        </button>
                        <button className="btn btn-outline-danger btn-sm ms-2">
                            Xóa
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};


export default TransactionList;