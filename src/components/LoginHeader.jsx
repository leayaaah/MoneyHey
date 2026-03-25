import React from 'react';
import '../css/Header.css';

const LoginHeader = () => (
    <header className="login-header fixed-top d-flex align-items-center px-3 px-md-5">
        <div className="container-fluid d-flex justify-content-between align-items-center">
            <div className="fs-5 fw-bold font-headline" style={{ color: 'var(--emerald-primary)' }}>
                Money Hey
            </div>

            <nav className="d-none d-md-flex gap-4">
                <a href="#signin" className="text-decoration-none fw-bold" style={{ color: 'var(--emerald-primary)' }}>Đăng nhập</a>
                <a href="#explore" className="text-decoration-none text-muted">Khám phá</a>
                <a href="#archive" className="text-decoration-none text-muted">Kho lưu trữ</a>
            </nav>

            <div className="d-flex align-items-center gap-2">
                <button className="btn btn-link text-muted text-decoration-none btn-sm d-none d-md-block">Help</button>
                <button className="btn d-md-none border-0 p-1" aria-label="Open menu">
                    <span className="material-symbols-outlined" style={{ color: 'var(--text-main)' }}>menu</span>
                </button>
            </div>
        </div>
    </header>
);

export default LoginHeader;
