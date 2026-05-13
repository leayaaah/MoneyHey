import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Modal } from 'bootstrap';
import { createTransaction, createTransactions } from '../../../application/services/transactionService';
import { parseQuickTransactions } from '../../../application/services/transactionIntelligenceService';
import { createCategory } from '../../../application/services/categoryService';
import { useAuth } from '../../hooks/useAuth';

const createManualState = (walletId = '') => ({
    user_id: '',
    wallet_id: walletId,
    category_id: '',
    amount: '',
    note: '',
    tx_date: new Date().toISOString().slice(0, 10),
    tx_type: 'expense'
});

const createQuickState = (walletId = '') => ({
    wallet_id: walletId,
    tx_date: new Date().toISOString().slice(0, 10),
    raw_text: ''
});

const createCategoryState = () => ({
    open: false,
    name: '',
    target: null
});

const AddTransactionModal = ({ wallets, categories, onTransactionsCreated, onCategoriesChanged }) => {
    const defaultWalletId = String(wallets[0]?.wallet_id || '');
    const { user } = useAuth();
    const modalRef = useRef(null);

    const [activeMode, setActiveMode] = useState('manual');
    const [categoryOptions, setCategoryOptions] = useState(categories);
    const [formData, setFormData] = useState(createManualState(defaultWalletId));
    const [quickForm, setQuickForm] = useState(createQuickState(defaultWalletId));
    const [previewTransactions, setPreviewTransactions] = useState([]);
    const [parseStatus, setParseStatus] = useState('');
    const [parseError, setParseError] = useState('');
    const [categoryForm, setCategoryForm] = useState(createCategoryState());
    const [categoryError, setCategoryError] = useState('');
    const [isSavingManual, setIsSavingManual] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [isSavingQuick, setIsSavingQuick] = useState(false);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    useEffect(() => {
        setCategoryOptions(categories);
    }, [categories]);

    useEffect(() => {
        setFormData((prev) => (
            prev.wallet_id
                ? prev
                : { ...prev, wallet_id: defaultWalletId }
        ));
        setQuickForm((prev) => (
            prev.wallet_id
                ? prev
                : { ...prev, wallet_id: defaultWalletId }
        ));
    }, [defaultWalletId]);

    const resetAll = () => {
        setFormData(createManualState(defaultWalletId));
        setQuickForm(createQuickState(defaultWalletId));
        setPreviewTransactions([]);
        setParseStatus('');
        setParseError('');
        setCategoryError('');
        setCategoryForm(createCategoryState());
        setActiveMode('manual');
    };

    const hideModal = () => {
        const modalInstance = Modal.getOrCreateInstance(modalRef.current);
        modalInstance.hide();
    };

    const handleManualChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleQuickChange = (event) => {
        const { name, value } = event.target;
        setQuickForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePreviewChange = (index, field, value) => {
        setPreviewTransactions((prev) => prev.map((transaction, transactionIndex) => (
            transactionIndex === index
                ? { ...transaction, [field]: value }
                : transaction
        )));
    };

    const openCategoryCreator = (target) => {
        setCategoryError('');
        setCategoryForm({
            open: true,
            name: '',
            target
        });
    };

    const closeCategoryCreator = () => {
        setCategoryError('');
        setCategoryForm(createCategoryState());
    };

    const attachCategoryToTarget = (createdCategory, target) => {
        if (!target) {
            return;
        }

        if (target.kind === 'manual') {
            setFormData((prev) => ({
                ...prev,
                category_id: String(createdCategory.category_id)
            }));
            return;
        }

        if (target.kind === 'quick-preview') {
            setPreviewTransactions((prev) => prev.map((transaction, index) => (
                index === target.index
                    ? {
                        ...transaction,
                        category_id: String(createdCategory.category_id),
                        category_name: createdCategory.category_name
                    }
                    : transaction
            )));
        }
    };

    const handleCreateCategory = async () => {
        const categoryName = categoryForm.name.trim();

        if (!categoryName) {
            setCategoryError('Vui lòng nhập tên category.');
            return;
        }

        const duplicatedCategory = categoryOptions.find(
            (category) => category.category_name.trim().toLowerCase() === categoryName.toLowerCase()
        );

        if (duplicatedCategory) {
            attachCategoryToTarget(duplicatedCategory, categoryForm.target);
            closeCategoryCreator();
            return;
        }

        try {
            setIsCreatingCategory(true);
            const createdCategory = await createCategory(categoryName);
            const nextCategories = [...categoryOptions, createdCategory];

            setCategoryOptions(nextCategories);
            attachCategoryToTarget(createdCategory, categoryForm.target);
            await onCategoriesChanged?.(nextCategories);
            closeCategoryCreator();
        } catch (error) {
            console.error('Lỗi khi tạo category:', error);
            setCategoryError('Không thể tạo category mới.');
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const handleManualSubmit = async () => {
        try {
            setIsSavingManual(true);
            await createTransaction({
                ...formData,
                user_id: user.user_id
            });
            await onTransactionsCreated?.();
            resetAll();
            hideModal();
            alert('Giao dịch đã được thêm.');
        } catch (error) {
            console.error('Lỗi khi thêm giao dịch:', error);
            alert('Vui lòng nhập đúng và đầy đủ thông tin giao dịch.');
        } finally {
            setIsSavingManual(false);
        }
    };

    const handleQuickParse = async () => {
        if (!quickForm.raw_text.trim()) {
            setParseError('Vui lòng dán nội dung giao dịch cần phân tích.');
            setPreviewTransactions([]);
            return;
        }

        setIsParsing(true);
        setParseError('');
        setParseStatus('');

        try {
            const result = await parseQuickTransactions({
                rawText: quickForm.raw_text,
                categories: categoryOptions
            });

            const transactions = result.transactions.map((transaction) => ({
                ...transaction,
                wallet_id: quickForm.wallet_id,
                tx_date: quickForm.tx_date
            }));

            if (!transactions.length) {
                throw new Error('Không tách được giao dịch hợp lệ nào từ văn bản đã dán.');
            }

            setPreviewTransactions(transactions);
            setParseStatus(
                result.source === 'ai'
                    ? 'Đã phân tích bằng AI. Bạn có thể rà soát nhanh trước khi lưu.'
                    : 'AI chưa sẵn sàng nên hệ thống đã dùng bộ phân tích dự phòng. Nên kiểm tra lại category trước khi lưu.'
            );
        } catch (error) {
            console.error('Lỗi khi phân tích giao dịch nhanh:', error);
            setPreviewTransactions([]);
            setParseError(error.message || 'Không thể phân tích nội dung giao dịch.');
        } finally {
            setIsParsing(false);
        }
    };

    const handleQuickSubmit = async () => {
        const invalidTransaction = previewTransactions.find((transaction) =>
            !transaction.note ||
            !transaction.wallet_id ||
            !transaction.category_id ||
            !transaction.tx_date ||
            Number(transaction.amount) <= 0
        );

        if (invalidTransaction) {
            setParseError('Preview còn dòng thiếu category, ví, ngày hoặc số tiền không hợp lệ.');
            return;
        }

        try {
            setIsSavingQuick(true);
            await createTransactions(previewTransactions.map((transaction) => ({
                user_id: user.user_id,
                wallet_id: transaction.wallet_id,
                category_id: transaction.category_id,
                amount: Number(transaction.amount),
                note: transaction.note,
                tx_date: transaction.tx_date,
                tx_type: transaction.tx_type
            })));
            await onTransactionsCreated?.();
            resetAll();
            hideModal();
            alert(`Đã thêm ${previewTransactions.length} giao dịch.`);
        } catch (error) {
            console.error('Lỗi khi lưu giao dịch nhanh:', error);
            setParseError('Không thể lưu danh sách giao dịch nhanh.');
        } finally {
            setIsSavingQuick(false);
        }
    };

    return (
        <div className="modal fade" id="addModal" tabIndex="-1" ref={modalRef}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <div>
                            <h5 className="modal-title mb-1">Thêm giao dịch</h5>
                            <small className="text-muted">Có thể nhập thủ công hoặc dán ghi chú dài để AI tách giao dịch.</small>
                        </div>
                        <button className="btn-close" data-bs-dismiss="modal"></button>
                    </div>

                    <div className="modal-body">
                        <div className="quick-add-tabs mb-3">
                            <button
                                type="button"
                                className={`quick-add-tab ${activeMode === 'manual' ? 'active' : ''}`}
                                onClick={() => setActiveMode('manual')}
                            >
                                Thủ công
                            </button>
                            <button
                                type="button"
                                className={`quick-add-tab ${activeMode === 'quick' ? 'active' : ''}`}
                                onClick={() => setActiveMode('quick')}
                            >
                                Thêm nhanh bằng văn bản
                            </button>
                        </div>

                        {activeMode === 'manual' ? (
                            <div>
                                <div className="mb-3">
                                    <label className="form-label">Loại</label>
                                    <select
                                        className="form-select"
                                        name="tx_type"
                                        value={formData.tx_type}
                                        onChange={handleManualChange}
                                    >
                                        <option value="expense">Chi tiêu</option>
                                        <option value="income">Thu nhập</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Số tiền</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleManualChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Ví</label>
                                    <select
                                        className="form-select"
                                        name="wallet_id"
                                        value={formData.wallet_id}
                                        onChange={handleManualChange}
                                    >
                                        <option value="">Chọn ví</option>
                                        {wallets.map((wallet) => (
                                            <option key={wallet.wallet_id} value={wallet.wallet_id}>
                                                {wallet.wallet_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Danh mục</label>
                                    <select
                                        className="form-select"
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleManualChange}
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categoryOptions.map((category) => (
                                            <option key={category.category_id} value={category.category_id}>
                                                {category.category_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-link quick-category-trigger px-0"
                                    onClick={() => openCategoryCreator({ kind: 'manual' })}
                                >
                                    Không có category phù hợp? Tạo mới
                                </button>

                                <div className="mb-3">
                                    <label className="form-label">Ngày</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="tx_date"
                                        value={formData.tx_date}
                                        onChange={handleManualChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Ghi chú</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="note"
                                        value={formData.note}
                                        onChange={handleManualChange}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="quick-add-callout mb-3">
                                    <div className="fw-semibold mb-1">Ví dụ</div>
                                    <div className="text-muted">
                                        uống phúc long hết 65k, ăn mỳ cay hết 79k, mua áo hết 100k
                                    </div>
                                </div>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Ngày áp dụng</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="tx_date"
                                            value={quickForm.tx_date}
                                            onChange={handleQuickChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Ví áp dụng</label>
                                        <select
                                            className="form-select"
                                            name="wallet_id"
                                            value={quickForm.wallet_id}
                                            onChange={handleQuickChange}
                                        >
                                            <option value="">Chọn ví</option>
                                            {wallets.map((wallet) => (
                                                <option key={wallet.wallet_id} value={wallet.wallet_id}>
                                                    {wallet.wallet_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <label className="form-label">Nội dung giao dịch</label>
                                    <textarea
                                        className="form-control quick-add-textarea"
                                        name="raw_text"
                                        value={quickForm.raw_text}
                                        onChange={handleQuickChange}
                                        placeholder="Dán ghi chú dài vào đây, mỗi giao dịch có thể ngăn cách bằng dấu phẩy, dấu chấm phẩy hoặc xuống dòng."
                                    />
                                </div>

                                <div className="d-flex justify-content-between align-items-center mt-3 gap-3 flex-wrap">
                                    <small className="text-muted">
                                        AI sẽ cố gắng đoán loại giao dịch và category từ danh mục hiện có.
                                    </small>
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        onClick={handleQuickParse}
                                        disabled={isParsing}
                                    >
                                        {isParsing ? 'Đang phân tích...' : 'Phân tích bằng AI'}
                                    </button>
                                </div>

                                {parseStatus ? (
                                    <div className="alert alert-success mt-3 mb-0">{parseStatus}</div>
                                ) : null}

                                {parseError ? (
                                    <div className="alert alert-danger mt-3 mb-0">{parseError}</div>
                                ) : null}

                                {previewTransactions.length > 0 ? (
                                    <div className="quick-preview mt-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mb-0">Preview giao dịch</h6>
                                            <span className="badge text-bg-secondary">{previewTransactions.length} dòng</span>
                                        </div>

                                        {previewTransactions.map((transaction, index) => (
                                            <div key={`${transaction.note}-${index}`} className="quick-preview-row">
                                                <div className="row g-2">
                                                    <div className="col-12">
                                                        <label className="form-label small mb-1">Ghi chú</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={transaction.note}
                                                            onChange={(event) => handlePreviewChange(index, 'note', event.target.value)}
                                                        />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label small mb-1">Số tiền</label>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            value={transaction.amount}
                                                            onChange={(event) => handlePreviewChange(index, 'amount', event.target.value)}
                                                        />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label small mb-1">Loại</label>
                                                        <select
                                                            className="form-select"
                                                            value={transaction.tx_type}
                                                            onChange={(event) => handlePreviewChange(index, 'tx_type', event.target.value)}
                                                        >
                                                            <option value="expense">Chi tiêu</option>
                                                            <option value="income">Thu nhập</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label small mb-1">Danh mục</label>
                                                        <select
                                                            className="form-select"
                                                            value={transaction.category_id}
                                                            onChange={(event) => {
                                                                const category = categoryOptions.find(
                                                                    (item) => String(item.category_id) === event.target.value
                                                                );
                                                                handlePreviewChange(index, 'category_id', event.target.value);
                                                                handlePreviewChange(index, 'category_name', category?.category_name || '');
                                                            }}
                                                        >
                                                            <option value="">Chọn danh mục</option>
                                                            {categoryOptions.map((category) => (
                                                                <option key={category.category_id} value={category.category_id}>
                                                                    {category.category_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            type="button"
                                                            className="btn btn-link quick-category-trigger px-0 mt-1"
                                                            onClick={() => openCategoryCreator({ kind: 'quick-preview', index })}
                                                        >
                                                            Tạo category mới cho dòng này
                                                        </button>
                                                    </div>
                                                    <div className="col-md-2">
                                                        <label className="form-label small mb-1">Độ tin cậy</label>
                                                        <div className="quick-preview-confidence">
                                                            {Math.round(transaction.confidence * 100)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}

                            </div>
                        )}

                        {categoryForm.open ? (
                            <div className="quick-category-card mt-4">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="mb-0">Tạo category mới</h6>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Close"
                                        onClick={closeCategoryCreator}
                                    ></button>
                                </div>
                                <div className="row g-2 align-items-end">
                                    <div className="col-sm-8">
                                        <label className="form-label small mb-1">Tên category</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={categoryForm.name}
                                            onChange={(event) => setCategoryForm((prev) => ({
                                                ...prev,
                                                name: event.target.value
                                            }))}
                                            placeholder="Ví dụ: Cafe, Quà tặng, Chăm sóc thú cưng"
                                        />
                                    </div>
                                    <div className="col-sm-4 d-grid">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handleCreateCategory}
                                            disabled={isCreatingCategory}
                                        >
                                            {isCreatingCategory ? 'Đang tạo...' : 'Tạo và chọn'}
                                        </button>
                                    </div>
                                </div>
                                {categoryError ? (
                                    <div className="alert alert-danger mt-3 mb-0">{categoryError}</div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>

                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                            onClick={resetAll}
                        >
                            Huỷ
                        </button>
                        {activeMode === 'manual' ? (
                            <button
                                className="btn btn-primary"
                                onClick={handleManualSubmit}
                                disabled={isSavingManual}
                            >
                                {isSavingManual ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={handleQuickSubmit}
                                disabled={isSavingQuick || previewTransactions.length === 0}
                            >
                                {isSavingQuick ? 'Đang lưu...' : 'Lưu danh sách giao dịch'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddTransactionModal;
