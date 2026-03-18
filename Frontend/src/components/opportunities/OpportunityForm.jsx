import React, { useState, useEffect, useRef } from 'react';
import apiService from '../../services/apiService';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useToast } from '../ui/ToastContext';
import '../layout/RegisterPage.css'; // Reuse RegisterPage layout styles
import '../auth/RegisterForm.css';   // Reuse Form styles

// Assets
import TopLeftPlant from '../../assets/Top left plant.svg';
import RightSideLeaf from '../../assets/Right side leaf.svg';
import BottomRightPlant from '../../assets/Bottom right.svg';

// Icons
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTools, FaFileAlt, FaPen } from 'react-icons/fa';

const eventSkills = [
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

const OpportunityForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        skills: [],
        duration: '',
        location: '',
        date: ''
    });
    const [showSkills, setShowSkills] = useState(false);
    const skillsRef = useRef(null);

    useEffect(() => {
        if (id) {
            fetchOpportunity();
        }
    }, [id]);

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

    const fetchOpportunity = async () => {
        try {
            const response = await apiService.getOpportunityById(id);
            const opportunity = response.data;
            setFormData({
                title: opportunity.title,
                description: opportunity.description,
                skills: Array.isArray(opportunity.skills) ? opportunity.skills : [],
                duration: opportunity.duration,
                location: opportunity.location,
                date: opportunity.date.split('T')[0] // Format date for input
            });
        } catch (error) {
            console.error('Error fetching opportunity:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await apiService.updateOpportunity(id, formData);
                toast.success('Event updated successfully!');
            } else {
                await apiService.createOpportunity(formData);
                toast.success('Event created successfully!');
            }
            navigate('/dashboard');
        } catch (error) {
            console.error('Error saving opportunity:', error);
            toast.error('Error saving event. Please try again.');
        }
    };

    return (
        <div className="register-page-container">
            {/* Background/Decor Assets */}
            <img src={TopLeftPlant} alt="" className="decor-top-left" />
            <img src={RightSideLeaf} alt="" className="decor-right-side" />

            <div className="register-content-wrapper">
                {/* Character Removed */}

                {/* Reuse Register Card Panel */}
                <div className="register-card-panel" style={{ minHeight: 'auto', width: '100%', maxWidth: '520px' }}>

                    <div className="register-container">
                        <div className="register-header">
                            <h2 className="register-title">{id ? 'Edit Event' : 'New Event'}</h2>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>Create meaningful volunteering opportunities.</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <div className="input-with-icon">
                                    <FaPen className="input-icon" />
                                    <input
                                        type="text"
                                        name="title"
                                        className="form-input has-icon"
                                        placeholder="Event Title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        style={{ width: '100%' }}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid-two-col">
                                <div className="form-group">
                                    <div className="input-with-icon">
                                        <FaCalendarAlt className="input-icon" />
                                        <input
                                            type="date"
                                            name="date"
                                            className="form-input has-icon"
                                            value={formData.date}
                                            onChange={handleChange}
                                            style={{ width: '100%' }}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <div className="input-with-icon">
                                        <FaClock className="input-icon" />
                                        <input
                                            type="text"
                                            name="duration"
                                            className="form-input has-icon"
                                            placeholder="Duration"
                                            value={formData.duration}
                                            onChange={handleChange}
                                            style={{ width: '100%' }}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="input-with-icon">
                                    <FaMapMarkerAlt className="input-icon" />
                                    <input
                                        type="text"
                                        name="location"
                                        className="form-input has-icon"
                                        placeholder="Location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        style={{ width: '100%' }}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group" ref={skillsRef}>
                                <div className="input-with-icon">
                                    <FaTools className="input-icon" />
                                    <div
                                        className="form-input has-icon"
                                        style={{ cursor: "pointer", width: '100%' }}
                                        onClick={() => setShowSkills(!showSkills)}
                                    >
                                        {formData.skills.length > 0
                                            ? formData.skills.join(", ")
                                            : "Select Required Skills"}
                                    </div>
                                </div>

                                {showSkills && (
                                    <div className="skills-grid">
                                        {eventSkills.map((skill, index) => (
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

                            <div className="form-group">
                                <div className="input-with-icon">
                                    <FaFileAlt className="input-icon" style={{ top: '15px' }} />
                                    <textarea
                                        name="description"
                                        className="form-input has-icon"
                                        placeholder="Event Description..."
                                        rows="4"
                                        value={formData.description}
                                        onChange={handleChange}
                                        style={{ width: '100%', resize: 'none' }}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-register"
                                style={{ backgroundColor: '#FBC02D', marginTop: '0.5rem' }}
                            >
                                {id ? 'Update Event' : 'Create Event'}
                            </button>
                        </form>

                        <div className="signin-link" style={{ marginTop: '1rem' }}>
                            <Link to="/dashboard">Cancel</Link>
                        </div>
                    </div>

                    <img src={BottomRightPlant} alt="" className="decor-bottom-right" />
                </div>
            </div>
        </div>
    );
};

export default OpportunityForm;