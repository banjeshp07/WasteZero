import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import MatchResultsModal from '../dashboard/MatchResultsModal';
import { useToast } from '../ui/ToastContext';
import './EventsPage.css';

const EventsPage = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');
    const [userId, setUserId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [skillFilter, setSkillFilter] = useState('');

    // Match modal state
    const [matchModalOpen, setMatchModalOpen] = useState(false);
    const [currentMatches, setCurrentMatches] = useState([]);
    const [currentOpportunityTitle, setCurrentOpportunityTitle] = useState('');

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

        fetchEvents();
    }, []);

    useEffect(() => {
        // Apply filters
        let filtered = events;

        if (searchTerm) {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (locationFilter) {
            filtered = filtered.filter(event =>
                event.location.toLowerCase().includes(locationFilter.toLowerCase())
            );
        }

        if (skillFilter) {
            filtered = filtered.filter(event =>
                event.skills && event.skills.some(skill =>
                    skill.toLowerCase().includes(skillFilter.toLowerCase())
                )
            );
        }

        setFilteredEvents(filtered);
    }, [searchTerm, locationFilter, skillFilter, events]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await apiService.getOpportunities();
            setEvents(response.data);
            setFilteredEvents(response.data);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (eventId) => {
        try {
            await apiService.applyForOpportunity(eventId);
            toast.success("Application submitted successfully!");
        } catch (error) {
            console.error("Error applying:", error);
            toast.error("Failed to apply. You may have already applied for this event.");
        }
    };

    const handleDelete = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await apiService.deleteOpportunity(eventId);
                fetchEvents(); // Refresh list
                toast.success("Event deleted successfully!");
            } catch (error) {
                console.error("Error deleting event:", error);
                toast.error("Failed to delete event");
            }
        }
    };

    const handleFindMatches = async (opportunityId, opportunityTitle) => {
        try {
            console.log("Finding matches for opportunity:", opportunityId);
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
            toast.error("Failed to find matches. Please try again.");
        }
    };

    const handleSendInvitations = (selectedVolunteers) => {
        console.log("Sending invitations to:", selectedVolunteers);
        toast.success(`Invitations sent to ${selectedVolunteers.length} volunteer(s)!`);
        setMatchModalOpen(false);
    };

    return (
        <div className="events-page">
            {/* Header */}
            <div className="events-header">
                <div className="header-content">
                    <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
                    <h1>Events & Opportunities</h1>
                    {userRole === 'ngo' && (
                        <Link to="/events/create">
                            <button className="btn-create">+ Create Event</button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="filters-container">
                <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="filter-input"
                />
                <input
                    type="text"
                    placeholder="Filter by location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="filter-input"
                />
                <input
                    type="text"
                    placeholder="Filter by skill..."
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    className="filter-input"
                />
                <button
                    onClick={() => {
                        setSearchTerm('');
                        setLocationFilter('');
                        setSkillFilter('');
                    }}
                    className="btn-clear"
                >
                    Clear Filters
                </button>
            </div>

            {/* Events Grid */}
            <div className="events-container">
                {loading ? (
                    <div className="loading">Loading events...</div>
                ) : filteredEvents.length === 0 ? (
                    <div className="no-events">
                        {events.length === 0 ? 'No events available yet.' : 'No events match your filters.'}
                    </div>
                ) : (
                    <div className="events-grid">
                        {filteredEvents.map(event => (
                            <div key={event._id} className="event-card">
                                <div className="event-header">
                                    <h3>{event.title}</h3>
                                    {event.skills && event.skills.length > 0 && (
                                        <div className="event-skills">
                                            {event.skills.map((skill, idx) => (
                                                <span key={idx} className="skill-tag">{skill}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="event-description">{event.description}</p>
                                <div className="event-meta">
                                    <div className="meta-item">
                                        <span className="icon">📅</span>
                                        <span>{new Date(event.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="icon">📍</span>
                                        <span>{event.location}</span>
                                    </div>
                                    {event.createdBy && (
                                        <div className="meta-item">
                                            <span className="icon">🏢</span>
                                            <span>{event.createdBy.username || 'NGO'}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="event-actions">
                                    {userRole === 'volunteer' && (
                                        <button
                                            onClick={() => handleApply(event._id)}
                                            className="btn-apply"
                                        >
                                            Apply Now
                                        </button>
                                    )}
                                    {userRole === 'NGO' && event.createdBy && event.createdBy._id === userId && (
                                        <>
                                            <button
                                                onClick={() => handleFindMatches(event._id, event.title)}
                                                className="btn-match"
                                            >
                                                Find Matches
                                            </button>
                                            <button
                                                onClick={() => navigate(`/events/edit/${event._id}`)}
                                                className="btn-edit"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event._id)}
                                                className="btn-delete"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Match Results Modal */}
            {matchModalOpen && (
                <MatchResultsModal
                    isOpen={matchModalOpen}
                    onClose={() => setMatchModalOpen(false)}
                    matches={currentMatches}
                    opportunityTitle={currentOpportunityTitle}
                    onSendInvitations={handleSendInvitations}
                />
            )}
        </div>
    );
};

export default EventsPage;
