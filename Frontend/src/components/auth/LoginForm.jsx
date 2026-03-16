import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../Button/Button';
import './LoginForm.css';
import LogoIcon from '../../assets/Logo.svg';

const LoginForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user info
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', data.user.role.toLowerCase());
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirect based on role
                window.location.href = '/dashboard';
            } else {
                // If invalid credentials from backend, show error (don't fallback to mock for wrong password)
                setError(data.message || 'Login failed');
            }
        } catch (error) {
            console.log("Backend offline, checking for mock admin credentials...");
            // OFFLINE DEV MODE FALLBACK
            if ((formData.emailOrUsername === 'admin' || formData.emailOrUsername === 'admin@wastezero.com') && formData.password === 'admin@123') {
                localStorage.setItem('token', 'mock-admin-token');
                localStorage.setItem('userRole', 'admin');
                localStorage.setItem('user', JSON.stringify({ username: 'Admin', role: 'admin', email: 'admin@wastezero.com' }));
                setLoading(false);
                window.location.href = '/dashboard';
                return;
            }

            setError('Network error. Backend unreachable.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-header">
                <div className="brand-logo-container">
                    <img src={LogoIcon} alt="Waste Zero Logo" className="logo-icon" />
                    <h2 className="brand-text">
                        Waste <span style={{ color: '#4CAF50' }}>Zero</span>
                    </h2>
                </div>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="emailOrUsername">Username or Email</label>
                    <input
                        type="text"
                        id="emailOrUsername"
                        name="emailOrUsername"
                        placeholder="Email or Username"
                        className="form-input"
                        value={formData.emailOrUsername}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Password"
                        className="form-input"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <div className="forgot-password">
                        <Link to="/forgot-password">Forgot password?</Link>
                    </div>
                </div>

                <div className="form-actions">
                    <button className="btn-login" type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </div>

                <div className="register-link">
                    Are you new ? <Link to="/register">Register</Link>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;
