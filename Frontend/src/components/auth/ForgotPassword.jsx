import React from 'react';
import { Link } from 'react-router-dom';
import SplitCard from '../../components/layout/SplitCard';
import forgotImg from "../../assets/Error Illustration.jpg";
import './ForgotPassword.css';

const ForgotIllustration = () => {
    return (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '350px' }}>
            <img
                src={forgotImg}
                alt="Forgot Password Illustration"
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px' }}
            />
            <h1 style={{ marginTop: '2rem', fontSize: '2rem', color: '#1E293B' }}>Waste Zero</h1>
        </div>
    );
};

const ForgotPasswordForm = () => {
    const [step, setStep] = React.useState(1); // 1: Email, 2: OTP, 3: Reset
    const [email, setEmail] = React.useState('');
    const [otp, setOtp] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setStep(2);
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp })
            });

            const data = await response.json();

            if (response.ok) {
                setStep(3);
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp, newPassword: password })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Password reset successfully!');
                window.location.href = '/';
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            {step === 1 && (
                <>
                    <h2 className="fp-title">Forgot Password</h2>
                    <p className="fp-subtitle">
                        Enter your registered email address.<br />
                        We will send you OTP.
                    </p>
                    <form onSubmit={handleEmailSubmit}>
                        {error && <div className="error-message">{error}</div>}
                        <div className="form-group">
                            <label htmlFor="fp-email">Email Address</label>
                            <input
                                type="email"
                                id="fp-email"
                                placeholder="Enter your email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button className="btn-login" style={{ marginTop: '1rem' }} disabled={loading}>
                            {loading ? 'Sending...' : 'Send Code'}
                        </button>
                    </form>
                </>
            )}

            {step === 2 && (
                <>
                    <h2 className="fp-title">Enter OTP</h2>
                    <p className="fp-subtitle">
                        Enter OTP sent to your email
                    </p>
                    <form onSubmit={handleOtpSubmit}>
                        {error && <div className="error-message">{error}</div>}
                        <div className="form-group">
                            <label htmlFor="fp-otp">OTP Code</label>
                            <input
                                type="text"
                                id="fp-otp"
                                maxLength="6"
                                placeholder="------"
                                className="form-input otp-input"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem' }}
                                required
                            />
                        </div>
                        <button className="btn-login" style={{ marginTop: '1rem' }} disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                </>
            )}

            {step === 3 && (
                <>
                    <h2 className="fp-title">Reset Password</h2>
                    <p className="fp-subtitle">
                        Create a new password for your account.
                    </p>
                    <form onSubmit={handleResetSubmit}>
                        {error && <div className="error-message">{error}</div>}
                        <div className="form-group">
                            <label htmlFor="fp-pass">New Password</label>
                            <input
                                type="password"
                                id="fp-pass"
                                placeholder="New Password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="fp-cpass">Retype Password</label>
                            <input
                                type="password"
                                id="fp-cpass"
                                placeholder="Confirm Password"
                                className="form-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button className="btn-login" style={{ marginTop: '1rem' }} disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </>
            )}

            <div className="links" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <Link to="/" style={{ color: '#4CAF50', fontWeight: 'bold' }}>Back to Login</Link>
            </div>
        </div>
    );
};

function ForgotPassword() {
    return (
        <SplitCard
            leftContent={<ForgotIllustration />}
            rightContent={<ForgotPasswordForm />}
        />
    );
}

export default ForgotPassword;
