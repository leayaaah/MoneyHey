// src/pages/RegisterPage.jsx
// Presentation layer — register page
import React from 'react';
import LoginHeader from '../components/layout/LoginHeader';
import RegisterForm from '../components/auth/RegisterForm';
import Footer from '../components/layout/Footer';
import '../css/Register.css';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-vh-100 d-flex flex-column">
            <LoginHeader />

            <main className="flex-grow-1 d-flex align-items-center justify-content-center p-3 pt-5 mt-4">
                <div className="container-fluid" style={{ maxWidth: '1200px' }}>
                    <div className="row justify-content-center">
                        <div className="col-12 col-xl-10">
                            <div className="register-card bg-white d-flex flex-column flex-md-row">
                                <div className="col-md-6 emerald-gradient d-none d-md-flex flex-column justify-content-center align-items-center text-center p-5 position-relative text-white">
                                    <div className="position-absolute top-0 start-0 p-5 opacity-25">
                                        <div style={{ width: '200px', height: '200px', borderRadius: '50%', background: 'white', filter: 'blur(80px)' }}></div>
                                    </div>

                                    <div className="z-2">
                                        <h2 className="display-4 fw-bold mb-4 font-headline">Join us today!</h2>
                                        <p className="lead mb-4 px-3 opacity-75">
                                            Tạo tài khoản ngay để bắt đầu kiểm soát tài chính cá nhân, theo dõi chi tiêu và đạt được mục tiêu tài chính của bạn!
                                        </p>
                                        <div className="mt-2">
                                            <p className="small opacity-75 mb-3">Đã có tài khoản?</p>
                                            <button
                                                className="btn btn-outline-light rounded-pill px-5 py-2 fw-bold font-headline"
                                                style={{ borderWidth: '2px' }}
                                                onClick={() => navigate('/login')}
                                            >
                                                Đăng nhập
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6 d-flex align-items-center bg-white">
                                    <RegisterForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default RegisterPage;
