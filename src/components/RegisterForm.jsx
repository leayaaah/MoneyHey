import React, { useState, useRef, useEffect } from 'react';
import '../css/RegisterForm.css';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});

    const fullNameInputRef = useRef(null);

    useEffect(() => {
        if (fullNameInputRef.current) {
            fullNameInputRef.current.focus();
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
        if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
        if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
        else if (formData.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu không khớp';
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        alert(`Đăng ký thành công: ${formData.email}`);
    };

    return (
        <div className="p-4 p-md-5 w-100" style={{ maxWidth: '440px', margin: '0 auto' }}>
            <div className="mb-4">
                <h1 className="display-6 fw-extrabold mb-2 font-headline">Đăng ký</h1>
            </div>

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                <div>
                    <label className="form-label small fw-bold text-muted px-1">Họ và tên</label>
                    <input
                        type="text"
                        name="fullName"
                        ref={fullNameInputRef}
                        className={`form-control form-control-custom${errors.fullName ? ' is-invalid' : ''}`}
                        placeholder="Nhập họ và tên"
                        value={formData.fullName}
                        onChange={handleChange}
                    />
                    {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                </div>

                <div>
                    <label className="form-label small fw-bold text-muted px-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        className={`form-control form-control-custom${errors.email ? ' is-invalid' : ''}`}
                        placeholder="Nhập email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div>
                    <label className="form-label small fw-bold text-muted px-1">Mật khẩu</label>
                    <input
                        type="password"
                        name="password"
                        className={`form-control form-control-custom${errors.password ? ' is-invalid' : ''}`}
                        placeholder="Nhập mật khẩu"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div>
                    <label className="form-label small fw-bold text-muted px-1">Xác nhận mật khẩu</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        className={`form-control form-control-custom${errors.confirmPassword ? ' is-invalid' : ''}`}
                        placeholder="Nhập lại mật khẩu"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                </div>

                <button type="submit" className="btn-primary-emerald w-100 shadow-sm font-headline mt-1">
                    Đăng ký
                </button>
            </form>

            <div className="mt-4">
                <div className="divider-text mb-4">Or Continue With</div>
                <div className="d-flex justify-content-center gap-4">
                    <button className="social-btn btn-fb shadow-sm" aria-label="Register with Facebook"></button>
                    <button className="social-btn btn-gg shadow-sm" aria-label="Register with Google"></button>
                    <button className="social-btn btn-in shadow-sm" aria-label="Register with LinkedIn"></button>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
