import React, { useState, useRef, useEffect } from 'react';
import '../css/LoginForm.css';
import { supabase } from '../services/supabase';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});

    

    const emailInputRef = useRef(null);

    useEffect(() => {
        if (emailInputRef.current) {
            emailInputRef.current.focus();
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };
    const validate = () => {
        const newErrors = {};
        if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
        if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
        return newErrors;
    };
    const focusPasswordInput = () => {
        const passwordInput = document.querySelector('input[name="password"]');
        if (passwordInput) {
            passwordInput.focus();
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        const { error: authError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
        });
        if (authError) {
            console.error('Lỗi đăng nhập:', authError.message);
            if (authError.status === 400) {
                setErrors({ password: 'Email hoặc mật khẩu không đúng' });
                focusPasswordInput();
            }
        } else {
            login();
            navigate('/dashboard');
        }
    };
    return (
        <div className="p-4 p-md-5 w-100" style={{ maxWidth: '440px', margin: '0 auto' }}>
            <div className="mb-5">
                <h1 className="display-6 fw-extrabold mb-2 font-headline">Đăng nhập</h1>
            </div>
            
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                <div>
                    <label className="form-label small fw-bold text-muted px-1">Email</label>
                    <input 
                        type="text" 
                        name="email"
                        ref={emailInputRef}
                        className= {`form-control form-control-custom ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="Nhập email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div> }
                </div>
                <div>
                    <label className="form-label small fw-bold text-muted px-1">Mật khẩu</label>
                    <input 
                        type="password" 
                        name="password"
                        className= {`form-control form-control-custom ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Nhập mật khẩu"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>                
                <div className="d-flex justify-content-end align-items-center small">
                    <a href="#forgot" className="text-decoration-none" style={{color: 'var(--emerald-primary)'}}>Forgot Password?</a>
                </div>

                <button type="submit" className="btn-primary-emerald w-100 shadow-sm font-headline">
                    Signin
                </button>
            </form>

            <div className="mt-5">
                <div className="divider-text mb-4">Or Continue With</div>
                    <div className="d-flex justify-content-center gap-4">
                        <button className="social-btn btn-fb shadow-sm" aria-label="Login with Facebook"></button>
                        <button className="social-btn btn-gg shadow-sm" aria-label="Login with Google"></button>
                        <button className="social-btn btn-in shadow-sm" aria-label="Login with LinkedIn"></button>
                    </div>
            </div>
        </div>
    );
};

export default LoginForm;