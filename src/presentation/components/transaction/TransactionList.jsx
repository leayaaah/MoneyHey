import React from 'react';
import '../../../css/TransactionPage.css';
import { formatCompactVnd } from '../../utils/formatCurrency';

const formatDateDDMMYYYY = (value) => {
    if (!value) {
        return '';
    }

    const [year, month, day] = String(value).split('T')[0].split('-');

    if (year && month && day) {
        return `${day}/${month}/${year}`;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString('vi-VN');
};

const TransactionList = ({ transactions }) => {
    if (!transactions || transactions.length === 0) {
        return <div className="text-muted">Chưa có giao dịch nào</div>;
    }

    return (
        <div className="transaction-grid">
            {/* header */}
            <div className="transaction-grid-header">
                <div>Ghi chú</div>
                <div>Ngày</div>
                <div>Danh mục</div>
                <div>Ví</div>
                <div>Số tiền</div>
                <div>#</div>
            </div>

            {/* rows */}
            {transactions.map(tx => {
                const amountValue = formatCompactVnd(Math.abs(Number(tx.amount)));

                return (
                    <div key={tx.trans_id} className="transaction-grid-row">
                        <div className="font-headline">{tx.note}</div>

                        <div className="text-muted">
                            {formatDateDDMMYYYY(tx.tx_date)}
                        </div>

                        <div>
                            <span className="badge bg-secondary">
                                {tx.categoryName}
                            </span>
                        </div>

                        <div>
                            <span className="badge bg-info">
                                {tx.walletName}
                            </span>
                        </div>

                        <div className={tx.tx_type === 'expense' ? 'text-danger' : 'text-success'}>
                            {tx.tx_type === 'expense' ? '-' : '+'}
                            {amountValue}
                        </div>

                        <div className="text-end">
                            <button className="btn btn-outline-primary btn-sm">
                                Sửa
                            </button>
                            <button className="btn btn-outline-danger btn-sm ms-2">
                                Xóa
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TransactionList;
