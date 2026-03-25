// Footer.jsx
import React from 'react';

const Footer = () => (
    <footer className="py-4 px-5 d-flex flex-column flex-md-row justify-content-between align-items-center small text-muted">
        <div className="mb-2 mb-md-0">
            © 2026 MoneyKepper website 
        </div>
        <div className="d-flex gap-4">
            <a href="#privacy" className="text-muted text-decoration-none">Privacy Policy</a>
            <a href="#terms" className="text-muted text-decoration-none">Terms of Service</a>
            <a href="#contact" className="text-muted text-decoration-none">Contact</a>
        </div>
    </footer>
);

export default Footer;