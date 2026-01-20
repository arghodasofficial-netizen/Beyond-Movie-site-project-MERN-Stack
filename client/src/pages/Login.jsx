// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();


        const adminEmail = "admin@gmail.com"; 
        const adminPass = "admin123";

        if (email === adminEmail && password === adminPass) {
         
            localStorage.setItem("isAdmin", "true");
            alert("✅ Login Successful!");
            navigate('/upload'); 
        } else {
            alert("❌ Wrong Email or Password!");
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div className="upload-container" style={{ width: '400px', textAlign: 'center' }}>
                <h2 className="form-header">Admin Login</h2>
                <form onSubmit={handleLogin}>
                    <input 
                        className="modern-input" 
                        type="email" 
                        placeholder="Admin Email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                    />
                    <input 
                        className="modern-input" 
                        type="password" 
                        placeholder="Secret Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    />
                    <button type="submit" className="upload-btn">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;