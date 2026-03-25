import React from 'react';
import Header from './Header';
import LoginForm from './LoginForm';
import Footer from './Footer';
import '../css/Login.css';

const Login = () => {
    return (
        <div className="min-vh-100 d-flex flex-column">
            <Header />
            
            <main className="flex-grow-1 d-flex align-items-center justify-content-center p-3 pt-5 mt-4">
                <div className="container-fluid" style={{ maxWidth: '1200px' }}>
                    <div className="row justify-content-center">
                        <div className="col-12 col-xl-10">

                            <div className="login-card bg-white d-flex flex-column flex-md-row">
                                

                                <div className="col-md-6 d-flex align-items-center bg-white">
                                    <LoginForm />
                                </div>

                                <div className="col-md-6 emerald-gradient d-none d-md-flex flex-column justify-content-center align-items-center text-center p-5 position-relative text-white">
                                    <div className="position-absolute top-0 end-0 p-5 opacity-25">
                                        <div style={{width: '200px', height: '200px', borderRadius: '50%', background: 'white', filter: 'blur(80px)'}}></div>
                                    </div>
                                    
                                    <div className="z-2">
                                        <h2 className="display-4 fw-bold mb-4 font-headline">Welcome back!</h2>
                                        <p className="lead mb-4 px-3 opacity-75">
                                            Quản lý tài chính cá nhân chưa bao giờ dễ dàng đến thế. Hãy đăng nhập để bắt đầu hành trình kiểm soát chi tiêu và đạt được mục tiêu tài chính của bạn!
                                        </p>
                                        
                                        <div className="mt-2">
                                            <p className="small opacity-75 mb-3">Chưa có tài khoản?</p>
                                            <button className="btn btn-outline-light rounded-pill px-5 py-2 fw-bold font-headline" style={{borderWidth: '2px'}}>
                                                Đăng ký ngay
                                            </button>
                                        </div>
                                    </div>

    
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

export default Login;