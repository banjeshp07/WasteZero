import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/apiService';
import { useToast } from '../ui/ToastContext';
import './ApplicationsPage.css';

const ApplicationsPage = () => {
    const toast = useToast();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        // Get user info from token
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                setUserRole(decoded.role);
                setUserId(decoded.id);
            } catch (e) {
                console.error("Token decode error", e);
            }
        }

        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await apiService.getOpportunities();
            const allApplications = [];

            response.data.forEach(event => {
                if (event.applications && event.applications.length > 0) {
                    event.applications.forEach(app => {
                        allApplications.push({
                            ...app,
                            eventTitle: event.title,
                            eventId: event._id,
                            eventDate: event.date,
                            eventLocation: event.location,
                            ngoName: event.createdBy?.username || 'Unknown NGO'
                        });
                    });
                }
            });

            setApplications(allApplications);
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (eventId, volunteerId, status) => {
        try {
            await apiService.updateApplicationStatus(eventId, {
                volunteerId,
                status
            });
            toast.success(`Application ${status} successfully!`);
            fetchApplications(); // Refresh list
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update application status");
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'accepted':
                return 'status-accepted';
            case 'rejected':
                return 'status-rejected';
            case 'pending':
            default:
                return 'status-pending';
        }
    };

    // Filter applications based on user role
    const filteredApplications = userRole === 'volunteer'
        ? applications.filter(app => app.volunteer?._id === userId)
        : applications.filter(app => app.status === 'pending'); // NGOs see pending applications

    return (
        <div className="applications-page">
            {/* Header */}
            <div className="applications-header">
                <div className="header-content">
                    <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
                    <h1>
                        {userRole === 'volunteer' ? 'My Applications' : 'Application Requests'}
                    </h1>
                </div>
            </div>

            {/* Applications List */}
            <div className="applications-container">
                {loading ? (
                    <div className="loading">Loading applications...</div>
                ) : filteredApplications.length === 0 ? (
                    <div className="no-applications">
                        {userRole === 'volunteer'
                            ? "You haven't applied to any events yet."
                            : "No pending applications at the moment."}
                    </div>
                ) : (
                    <div className="applications-list">
                        {filteredApplications.map((app, index) => (
                            <div key={index} className="application-card">
                                <div className="app-header">
                                    <div>
                                        <h3>{app.eventTitle}</h3>
                                        <span className={`status-badge ${getStatusBadgeClass(app.status)}`}>
                                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                        </span>
                                    </div>
                                    {userRole === 'volunteer' && (
                                        <div className="ngo-info">
                                            <span className="label">NGO:</span>
                                            <span className="value">{app.ngoName}</span>
                                        </div>
                                    )}
                                    {userRole === 'ngo' && app.volunteer && (
                                        <div className="volunteer-info">
                                            <span className="label">Volunteer:</span>
                                            <span className="value">{app.volunteer.username}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="app-details">
                                    <div className="detail-item">
                                        <span className="icon">📅</span>
                                        <span>{new Date(app.eventDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="icon">📍</span>
                                        <span>{app.eventLocation}</span>
                                    </div>
                                    {userRole === 'ngo' && app.volunteer && (
                                        <>
                                            <div className="detail-item">
                                                <span className="icon">📧</span>
                                                <span>{app.volunteer.email}</span>
                                            </div>
                                            {app.volunteer.location && (
                                                <div className="detail-item">
                                                    <span className="icon">🏠</span>
                                                    <span>{app.volunteer.location}</span>
                                                </div>
                                            )}
                                            {app.volunteer.skills && app.volunteer.skills.length > 0 && (
                                                <div className="detail-item">
                                                    <span className="icon">🎯</span>
                                                    <span>{app.volunteer.skills.join(', ')}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {userRole === 'ngo' && app.status === 'pending' && (
                                    <div className="app-actions">
                                        <button
                                            onClick={() => handleStatusUpdate(app.eventId, app.volunteer._id, 'accepted')}
                                            className="btn-approve"
                                        >
                                            ✔ Approve
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(app.eventId, app.volunteer._id, 'rejected')}
                                            className="btn-reject"
                                        >
                                            ✖ Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationsPage;
