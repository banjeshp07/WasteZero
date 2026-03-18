import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import apiService from '../../services/apiService';
import { Link, useNavigate } from 'react-router-dom';
import NGONotificationBell from '../notifications/NGONotificationBell';
import MatchResultsModal from './MatchResultsModal';
import { useToast } from '../ui/ToastContext';

const NGODashboard = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [events, setEvents] = useState([]);
    const [pendingApplications, setPendingApplications] = useState([]);
    const [matchModalOpen, setMatchModalOpen] = useState(false);
    const [currentMatches, setCurrentMatches] = useState([]);
    const [currentOpportunityTitle, setCurrentOpportunityTitle] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiService.getOpportunities();
                setEvents(response.data);

                // Extract all pending applications from events
                const allApplications = [];
                response.data.forEach(event => {
                    if (event.applications) {
                        event.applications.forEach(app => {
                            if (app.status === 'pending') {
                                allApplications.push({
                                    ...app,
                                    eventTitle: event.title,
                                    eventId: event._id
                                });
                            }
                        });
                    }
                });
                setPendingApplications(allApplications);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await apiService.deleteOpportunity(id);
                // Refresh list
                const response = await apiService.getOpportunities();
                setEvents(response.data);
            } catch (error) {
                console.error("Error deleting event:", error);
                toast.error("Failed to delete event");
            }
        }
    };

    const handleApplicationStatus = async (eventId, volunteerId, status) => {
        try {
            await apiService.updateApplicationStatus(eventId, {
                volunteerId,
                status
            });

            // Refresh applications list
            const response = await apiService.getOpportunities();
            const allApplications = [];
            response.data.forEach(event => {
                if (event.applications) {
                    event.applications.forEach(app => {
                        if (app.status === 'pending') {
                            allApplications.push({
                                ...app,
                                eventTitle: event.title,
                                eventId: event._id
                            });
                        }
                    });
                }
            });
            setPendingApplications(allApplications);
            toast.success(`Application ${status} successfully`);
        } catch (error) {
            console.error(`Error updating application status:`, error);
            toast.error("Failed to update status");
        }
    };

    const handleFindMatches = async (opportunityId, opportunityTitle) => {
        try {
            console.log("Finding matches for opportunity:", opportunityId);
            console.log("Opportunity title:", opportunityTitle);

            const response = await apiService.findMatches(opportunityId);
            console.log("Match response:", response);

            // Transform backend data to match modal structure
            const transformedMatches = (response.data.matches || []).map(match => ({
                volunteerId: match.volunteer._id,
                name: match.volunteer.username,
                email: match.volunteer.email,
                location: match.volunteer.location,
                skills: match.volunteer.skills,
                matchScore: match.score,
                breakdown: match.breakdown
            }));

            console.log("Transformed matches:", transformedMatches);
            setCurrentMatches(transformedMatches);
            setCurrentOpportunityTitle(opportunityTitle);
            setMatchModalOpen(true);
        } catch (error) {
            console.error("Error finding matches:", error);
            console.error("Error response:", error.response);
            console.error("Error message:", error.message);

            if (error.response) {
                // Server responded with error
                toast.error(`Failed to find matches: ${error.response.data.message || error.response.statusText}`);
            } else if (error.request) {
                // Request made but no response
                toast.error("Failed to find matches: No response from server. Please check if the backend is running.");
            } else {
                // Something else happened
                toast.error(`Failed to find matches: ${error.message}`);
            }
        }
    };

    const handleSendInvitations = (selectedVolunteers) => {
        // Placeholder for future invitation system
        console.log("Sending invitations to:", selectedVolunteers);
        toast.success(`Invitations sent to ${selectedVolunteers.length} volunteer(s)!`);
        setMatchModalOpen(false);
    };

    return (
        <div className="dashboard-container">
            {/* Navbar */}
            <nav className="dashboard-nav">
                <div className="nav-brand">
                    <span role="img" aria-label="logo">♻️</span> WasteZero
                </div>
                <div className="nav-links">
                    <span className="nav-item active">Dashboard</span>
                    <Link to="/events" className="nav-item" style={{ textDecoration: 'none' }}>Manage Events</Link>
                    <Link to="/applications" className="nav-item" style={{ textDecoration: 'none' }}>Applications</Link>
                    <Link to="/network" className="nav-item" style={{ textDecoration: 'none' }}>Volunteers</Link>
                    <Link to="/network" className="nav-item" style={{ textDecoration: 'none' }}>Network</Link>
                    <Link to="/messages" className="nav-item" style={{ textDecoration: 'none' }}>Messages</Link>
                    <Link to="/profile" className="nav-item" style={{ textDecoration: 'none' }}>Profile</Link>
                    <Link to="/contact" className="nav-item" style={{ textDecoration: 'none' }}>Contact</Link>
                    <NGONotificationBell />
                </div>
                <div className="nav-profile">
                    <a href='/'>Logout</a>
                    <div style={{ width: 35, height: 35, borderRadius: '50%', background: '#ccc' }}></div>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="welcome-section" style={{ background: 'linear-gradient(135deg, #FFF9C4 0%, #FFF176 100%)' }}>
                    <div className="welcome-text">
                        <h1 style={{ color: '#F57F17' }}>Welcome, Partner NGO 🤝</h1>
                        <p style={{ color: '#F9A825' }}>Manage your events and build your community.</p>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ color: '#FBC02D', background: '#FFFDE7' }}>📢</div>
                        <div className="stat-info">
                            <h3>{events.length}</h3>
                            <p>Active Events</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ color: '#FBC02D', background: '#FFFDE7' }}>👥</div>
                        <div className="stat-info">
                            <h3>{pendingApplications.length}</h3>
                            <p>Pending Applications</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ color: '#FBC02D', background: '#FFFDE7' }}>⭐</div>
                        <div className="stat-info">
                            <h3>4.9</h3>
                            <p>Rating</p>
                        </div>
                    </div>
                </div>

                <div className="content-split">
                    <div className="left-column">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 className="section-title" style={{ marginBottom: 0 }}>Manage Events</h3>
                            <Link to="/events/create">
                                <button className="btn-primary" style={{ background: '#FBC02D' }}>+ Create Event</button>
                            </Link>
                        </div>

                        <div className="events-list">
                            {events.length === 0 ? (
                                <p style={{ color: '#888', fontStyle: 'italic' }}>No events created yet. Click "Create Event" to get started.</p>
                            ) : (
                                events.map(event => (
                                    <div key={event._id} className="event-card">
                                        <div className="event-details">
                                            <h4>{event.title}</h4>
                                            <div className="event-meta">
                                                <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                                                <span>📍 {event.location}</span>
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>{event.description}</p>
                                        </div>
                                        <div className="event-actions">
                                            <button
                                                onClick={() => handleFindMatches(event._id, event.title)}
                                                className="btn-primary"
                                                style={{ background: '#4CAF50', border: 'none', color: 'white', marginRight: '0.5rem' }}
                                            >
                                                Find Matches
                                            </button>
                                            <button
                                                onClick={() => navigate(`/events/edit/${event._id}`)}
                                                className="btn-primary"
                                                style={{ background: 'transparent', color: '#FBC02D', border: '1px solid #FBC02D', marginRight: '0.5rem' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event._id)}

                                                className="btn-primary"
                                                style={{ background: '#ff5252', border: 'none', color: 'white' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <h3 className="section-title" style={{ marginTop: '2rem' }}>Pending Approvals</h3>
                        <div className="applications-table-container">
                            <table className="app-table">
                                <thead>
                                    <tr>
                                        <th>Volunteer</th>
                                        <th>Event</th>
                                        <th>Contact</th>
                                        <th>Location</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingApplications.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>No pending applications</td>
                                        </tr>
                                    ) : (
                                        pendingApplications.map((app, index) => (
                                            <tr key={index}>
                                                <td>{app.volunteer?.username || 'Unknown'}</td>
                                                <td>{app.eventTitle}</td>
                                                <td>{app.volunteer?.email}</td>
                                                <td>{app.volunteer?.location}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleApplicationStatus(app.eventId, app.volunteer._id, 'accepted')}
                                                        style={{ marginRight: 5, color: 'green', background: 'none', border: 'none', cursor: 'pointer' }}
                                                    >
                                                        ✔ Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleApplicationStatus(app.eventId, app.volunteer._id, 'rejected')}
                                                        style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                                                    >
                                                        ✖ Reject
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="right-column">
                        <h3 className="section-title">Notifications</h3>
                        <div className="analytics-panel">
                            <div className="message-item">
                                <div className="message-sender">System</div>
                                <div className="message-preview">New event "River Clean" created successfully.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Match Results Modal */}
            {matchModalOpen && (
                <MatchResultsModal
                    isOpen={matchModalOpen}
                    matches={currentMatches}
                    opportunityTitle={currentOpportunityTitle}
                    onClose={() => setMatchModalOpen(false)}
                    onSendInvitations={handleSendInvitations}
                />
            )}
        </div>
    );
};

export default NGODashboard;
