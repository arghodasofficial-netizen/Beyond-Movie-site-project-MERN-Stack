// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                
                
                <div className="footer-col">
                    <h2 className="footer-logo">
                        <span className="logo-icon">B</span> BEYOND
                    </h2>
                    <p className="footer-desc">
                        The largest movie collection is now at your fingertips.
Enjoy new releases, action, drama, and much more.
                    </p>
                </div>

                
                <div className="footer-col">
                    <h3>Explore</h3>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/category/Action">Action Movies</Link></li>
                        <li><Link to="/category/Horror">Horror Movies</Link></li>
                        <li><Link to="/release/2026">New Releases</Link></li>
                    </ul>
                </div>

                
                <div className="footer-col">
                    <h3>Help & Legal</h3>
                    <ul className="footer-links">
                        <li><Link to="/">Terms of Service</Link></li>
                        <li><Link to="/">Privacy Policy</Link></li>
                        <li><Link to="/">FAQ</Link></li>
                        <li><Link to="/request">Request a Movie</Link></li>
                    </ul>
                </div>

                
                <div className="footer-col">
                    <h3>Follow Us</h3>
                    <div className="social-icons">
                        <a href="#" className="social-icon">Facebook</a>
                        <a href="#" className="social-icon">Twitter</a>
                        <a href="#" className="social-icon">Instagram</a>
                        <a href="#" className="social-icon">YouTube</a>
                    </div>
                </div>
            </div>

            
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Beyond. All Rights Reserved.</p>
                <p>Designed by <span style={{color: '#e50914'}}>Badhon Das Argho</span></p>
            </div>
        </footer>
    );
};

export default Footer;