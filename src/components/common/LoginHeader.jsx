import React from 'react';
import '../../css/Header.css';
import { Link } from 'react-router-dom';

const LoginHeader = () => (
    <header className="login-header fixed-top d-flex align-items-center px-3 px-md-5">
        <div className="container-fluid d-flex justify-content-between align-items-center">
            <div className="fs-5 fw-bold font-headline" style={{ color: 'var(--emerald-primary)' }}>
                Money Hey
            </div>

            <nav className="d-none d-md-flex gap-4">
                <Link to="/login" className="text-decoration-none fw-bold" style={{ color: 'var(--emerald-primary)' }}>
                    Đăng nhập
                </Link>
                <Link to="/register" className="text-decoration-none fw-bold" style={{ color: 'var(--emerald-primary)' }}>
                    Đăng ký
                </Link>
                <Link to="/explore" className="text-decoration-none text-muted">
                    Khám phá
                </Link>
            </nav>

            <div className="d-flex align-items-center gap-2">
                <button className="btn btn-link text-muted text-decoration-none btn-sm d-none d-md-block">Help</button>
            </div>
        </div>
    </header>
);

export default LoginHeader;
