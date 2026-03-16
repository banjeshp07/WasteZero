import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminNotificationBell from '../notifications/AdminNotificationBell';
import ReportsPage from '../reports/ReportsPage';
import './AdminDashboard.css';
import apiService from '../../services/apiService';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [blockReason, setBlockReason] = useState('');

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token === 'mock-admin-token') throw new Error('Mock');

            const usersRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`);
            const logsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/logs`);
            const eventsRes = await apiService.getOpportunities();

            if (usersRes.ok) setUsers(await usersRes.json());
            if (logsRes.ok) setLogs(await logsRes.json());
            if (eventsRes.data) setEvents(eventsRes.data);

        } catch (err) {
            console.error("Error fetching admin data", err);
            // Mock data fallback if needed...
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
            try {
                await apiService.deleteOpportunity(eventId);
                setEvents(prev => prev.filter(e => e._id !== eventId));
                alert("Event deleted successfully.");
            } catch (error) {
                console.error("Error deleting event:", error);
                alert("Failed to delete event.");
            }
        }
    };

    // Open block modal
    const openBlockModal = (user) => {
        setSelectedUser(user);
        setBlockReason('');
        setShowModal(true);
    };

    const confirmToggleBlock = async () => {
        if (!selectedUser) return;
        const newStatus = selectedUser.status === 'Blocked' ? 'Active' : 'Blocked';

        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${selectedUser._id}/block`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, reason: blockReason })
            });
            fetchData();
            setShowModal(false);
        } catch (err) {
            alert('Failed to update user');
        }
    };

    const ngoCount = users.filter(u => u.role === 'NGO').length;

    return (
        <div className="dashboard-container">
            {/* NAVBAR */}
            <nav className="dashboard-nav">
                <div className="nav-brand">♻️ WasteZero <span className="admin-badge">ADMIN</span></div>
                <div className="nav-links">
                    {['dashboard', 'users', 'ngos', 'reports'].map(tab => (
                        <span key={tab} className={`nav-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </span>
                    ))}
                    <Link to="/messages" className="nav-item">Messages</Link>
                    <Link to="/profile" className="nav-item">Profile</Link>
                    <Link to="/contact" className="nav-item">Contact</Link>
                    <AdminNotificationBell />
                </div>
                <div className="nav-profile">
                    <a href="/" onClick={() => localStorage.clear()}>Logout</a>
                    <div style={{ width: 35, height: 35, borderRadius: '50%', background: '#333' }}></div>
                </div>
            </nav>

            <div className="dashboard-content">
                {activeTab === 'dashboard' && (
                    <>
                        {/* Header Card */}
                        <div className="admin-header-card">
                            <h2>Admin Control Panel <span className="admin-shield-icon">🛡️</span></h2>
                            <p>Oversee platform activity and manage users.</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="admin-stats-grid">
                            <div className="admin-stat-card">
                                <div className="stat-icon-wrapper stat-users">👥</div>
                                <div className="stat-details">
                                    <h3>{users.length}</h3>
                                    <p>Total Users</p>
                                </div>
                            </div>
                            <div className="admin-stat-card">
                                <div className="stat-icon-wrapper stat-ngos">🏢</div>
                                <div className="stat-details">
                                    <h3>{ngoCount}</h3>
                                    <p>Registered NGOs</p>
                                </div>
                            </div>
                            <div className="admin-stat-card">
                                <div className="stat-icon-wrapper stat-logs">🚩</div>
                                <div className="stat-details">
                                    <h3>{logs.length}</h3>
                                    <p>System Logs</p>
                                </div>
                            </div>
                        </div>

                        {/* Split Layout: User Mgmt & Logs */}
                        <div className="admin-split-layout">
                            {/* User Management Preview */}
                            <div className="admin-section">
                                <div className="section-header">User Management (Preview)</div>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.slice(0, 4).map(user => (
                                            <tr key={user._id}>
                                                <td className="user-cell">
                                                    <strong>{user.username}</strong>
                                                    <span>{user.email}</span>
                                                </td>
                                                <td><span className="role-badge">{user.role}</span></td>
                                                <td>
                                                    <span className={`status-badge ${user.status === 'Active' ? 'status-active' : 'status-blocked'}`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className={`action-btn ${user.status === 'Blocked' ? 'btn-unblock' : 'btn-block'}`}
                                                        onClick={() => openBlockModal(user)}
                                                    >
                                                        {user.status === 'Blocked' ? 'Unblock' : 'Block'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* System Activity Logs */}
                            <div className="admin-section">
                                <div className="section-header">System Activity Logs</div>
                                <div className="logs-container">
                                    {logs.slice(0, 5).map(log => (
                                        <div key={log._id} className="log-item">
                                            <div className="log-header">
                                                <span className="log-title">{log.action}</span>
                                                <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                            <div className="log-details">{log.details}</div>
                                            <div className="log-time" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                                                {new Date(log.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Event Management Section */}
                        <div className="event-management-section">
                            <div className="section-header">Event Management</div>
                            <table className="admin-table events-table-admin">
                                <thead>
                                    <tr>
                                        <th>Event Name</th>
                                        <th>NGO Name</th>
                                        <th>Event Date</th>
                                        <th>Description</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.length === 0 ? (
                                        <tr><td colSpan="5">No events found.</td></tr>
                                    ) : (
                                        events.map(event => (
                                            <tr key={event._id}>
                                                <td><strong>{event.title}</strong></td>
                                                <td>{event.createdBy?.username || 'Unknown'}</td>
                                                <td>{new Date(event.date).toLocaleDateString()}</td>
                                                <td className="event-desc-cell">{event.description}</td>
                                                <td>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDeleteEvent(event._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {(activeTab === 'users' || activeTab === 'ngos') && (
                    <div className="admin-section">
                        <div className="section-header">{activeTab === 'users' ? 'Volunteer Management' : 'NGO Management'}</div>
                        {/* Reusing table structure for full list */}
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users
                                    .filter(u => activeTab === 'users' ? u.role === 'volunteer' : u.role === 'NGO')
                                    .map(user => (
                                        <tr key={user._id}>
                                            <td className="user-cell"><strong>{user.username}</strong></td>
                                            <td>{user.email}</td>
                                            <td><span className="role-badge">{user.role}</span></td>
                                            <td>
                                                <span className={`status-badge ${user.status === 'Active' ? 'status-active' : 'status-blocked'}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className={`action-btn ${user.status === 'Blocked' ? 'btn-unblock' : 'btn-block'}`}
                                                    onClick={() => openBlockModal(user)}
                                                >
                                                    {user.status === 'Blocked' ? 'Unblock' : 'Block'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'reports' && <ReportsPage />}
            </div>

            {/* Block/Unblock Modal */}
            {showModal && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className={`modal-icon ${selectedUser.status === 'Blocked' ? 'success' : 'danger'}`}>
                            {selectedUser.status === 'Blocked' ? '✔' : '✖'}
                        </div>
                        <h3>{selectedUser.status === 'Blocked' ? 'Unblock User' : 'Block User'}</h3>
                        <p>Are you sure you want to {selectedUser.status === 'Blocked' ? 'unblock' : 'block'} <strong>{selectedUser.username}</strong>?</p>
                        {selectedUser.status !== 'Blocked' && (
                            <textarea placeholder="Reason (optional)" value={blockReason} onChange={e => setBlockReason(e.target.value)} />
                        )}
                        <div className="modal-actions">
                            <button className="btn cancel" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className={`btn ${selectedUser.status === 'Blocked' ? 'success' : 'danger'}`} onClick={confirmToggleBlock}>
                                {selectedUser.status === 'Blocked' ? 'Unblock' : 'Block'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
