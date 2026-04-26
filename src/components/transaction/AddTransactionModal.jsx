import React, { useState, useRef } from 'react';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { createTransaction } from '../../services/transactionService';
import { fetchWallets } from '../../services/walletService';
import { fetchCategories } from '../../services/categoryService';
import { useAuth } from '../../hooks/useAuth';
import { Modal } from 'bootstrap';


const AddTransactionModal = ({wallets, categories}) => {

    const [formData, setFormData] = useState({
        user_id: '',
        wallet_id: '',
        category_id: '',
        amount: '',
        note: '',
        tx_date: new Date().toISOString().slice(0,10),
        tx_type: 'expense',
    });
    const modalRef = useRef(null);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const { user } = useAuth();

    const handleSubmit = () => {
        formData.user_id = user.user_id;
        console.log('Submit:', formData);
        createTransaction(formData
            ).then(() => {
                alert('Giao dịch đã được thêm!');
                setFormData({ user_id: '', wallet_id: '', category_id: '', amount: '', note: '', tx_date: new Date().toISOString().slice(0,10), tx_type: 'expense' });

                const modalInstance = new Modal(modalRef.current);
                modalInstance.hide();
            })
            .catch(err => {
                console.error('Lỗi khi thêm giao dịch:', err);
                alert('Vui lòng nhập đúng và đầy đủ thông tin giao dịch.');
            });
    };

    return (
        <div className="modal fade" id="addModal" tabIndex="-1" ref={modalRef}>
        <div className="modal-dialog">
            <div className="modal-content">

                {/* HEADER */}
                <div className="modal-header">
                    <h5 className="modal-title">Thêm giao dịch</h5>
                    <button className="btn-close" data-bs-dismiss="modal"></button>
                </div>

                {/* BODY */}
                <div className="modal-body">

                    {/* TYPE */}
                    <div className="mb-3">
                        <label className="form-label">Loại</label>
                        <select
                            className="form-select"
                            name="tx_type"
                            value={formData.tx_type}
                            onChange={handleChange}
                        >
                            <option value="expense">Chi tiêu</option>
                            <option value="income">Thu nhập</option>
                        </select>
                    </div>

                    {/* AMOUNT */}
                    <div className="mb-3">
                        <label className="form-label">Số tiền</label>
                        <input
                            type="number"
                            className="form-control"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                        />
                    </div>

                    {/* WALLET */}
                    <div className="mb-3">
                        <label className="form-label">Ví</label>
                        <select
                            className="form-select"
                            name="wallet_id"
                            value={formData.wallet_id}
                            onChange={handleChange}
                        >
                            <option value="">Chọn ví</option>
                            {wallets.map(w => (
                                <option key={w.wallet_id} value={w.wallet_id}>
                                    {w.wallet_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* CATEGORY */}
                    <div className="mb-3">
                        <label className="form-label">Danh mục</label>
                        <select
                            className="form-select"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map(c => (
                                <option key={c.category_id} value={c.category_id}>
                                    {c.category_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* DATE */}
                    <div className="mb-3">
                        <label className="form-label">Ngày</label>
                        <input
                            type="date"
                            className="form-control"
                            name="tx_date"
                            value={formData.tx_date}
                            onChange={handleChange}
                        />
                    </div>

                    {/* NOTE */}
                    <div className="mb-3">
                        <label className="form-label">Ghi chú</label>
                        <input
                            type="text"
                            className="form-control"
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                        />
                    </div>

                </div>

                {/* FOOTER */}
                <div className="modal-footer">
                    <button className="btn btn-secondary" data-bs-dismiss="modal">
                        Huỷ
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        Lưu
                    </button>
                </div>

            </div>
        </div>
    </div>
    );
};

export default AddTransactionModal;