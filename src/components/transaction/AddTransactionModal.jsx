import React, { useState } from 'react';

const AddTransactionModal = () => {
    const [formData, setFormData] = useState({
        name: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        console.log('Submit:', formData);
        // TODO: gọi API add transaction
    };

    return (
        <div
            className="modal fade"
            id="addModal"
            tabIndex="-1"
            aria-hidden="true"
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    
                    <div className="modal-header">
                        <h5 className="modal-title">Thêm giao dịch mới</h5>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                        ></button>
                    </div>

                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Tên</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                        >
                            Close
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                        >
                            Save
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AddTransactionModal;