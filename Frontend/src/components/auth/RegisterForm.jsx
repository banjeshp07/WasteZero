import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterForm.css';

const volunteerSkills = [
    "Teaching",
    "Event Planning",
    "Community Outreach",
    "Fundraising",
    "Healthcare Support",
    "Environmental Conservation",
    "Youth Mentoring",
    "Administrative Support",
    "Social Media Management",
    "Technical Support"
];

const RegisterForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        role: '',
        mobile: '',
        location: '',
        email: '',
        password: '',
        confirmPassword: '',
        skills: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSkills, setShowSkills] = useState(false);
    const skillsRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (skillsRef.current && !skillsRef.current.contains(event.target)) {
                setShowSkills(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    role: formData.role,
                    mobile: formData.mobile,
                    location: formData.location,
                    email: formData.email,
                    password: formData.password,
                    skills: formData.skills
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registration successful!');
                navigate('/');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-header">
                <h2 className="register-title">New Account?</h2>
            </div>

            <form className="register-form" onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}

                {/* Username */}
                <div className="form-group">
                    <div className="input-with-icon">
                        <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            className="form-input has-icon"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Role Selection */}
                <div className="form-group">
                    <div className="input-with-icon">
                        <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <select
                            name="role"
                            className="form-input has-icon"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select Role</option>
                            <option value="volunteer">Volunteer</option>
                            <option value="NGO">NGO</option>
                        </select>
                    </div>
                </div>

                {/* Skills Selection - Only for Volunteers */}
                {formData.role === "volunteer" && (
                    <div className="form-group" ref={skillsRef}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem', fontWeight: '500' }}>
                            Select Your Skills *
                        </label>
                        <div className="input-with-icon">
                            <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            <div
                                className="form-input has-icon"
                                style={{ cursor: "pointer", minHeight: '45px', display: 'flex', alignItems: 'center' }}
                                onClick={() => setShowSkills(!showSkills)}
                            >
                                {formData.skills.length > 0
                                    ? formData.skills.join(", ")
                                    : "Click to select skills"}
                            </div>
                        </div>

                        {showSkills && (
                            <div className="skills-grid">
                                {volunteerSkills.map((skill, index) => (
                                    <label key={index} className="skill-item">
                                        <input
                                            type="checkbox"
                                            checked={formData.skills.includes(skill)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData({
                                                        ...formData,
                                                        skills: [...formData.skills, skill]
                                                    });
                                                } else {
                                                    setFormData({
                                                        ...formData,
                                                        skills: formData.skills.filter(s => s !== skill)
                                                    });
                                                }
                                            }}
                                        />
                                        {skill}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Mobile Number */}
                <div className="form-group">
                    <div className="input-with-icon">
                        <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <input
                            type="tel"
                            name="mobile"
                            placeholder="Mobile number"
                            className="form-input has-icon"
                            value={formData.mobile}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="form-group">
                    <div className="input-with-icon">
                        <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input
                            type="text"
                            name="location"
                            placeholder="Location"
                            className="form-input has-icon"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="form-group">
                    <div className="input-with-icon">
                        <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="form-input has-icon"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="form-group">
                    <div className="input-with-icon">
                        <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="form-input has-icon"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                    <div className="input-with-icon">
                        <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm password"
                            className="form-input has-icon"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="register-actions">
                    <button className="btn-register" type="submit" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </div>

                <div className="signin-link">
                    Already have an account? <Link to="/">Sign in</Link>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;
