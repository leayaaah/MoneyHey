import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Modal } from 'bootstrap';
import { createBudget, updateBudget } from '../../../application/services/budgetService';
import { useAuth } from '../../hooks/useAuth';

const getToday = () => new Date().toISOString().slice(0, 10);

const getMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    return { start, end };
};

const createFormState = () => {
    const { start, end } = getMonthRange();
    return {
        category_id: '',
        amount: '',
        start_date: start,
        end_date: end
    };
};

const createFormStateFromBudget = (budget) => ({
    category_id: String(budget?.category_id || ''),
    amount: String(budget?.amount ?? ''),
    start_date: String(budget?.start_date || getToday()).split('T')[0],
    end_date: String(budget?.end_date || getToday()).split('T')[0]
});

const cleanupModalArtifacts = () => {
    document.querySelectorAll('.modal-backdrop').forEach((backdrop, index, items) => {
        if (index < items.length - 1 || !document.querySelector('.modal.show')) {
            backdrop.remove();
        }
    });

    if (!document.querySelector('.modal.show')) {
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
        document.body.style.removeProperty('overflow');
    }
};

const AddBudgetModal = ({
    categories,
    onBudgetCreated,
    modalId = 'addBudgetModal',
    mode = 'create',
    budget = null,
    onModalClosed
}) => {
    const isEditMode = mode === 'edit';
    const { user } = useAuth();
    const modalRef = useRef(null);
    const skipResetOnHideRef = useRef(false);

    const [formData, setFormData] = useState(() => (
        isEditMode
            ? createFormStateFromBudget(budget)
            : createFormState()
    ));
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        setFormData(
            isEditMode
                ? createFormStateFromBudget(budget)
                : createFormState()
        );
    }, [isEditMode, budget]);

    useEffect(() => {
        const modalElement = modalRef.current;
        if (!modalElement) return undefined;

        const handleHidden = () => {
            cleanupModalArtifacts();
            if (skipResetOnHideRef.current) {
                skipResetOnHideRef.current = false;
                return;
            }
            setFormData(createFormState());
            setFormError('');
            onModalClosed?.();
        };

        modalElement.addEventListener('hidden.bs.modal', handleHidden);
        return () => modalElement.removeEventListener('hidden.bs.modal', handleHidden);
    }, [onModalClosed]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const closeAddModal = () => new Promise((resolve) => {
        const modalElement = modalRef.current;
        if (!modalElement || !modalElement.classList.contains('show')) {
            cleanupModalArtifacts();
            resolve();
            return;
        }

        const handleHidden = () => {
            modalElement.removeEventListener('hidden.bs.modal', handleHidden);
            cleanupModalArtifacts();
            resolve();
        };

        modalElement.addEventListener('hidden.bs.modal', handleHidden);
        Modal.getOrCreateInstance(modalElement).hide();
    });

    const handleSubmit = async () => {
        setFormError('');

        try {
            setIsSaving(true);

            const payload = {
                ...formData,
                user_id: user?.user_id || budget?.user_id || '',
                amount: Number(formData.amount),
                category_id: formData.category_id || null
            };

            if (isEditMode) {
                await updateBudget(budget.budget_id, payload);
                await onBudgetCreated?.();
                await closeAddModal();
                alert('Ngân sách đã được cập nhật.');
                return;
            }

            await createBudget(payload);
            await onBudgetCreated?.();
            await closeAddModal();
            alert('Ngân sách đã được thêm.');
        } catch (error) {
            console.error('Error saving budget:', error);
            setFormError(error?.message || 'Vui lòng nhập đầy đủ và đúng thông tin ngân sách.');
        } finally {
            setIsSaving(false);
        }
    };

    const modalTitle = isEditMode ? 'Sửa ngân sách' : 'Thêm ngân sách';
    const modalDescription = isEditMode
        ? 'Cập nhật thông tin ngân sách hiện có.'
        : 'Thiết lập ngân sách cho một danh mục trong khoảng thời gian cụ thể.';

    const expenseCategories = categories.filter((cat) => !cat.tx_type || cat.tx_type === 'expense');

    return (
        <div className="modal fade" id={modalId} tabIndex="-1" ref={modalRef}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <div>
                            <h5 className="modal-title mb-1">{modalTitle}</h5>
                            <small className="text-muted">{modalDescription}</small>
                        </div>
                        <button className="btn-close" data-bs-dismiss="modal"></button>
                    </div>

                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Danh mục</label>
                            <select
                                className="form-select"
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                            >
                                <option value="">Tất cả danh mục (chung)</option>
                                {expenseCategories.map((cat) => (
                                    <option key={cat.category_id} value={cat.category_id}>
                                        {cat.category_name}
                                    </option>
                                ))}
                            </select>
                            <small className="text-muted">Chọn danh mục cụ thể hoặc để trống để áp dụng cho tất cả.</small>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Số tiền ngân sách</label>
                            <input
                                type="number"
                                className="form-control"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="Ví dụ: 5000000"
                            />
                        </div>

                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Ngày bắt đầu</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Ngày kết thúc</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {formError ? (
                            <div className="alert alert-danger mt-3 mb-0">{formError}</div>
                        ) : null}
                    </div>

                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                        >
                            Hủy
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Lưu'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddBudgetModal;
