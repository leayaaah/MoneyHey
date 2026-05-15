import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Modal } from 'bootstrap';
import {
    createTransaction,
    createTransactions,
    updateTransaction
} from '../../../application/services/transactionService';
import { parseQuickTransactions } from '../../../application/services/transactionIntelligenceService';
import { createCategory } from '../../../application/services/categoryService';
import { useAuth } from '../../hooks/useAuth';

const getToday = () => new Date().toISOString().slice(0, 10);

const createManualState = (walletId = '') => ({
    user_id: '',
    wallet_id: walletId,
    category_id: '',
    amount: '',
    note: '',
    tx_date: getToday(),
    tx_type: 'expense'
});

const createManualStateFromTransaction = (transaction, walletId = '') => ({
    user_id: transaction?.user_id || '',
    wallet_id: String(transaction?.wallet_id || walletId),
    category_id: String(transaction?.category_id || ''),
    amount: String(transaction?.amount ?? ''),
    note: transaction?.note || '',
    tx_date: String(transaction?.tx_date || getToday()).split('T')[0],
    tx_type: transaction?.tx_type || 'expense'
});

const createQuickState = (walletId = '') => ({
    wallet_id: walletId,
    tx_date: getToday(),
    raw_text: ''
});

const createCategoryState = () => ({
    name: '',
    txType: 'expense'
});

const CATEGORY_TYPE_LABELS = {
    expense: 'Chi tieu',
    income: 'Thu nhap'
};

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

const AddTransactionModal = ({
    wallets,
    categories,
    onTransactionsCreated,
    onCategoriesChanged,
    modalId = 'addModal',
    mode = 'create',
    transaction = null,
    onModalClosed
}) => {
    const isEditMode = mode === 'edit';
    const defaultWalletId = String(wallets[0]?.wallet_id || '');
    const { user } = useAuth();
    const modalRef = useRef(null);
    const categoryModalRef = useRef(null);
    const skipResetOnHideRef = useRef(false);
    const categoryModalId = `${modalId}-createCategory`;

    const [activeMode, setActiveMode] = useState('manual');
    const [categoryOptions, setCategoryOptions] = useState(categories);
    const [formData, setFormData] = useState(() => (
        isEditMode
            ? createManualStateFromTransaction(transaction, defaultWalletId)
            : createManualState(defaultWalletId)
    ));
    const [quickForm, setQuickForm] = useState(createQuickState(defaultWalletId));
    const [previewTransactions, setPreviewTransactions] = useState([]);
    const [parseStatus, setParseStatus] = useState('');
    const [parseStatusTone, setParseStatusTone] = useState('success');
    const [parseError, setParseError] = useState('');
    const [categoryForm, setCategoryForm] = useState(createCategoryState());
    const [categoryTarget, setCategoryTarget] = useState(null);
    const [categoryError, setCategoryError] = useState('');
    const [shouldRestoreAddModal, setShouldRestoreAddModal] = useState(false);
    const [isSavingManual, setIsSavingManual] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [isSavingQuick, setIsSavingQuick] = useState(false);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    useEffect(() => {
        setCategoryOptions(categories);
    }, [categories]);

    useEffect(() => {
        setFormData(
            isEditMode
                ? createManualStateFromTransaction(transaction, defaultWalletId)
                : createManualState(defaultWalletId)
        );
    }, [defaultWalletId, isEditMode, transaction]);

    useEffect(() => {
        setQuickForm((prev) => (
            prev.wallet_id
                ? prev
                : { ...prev, wallet_id: defaultWalletId }
        ));
    }, [defaultWalletId]);

    useEffect(() => {
        if (!isEditMode) {
            return;
        }

        setActiveMode('manual');
    }, [isEditMode, transaction]);

    useEffect(() => {
        const categoryModalElement = categoryModalRef.current;

        if (!categoryModalElement) {
            return undefined;
        }

        const handleHidden = () => {
            cleanupModalArtifacts();

            if (shouldRestoreAddModal) {
                Modal.getOrCreateInstance(modalRef.current).show();
            }
        };

        categoryModalElement.addEventListener('hidden.bs.modal', handleHidden);

        return () => {
            categoryModalElement.removeEventListener('hidden.bs.modal', handleHidden);
        };
    }, [shouldRestoreAddModal]);

    useEffect(() => {
        const addModalElement = modalRef.current;

        if (!addModalElement) {
            return undefined;
        }

        const handleHidden = () => {
            cleanupModalArtifacts();
            if (skipResetOnHideRef.current) {
                skipResetOnHideRef.current = false;
                return;
            }
            setFormData(
                isEditMode
                    ? createManualStateFromTransaction(transaction, defaultWalletId)
                    : createManualState(defaultWalletId)
            );
            setQuickForm(createQuickState(defaultWalletId));
            setPreviewTransactions([]);
            setParseStatus('');
            setParseStatusTone('success');
            setParseError('');
            setCategoryError('');
            setCategoryForm(createCategoryState());
            setCategoryTarget(null);
            setShouldRestoreAddModal(false);
            setActiveMode('manual');
            onModalClosed?.();
        };

        addModalElement.addEventListener('hidden.bs.modal', handleHidden);

        return () => {
            addModalElement.removeEventListener('hidden.bs.modal', handleHidden);
        };
    }, [defaultWalletId, isEditMode, onModalClosed, transaction]);

    const resetAll = () => {
        setFormData(
            isEditMode
                ? createManualStateFromTransaction(transaction, defaultWalletId)
                : createManualState(defaultWalletId)
        );
        setQuickForm(createQuickState(defaultWalletId));
        setPreviewTransactions([]);
        setParseStatus('');
        setParseStatusTone('success');
        setParseError('');
        setCategoryError('');
        setCategoryForm(createCategoryState());
        setCategoryTarget(null);
        setShouldRestoreAddModal(false);
        setActiveMode('manual');
    };

    const hideAddModal = () => {
        Modal.getOrCreateInstance(modalRef.current).hide();
    };

    const closeAddModal = () => new Promise((resolve) => {
        const addModalElement = modalRef.current;

        if (!addModalElement || !addModalElement.classList.contains('show')) {
            cleanupModalArtifacts();
            resolve();
            return;
        }

        const handleHidden = () => {
            addModalElement.removeEventListener('hidden.bs.modal', handleHidden);
            cleanupModalArtifacts();
            resolve();
        };

        addModalElement.addEventListener('hidden.bs.modal', handleHidden);
        Modal.getOrCreateInstance(addModalElement).hide();
    });

    const showCategoryModal = () => {
        cleanupModalArtifacts();
        Modal.getOrCreateInstance(categoryModalRef.current).show();
    };

    const hideCategoryModal = () => {
        Modal.getOrCreateInstance(categoryModalRef.current).hide();
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
        setPreviewTransactions((prev) => prev.map((item, itemIndex) => {
            if (itemIndex !== index) {
                return item;
            }

            const next = {
                ...item,
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
        setCategoryTarget(target);
        setShouldRestoreAddModal(true);
        skipResetOnHideRef.current = true;
        setCategoryForm({
            name: '',
            txType: resolveCategoryTxType(target)
        });

        const addModalElement = modalRef.current;
        const handleAddHidden = () => {
            addModalElement.removeEventListener('hidden.bs.modal', handleAddHidden);
            cleanupModalArtifacts();
            showCategoryModal();
        };

        addModalElement.addEventListener('hidden.bs.modal', handleAddHidden);
        hideAddModal();
    };

    const closeCategoryCreator = ({ restoreAddModal = true } = {}) => {
        setCategoryError('');
        setCategoryForm(createCategoryState());
        setCategoryTarget(null);
        setShouldRestoreAddModal(restoreAddModal);
        hideCategoryModal();
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
            setPreviewTransactions((prev) => prev.map((item, index) => (
                index === target.index
                    ? {
                        ...item,
                        category_id: String(createdCategory.category_id),
                        category_name: createdCategory.category_name
                    }
                    : item
            )));
        }
    };

    const handleCreateCategory = async () => {
        const categoryName = categoryForm.name.trim();

        if (!categoryName) {
            setCategoryError('Vui long nhap ten danh muc.');
            return;
        }

        const duplicatedCategory = categoryOptions.find((category) => {
            const sameName = category.category_name.trim().toLowerCase() === categoryName.toLowerCase();
            const compatibleType = !category.tx_type || category.tx_type === categoryForm.txType;
            return sameName && compatibleType;
        });

        if (duplicatedCategory) {
            attachCategoryToTarget(duplicatedCategory, categoryTarget);
            closeCategoryCreator();
            return;
        }

        try {
            setIsCreatingCategory(true);

            const createdCategory = await createCategory({
                categoryName,
                txType: categoryForm.txType
            });

            setCategoryOptions((prev) => [...prev, createdCategory]);
            attachCategoryToTarget(createdCategory, categoryTarget);
            await onCategoriesChanged?.();
            closeCategoryCreator();
        } catch (error) {
            console.error('Error creating category:', error);
            setCategoryError(error?.message || 'Khong the tao danh muc moi.');
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const handleManualSubmit = async () => {
        try {
            setIsSavingManual(true);

            if (isEditMode) {
                await updateTransaction(transaction.trans_id, {
                    ...formData,
                    user_id: user?.user_id || transaction?.user_id || ''
                });
                await onTransactionsCreated?.();
                await closeAddModal();
                alert('Giao dich da duoc cap nhat.');
                return;
            }

            await createTransaction({
                ...formData,
                user_id: user.user_id
            });
            await onTransactionsCreated?.();
            await closeAddModal();
            alert('Giao dich da duoc them.');
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert(error?.message || 'Vui long nhap day du va dung thong tin giao dich.');
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

            const transactions = result.transactions.map((item) => ({
                ...item,
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
        const invalidTransaction = previewTransactions.find((item) =>
            !item.note ||
            !item.wallet_id ||
            !item.category_id ||
            !item.tx_date ||
            Number(item.amount) <= 0
        );

        if (invalidTransaction) {
            setParseError('Ban xem truoc con dong thieu danh muc, vi, ngay hoac so tien khong hop le.');
            return;
        }

        try {
            setIsSavingQuick(true);
            await createTransactions(previewTransactions.map((item) => ({
                user_id: user.user_id,
                wallet_id: item.wallet_id,
                category_id: item.category_id,
                amount: Number(item.amount),
                note: item.note,
                tx_date: item.tx_date,
                tx_type: item.tx_type
            })));
            await onTransactionsCreated?.();
            await closeAddModal();
            alert(`Da them ${previewTransactions.length} giao dich.`);
        } catch (error) {
            console.error('Error saving quick transactions:', error);
            setParseError('Khong the luu danh sach giao dich nhanh.');
        } finally {
            setIsSavingQuick(false);
        }
    };

    const modalTitle = isEditMode ? 'Sua giao dich' : 'Them giao dich';
    const modalDescription = isEditMode
        ? 'Cap nhat thong tin giao dich hien co.'
        : 'Co the nhap thu cong hoac dan ghi chu dai de AI tach giao dich.';

    return (
        <>
            <div className="modal fade" id={modalId} tabIndex="-1" ref={modalRef}>
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div>
                                <h5 className="modal-title mb-1">{modalTitle}</h5>
                                <small className="text-muted">{modalDescription}</small>
                            </div>
                            <button className="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <div className="modal-body">
                            {!isEditMode ? (
                                <div className="quick-add-tabs mb-3">
                                    <button
                                        type="button"
                                        className={`quick-add-tab ${activeMode === 'manual' ? 'active' : ''}`}
                                        onClick={() => setActiveMode('manual')}
                                    >
                                        Them thu cong
                                    </button>
                                    <button
                                        type="button"
                                        className={`quick-add-tab ${activeMode === 'quick' ? 'active' : ''}`}
                                        onClick={() => setActiveMode('quick')}
                                    >
                                        Them nhanh bang van ban
                                    </button>
                                </div>
                            ) : null}

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
                                        Khong co danh muc phu hop? Tao moi
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
                                            uong Phuc Long het 65k, an mi cay het 79k, mua ao het 100k
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
                                            AI se co gang doan loai giao dich va danh muc tu danh muc hien co.
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
                                                <h6 className="mb-0">Xem truoc giao dich</h6>
                                                <span className="badge text-bg-secondary">{previewTransactions.length} dong</span>
                                            </div>

                                            {previewTransactions.map((item, index) => (
                                                <div key={`${item.note}-${index}`} className="quick-preview-row">
                                                    <div className="row g-2">
                                                        <div className="col-12">
                                                            <label className="form-label small mb-1">Ghi chu</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={item.note}
                                                                onChange={(event) => handlePreviewChange(index, 'note', event.target.value)}
                                                            />
                                                        </div>
                                                        <div className="col-md-3">
                                                            <label className="form-label small mb-1">So tien</label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={item.amount}
                                                                onChange={(event) => handlePreviewChange(index, 'amount', event.target.value)}
                                                            />
                                                        </div>
                                                        <div className="col-md-3">
                                                            <label className="form-label small mb-1">Loai</label>
                                                            <select
                                                                className="form-select"
                                                                value={item.tx_type}
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
                                                                value={item.category_id}
                                                                onChange={(event) => {
                                                                    const category = categoryOptions.find(
                                                                        (candidate) => String(candidate.category_id) === event.target.value
                                                                    );
                                                                    handlePreviewChange(index, 'category_id', event.target.value);
                                                                    handlePreviewChange(index, 'category_name', category?.category_name || '');
                                                                }}
                                                            >
                                                                <option value="">Chon danh muc</option>
                                                                {getSelectableCategories(item.tx_type).map((category) => (
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
                                                                Tao danh muc moi cho dong nay
                                                            </button>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <label className="form-label small mb-1">Do tin cay</label>
                                                            <div className="quick-preview-confidence">
                                                                {Math.round(item.confidence * 100)}%
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
                                    {isSavingManual ? 'Dang luu...' : isEditMode ? 'Cap nhat' : 'Luu'}
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

            <div className="modal fade" id={categoryModalId} tabIndex="-1" ref={categoryModalRef}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div>
                                <h5 className="modal-title mb-1">Tao danh muc moi</h5>
                                <small className="text-muted">
                                    Ap dung cho: {CATEGORY_TYPE_LABELS[categoryForm.txType] || 'Chi tieu'}
                                </small>
                            </div>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={() => closeCategoryCreator()}
                            ></button>
                        </div>

                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Ten danh muc</label>
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
                                <label className="form-label">Loai danh muc</label>
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
                                onClick={() => closeCategoryCreator()}
                                disabled={isCreatingCategory}
                            >
                                Huy
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
        </>
    );
};

export default AddTransactionModal;
