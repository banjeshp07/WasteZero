import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import apiService from '../../services/apiService';
import { Link } from 'react-router-dom';
import VolunteerNotificationBell from '../notifications/VolunteerNotificationBell';
import { useToast } from '../ui/ToastContext';

const VolunteerDashboard = () => {
    const toast = useToast();
    const [applications, setApplications] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        completed: 0,
        impact: '87%'
    });
    const currentUserId = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiService.getOpportunities();
                const allEvents = response.data;

                const myApps = [];
                const otherEvents = [];

                allEvents.forEach(event => {
                    // FIX: Added optional chaining and null checks for volunteer object
                    const myApplication = event.applications?.find(app => {
                        if (!app.volunteer) return false;
                        const volunteerId = app.volunteer._id || app.volunteer;
                        return volunteerId === currentUserId;
                    });

                    if (myApplication) {
                        myApps.push({
                            ...myApplication,
                            eventTitle: event.title,
                            eventDate: event.date,
                            eventLocation: event.location,
                            ngoName: event.createdBy?.username || 'Unknown NGO'
                        });
                    } else {
                        const eventDate = new Date(event.date);
                        const today = new Date();
                        eventDate.setHours(0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);

                        if (eventDate >= today) {
                            otherEvents.push(event);
                        }
                    }
                });

                setApplications(myApps);
                setUpcomingEvents(otherEvents);

                const approvedCount = myApps.filter(app => app.status === 'accepted').length;
                setStats({
                    total: myApps.length,
                    approved: approvedCount,
                    completed: 0, 
                    impact: '87%'
                });

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [currentUserId]);

    const handleApply = async (eventId) => {
        try {
            await apiService.applyForOpportunity(eventId);
            toast.success("Application submitted successfully!");
            window.location.reload();
        } catch (error) {
            console.error("Error applying:", error);
            toast.error(error.response?.data?.message || "Failed to apply");
        }
    };

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-brand">
                    <span role="img" aria-label="logo">♻️</span> WasteZero
                </div>
                <div className="nav-links">
                    <span className="nav-item active">Dashboard</span>
                    <Link to="/events" className="nav-item" style={{ textDecoration: 'none' }}>Events</Link>
                    <Link to="/applications" className="nav-item" style={{ textDecoration: 'none' }}>My Applications</Link>
                    <Link to="/network" className="nav-item" style={{ textDecoration: 'none' }}>Network</Link>
                    <Link to="/messages" className="nav-item" style={{ textDecoration: 'none' }}>Messages</Link>
                    <Link to="/profile" className="nav-item" style={{ textDecoration: 'none' }}>Profile</Link>
                    <Link to="/contact" className="nav-item" style={{ textDecoration: 'none' }}>Contact</Link>
                    <VolunteerNotificationBell />
                </div>
                <div className="nav-profile">
                    <a href='/'>Logout</a>
                    <div style={{ width: 35, height: 35, borderRadius: '50%', background: '#ccc' }}></div>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="welcome-section">
                    <div className="welcome-text">
                        <h1>Welcome, Volunteer 👋</h1>
                        <p>Track your activities and make a positive impact today 🌍</p>
                    </div>
                    <div className="welcome-illustration">
                        🌱
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📋</div>
                        <div className="stat-info">
                            <h3>{stats.total}</h3>
                            <p>Total Applications</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📅</div>
                        <div className="stat-info">
                            <h3>{stats.approved}</h3>
                            <p>Approved Events</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h3>{stats.completed}</h3>
                            <p>Completed Events</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🍃</div>
                        <div className="stat-info">
                            <h3>{stats.impact}</h3>
                            <p>Impact Score</p>
                        </div>
                    </div>
                </div>

                <div className="content-split">
                    <div className="left-column">
                        <h3 className="section-title">Upcoming Events</h3>
                        <div className="events-list">
                            {upcomingEvents.length === 0 ? (
                                <p style={{ color: '#888', fontStyle: 'italic' }}>No upcoming events available.</p>
                            ) : (
                                upcomingEvents.map(event => (
                                    <div key={event._id} className="event-card">
                                        <div className="event-details">
                                            <h4>{event.title}</h4>
                                            <div className="event-meta">
                                                <span>📍 {event.location}</span>
                                                <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="event-actions">
                                            <button
                                                onClick={() => handleApply(event._id)}
                                                className="btn-primary"
                                                style={{ marginLeft: '1rem' }}
                                            >
                                                Apply Now
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <h3 className="section-title" style={{ marginTop: '2rem' }}>My Applications</h3>
                        <div className="applications-table-container">
                            <table className="app-table">
                                <thead>
                                    <tr>
                                        <th>Event Name</th>
                                        <th>NGO</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>No applications yet</td>
                                        </tr>
                                    ) : (
                                        applications.map((app, index) => (
                                            <tr key={index}>
                                                <td>{app.eventTitle}</td>
                                                <td>{app.ngoName}</td>
                                                <td>
                                                    <span className={`badge ${app.status === 'accepted' ? 'approved' : app.status === 'rejected' ? 'rejected' : 'pending'}`}>
                                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td>{new Date(app.eventDate).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="right-column">
                        <h3 className="section-title">Analytics / Impact</h3>
                        <div className="analytics-panel">
                            <div className="message-item">
                                <div className="message-sender">Green Earth NGO</div>
                                <div className="message-preview">Your application for the Beach Clean-Up drive approved. See you there!</div>
                            </div>
                            <div className="message-item">
                                <div className="message-sender">Admin</div>
                                <div className="message-preview">Reminder: Don't forget the City Park Cleanup this Sunday!</div>
                            </div>
                            <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>View Messages {'>'}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default VolunteerDashboard;
