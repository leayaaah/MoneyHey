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
    txType: 'expense',
    target: null
});

const CATEGORY_TYPE_LABELS = {
    expense: 'Chi tieu',
    income: 'Thu nhap'
};

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
    const [parseStatusTone, setParseStatusTone] = useState('success');
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
        setParseStatusTone('success');
        setParseError('');
        setCategoryError('');
        setCategoryForm(createCategoryState());
        setActiveMode('manual');
    };

    const hideModal = () => {
        const modalInstance = Modal.getOrCreateInstance(modalRef.current);
        modalInstance.hide();
    };

    const resolveCategoryTxType = (target) => {
        if (!target || target.kind === 'manual') {
            return formData.tx_type || 'expense';
        }

        if (target.kind === 'quick-preview') {
            return previewTransactions[target.index]?.tx_type || 'expense';
        }

        return 'expense';
    };

    const getSelectableCategories = (txType) =>
        categoryOptions.filter((category) => !category.tx_type || category.tx_type === txType);

    const handleManualChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => {
            const next = {
                ...prev,
                [name]: value
            };

            if (name === 'tx_type') {
                next.category_id = '';
            }

            return next;
        });
    };

    const handleQuickChange = (event) => {
        const { name, value } = event.target;
        setQuickForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePreviewChange = (index, field, value) => {
        setPreviewTransactions((prev) => prev.map((transaction, transactionIndex) => {
            if (transactionIndex !== index) {
                return transaction;
            }

            const next = {
                ...transaction,
                [field]: value
            };

            if (field === 'tx_type') {
                next.category_id = '';
                next.category_name = '';
            }

            return next;
        }));
    };

    const openCategoryCreator = (target) => {
        setCategoryError('');
        setCategoryForm({
            open: true,
            name: '',
            txType: resolveCategoryTxType(target),
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
            setCategoryError('Vui long nhap ten category.');
            return;
        }

        const duplicatedCategory = categoryOptions.find((category) => {
            const sameName = category.category_name.trim().toLowerCase() === categoryName.toLowerCase();
            const compatibleType = !category.tx_type || category.tx_type === categoryForm.txType;
            return sameName && compatibleType;
        });

        if (duplicatedCategory) {
            attachCategoryToTarget(duplicatedCategory, categoryForm.target);
            closeCategoryCreator();
            return;
        }

        try {
            setIsCreatingCategory(true);

            const createdCategory = await createCategory({
                categoryName,
                txType: categoryForm.txType
            });

            const nextCategories = [...categoryOptions, createdCategory];
            setCategoryOptions(nextCategories);
            attachCategoryToTarget(createdCategory, categoryForm.target);
            await onCategoriesChanged?.();
            closeCategoryCreator();
        } catch (error) {
            console.error('Error creating category:', error);
            setCategoryError(error?.message || 'Khong the tao category moi.');
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
            alert('Giao dich da duoc them.');
        } catch (error) {
            console.error('Error creating transaction:', error);
            alert('Vui long nhap dung va day du thong tin giao dich.');
        } finally {
            setIsSavingManual(false);
        }
    };

    const handleQuickParse = async () => {
        if (!quickForm.raw_text.trim()) {
            setParseError('Vui long dan noi dung giao dich can phan tich.');
            setPreviewTransactions([]);
            return;
        }

        setIsParsing(true);
        setParseError('');
        setParseStatus('');
        setParseStatusTone('success');

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
                throw new Error('Khong tach duoc giao dich hop le nao tu van ban da dan.');
            }

            setPreviewTransactions(transactions);
            setParseStatusTone(result.source === 'ai' ? 'success' : 'warning');
            setParseStatus(
                result.source === 'ai'
                    ? `Parsed with ${result.providerLabel || 'AI'} (${result.model}). Please review before saving.`
                    : `${result.providerLabel || 'AI'} is unavailable, so the system switched to the fallback parser. ${result.reason || ''}`.trim()
            );
        } catch (error) {
            console.error('Error parsing quick transactions:', error);
            setPreviewTransactions([]);
            setParseError(error.message || 'Khong the phan tich noi dung giao dich.');
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
            setParseError('Preview con dong thieu category, vi, ngay hoac so tien khong hop le.');
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
            alert(`Da them ${previewTransactions.length} giao dich.`);
        } catch (error) {
            console.error('Error saving quick transactions:', error);
            setParseError('Khong the luu danh sach giao dich nhanh.');
        } finally {
            setIsSavingQuick(false);
        }
    };

    return (
        <>
            <div className="modal fade" id="addModal" tabIndex="-1" ref={modalRef}>
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div>
                                <h5 className="modal-title mb-1">Them giao dich</h5>
                                <small className="text-muted">Co the nhap thu cong hoac dan ghi chu dai de AI tach giao dich.</small>
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
                                    Thu cong
                                </button>
                                <button
                                    type="button"
                                    className={`quick-add-tab ${activeMode === 'quick' ? 'active' : ''}`}
                                    onClick={() => setActiveMode('quick')}
                                >
                                    Them nhanh bang van ban
                                </button>
                            </div>

                            {activeMode === 'manual' ? (
                                <div>
                                    <div className="mb-3">
                                        <label className="form-label">Loai</label>
                                        <select
                                            className="form-select"
                                            name="tx_type"
                                            value={formData.tx_type}
                                            onChange={handleManualChange}
                                        >
                                            <option value="expense">Chi tieu</option>
                                            <option value="income">Thu nhap</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">So tien</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleManualChange}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Vi</label>
                                        <select
                                            className="form-select"
                                            name="wallet_id"
                                            value={formData.wallet_id}
                                            onChange={handleManualChange}
                                        >
                                            <option value="">Chon vi</option>
                                            {wallets.map((wallet) => (
                                                <option key={wallet.wallet_id} value={wallet.wallet_id}>
                                                    {wallet.wallet_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Danh muc</label>
                                        <select
                                            className="form-select"
                                            name="category_id"
                                            value={formData.category_id}
                                            onChange={handleManualChange}
                                        >
                                            <option value="">Chon danh muc</option>
                                            {getSelectableCategories(formData.tx_type).map((category) => (
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
                                        Khong co category phu hop? Tao moi
                                    </button>

                                    <div className="mb-3">
                                        <label className="form-label">Ngay</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="tx_date"
                                            value={formData.tx_date}
                                            onChange={handleManualChange}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Ghi chu</label>
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
                                        <div className="fw-semibold mb-1">Vi du</div>
                                        <div className="text-muted">
                                            uong phuc long het 65k, an my cay het 79k, mua ao het 100k
                                        </div>
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Ngay ap dung</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="tx_date"
                                                value={quickForm.tx_date}
                                                onChange={handleQuickChange}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Vi ap dung</label>
                                            <select
                                                className="form-select"
                                                name="wallet_id"
                                                value={quickForm.wallet_id}
                                                onChange={handleQuickChange}
                                            >
                                                <option value="">Chon vi</option>
                                                {wallets.map((wallet) => (
                                                    <option key={wallet.wallet_id} value={wallet.wallet_id}>
                                                        {wallet.wallet_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <label className="form-label">Noi dung giao dich</label>
                                        <textarea
                                            className="form-control quick-add-textarea"
                                            name="raw_text"
                                            value={quickForm.raw_text}
                                            onChange={handleQuickChange}
                                            placeholder="Dan ghi chu dai vao day, moi giao dich co the ngan cach bang dau phay, dau cham phay hoac xuong dong."
                                        />
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mt-3 gap-3 flex-wrap">
                                        <small className="text-muted">
                                            AI se co gang doan loai giao dich va category tu danh muc hien co.
                                        </small>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={handleQuickParse}
                                            disabled={isParsing}
                                        >
                                            {isParsing ? 'Dang phan tich...' : 'Phan tich bang AI'}
                                        </button>
                                    </div>

                                    {parseStatus ? (
                                        <div className={`alert alert-${parseStatusTone} mt-3 mb-0`}>
                                            {parseStatus}
                                        </div>
                                    ) : null}

                                    {parseError ? (
                                        <div className="alert alert-danger mt-3 mb-0">{parseError}</div>
                                    ) : null}

                                    {previewTransactions.length > 0 ? (
                                        <div className="quick-preview mt-4">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h6 className="mb-0">Preview giao dich</h6>
                                                <span className="badge text-bg-secondary">{previewTransactions.length} dong</span>
                                            </div>

                                            {previewTransactions.map((transaction, index) => (
                                                <div key={`${transaction.note}-${index}`} className="quick-preview-row">
                                                    <div className="row g-2">
                                                        <div className="col-12">
                                                            <label className="form-label small mb-1">Ghi chu</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={transaction.note}
                                                                onChange={(event) => handlePreviewChange(index, 'note', event.target.value)}
                                                            />
                                                        </div>
                                                        <div className="col-md-3">
                                                            <label className="form-label small mb-1">So tien</label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={transaction.amount}
                                                                onChange={(event) => handlePreviewChange(index, 'amount', event.target.value)}
                                                            />
                                                        </div>
                                                        <div className="col-md-3">
                                                            <label className="form-label small mb-1">Loai</label>
                                                            <select
                                                                className="form-select"
                                                                value={transaction.tx_type}
                                                                onChange={(event) => handlePreviewChange(index, 'tx_type', event.target.value)}
                                                            >
                                                                <option value="expense">Chi tieu</option>
                                                                <option value="income">Thu nhap</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <label className="form-label small mb-1">Danh muc</label>
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
                                                                <option value="">Chon danh muc</option>
                                                                {getSelectableCategories(transaction.tx_type).map((category) => (
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
                                                                Tao category moi cho dong nay
                                                            </button>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <label className="form-label small mb-1">Do tin cay</label>
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
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                                onClick={resetAll}
                            >
                                Huy
                            </button>
                            {activeMode === 'manual' ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleManualSubmit}
                                    disabled={isSavingManual}
                                >
                                    {isSavingManual ? 'Dang luu...' : 'Luu'}
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleQuickSubmit}
                                    disabled={isSavingQuick || previewTransactions.length === 0}
                                >
                                    {isSavingQuick ? 'Dang luu...' : 'Luu danh sach giao dich'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {categoryForm.open ? (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)' }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div>
                                    <h5 className="modal-title mb-1">Tao category moi</h5>
                                    <small className="text-muted">
                                        Ap dung cho: {CATEGORY_TYPE_LABELS[categoryForm.txType] || 'Chi tieu'}
                                    </small>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                    onClick={closeCategoryCreator}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Ten category</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={categoryForm.name}
                                        onChange={(event) => setCategoryForm((prev) => ({
                                            ...prev,
                                            name: event.target.value
                                        }))}
                                        placeholder="Vi du: Cafe, Qua tang, Cham soc thu cung"
                                        autoFocus
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Loai category</label>
                                    <select
                                        className="form-select"
                                        value={categoryForm.txType}
                                        onChange={(event) => setCategoryForm((prev) => ({
                                            ...prev,
                                            txType: event.target.value
                                        }))}
                                    >
                                        <option value="expense">Chi tieu</option>
                                        <option value="income">Thu nhap</option>
                                    </select>
                                </div>

                                {categoryError ? (
                                    <div className="alert alert-danger mb-0">{categoryError}</div>
                                ) : null}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={closeCategoryCreator}
                                    disabled={isCreatingCategory}
                                >
                                    Dong
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleCreateCategory}
                                    disabled={isCreatingCategory}
                                >
                                    {isCreatingCategory ? 'Dang tao...' : 'Tao va chon'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
};

export default AddTransactionModal;
