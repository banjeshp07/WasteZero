import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import './NetworkPage.css';

const NetworkPage = () => {
    const [users, setUsers] = useState([]);
    const [connections, setConnections] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const { socket } = useNotifications();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(decoded.id);
                fetchData(decoded.id, token);
            } catch (e) {
                console.error("Token decode error", e);
            }
        }
    }, []);

    const fetchData = async (userId, token) => {
        try {
            setLoading(true);
            const [usersRes, connectionsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/users?currentUserId=${userId}`),
                axios.get(`${import.meta.env.VITE_API_URL}/api/connections/status`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setUsers(usersRes.data.filter(u => u._id !== userId));
            setConnections(connectionsRes.data);
        } catch (err) {
            console.error("Error fetching network data", err);
        } finally {
            setLoading(false);
        }
    };

    // logic to count accepted connections
    const totalConnections = connections.filter(c => c.status === 'accepted').length;

    const getConnectionStatus = (userId) => {
        const connection = connections.find(c => {
            const sId = c.senderId?._id || c.senderId;
            const rId = c.receiverId?._id || c.receiverId;
            return (sId === currentUserId && rId === userId) ||
                   (sId === userId && rId === currentUserId);
        });

        if (!connection) return 'connect';
        if (connection.status === 'accepted') return 'connected';
        if (connection.status === 'pending') {
            const sId = connection.senderId?._id || connection.senderId;
            return sId === currentUserId ? 'sent' : 'received';
        }
        return 'connect';
    };

    const handleConnect = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/connections/request`, {
                toId: userId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConnections(prev => [...prev, res.data]);
        } catch (err) {
            console.error("Connection request failed", err);
            alert(err.response?.data?.message || "Failed to send connection request");
        }
    };

    const handleAccept = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const connection = connections.find(c => {
                const sId = c.senderId?._id || c.senderId;
                const rId = c.receiverId?._id || c.receiverId;
                return (sId === userId && rId === currentUserId);
            });

            if (!connection) return;

            await axios.post(`${import.meta.env.VITE_API_URL}/api/connections/accept`, {
                connectionId: connection._id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setConnections(prev => prev.map(c =>
                c._id === connection._id ? { ...c, status: 'accepted' } : c
            ));
        } catch (err) {
            console.error("Accept failed", err);
            alert("Failed to accept request");
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#333', marginRight: 15, fontSize: '1.2rem' }}>
                        ←
                    </Link>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Network 
                        {/* Count Badge added here */}
                        <span style={{ 
                            fontSize: '0.9rem', 
                            background: '#2196f3', 
                            color: 'white', 
                            padding: '2px 12px', 
                            borderRadius: '20px',
                            fontWeight: 'normal'
                        }}>
                            {totalConnections}
                        </span>
                    </h1>
                </div>
                <Link to="/messages" style={{ textDecoration: 'none', color: '#2196f3', fontWeight: 'bold' }}>
                    Go to Messages
                </Link>
            </div>

            {loading ? (
                <div>Loading network...</div>
            ) : (
                <div className="network-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    {users.map(user => {
                        const status = getConnectionStatus(user._id);
                        return (
                            <div key={user._id} className="user-card" style={{
                                background: 'white',
                                padding: '20px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: '#eee',
                                    margin: '0 auto 15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    color: '#666'
                                }}>
                                    {user.username ? user.username.charAt(0) : '?'}
                                </div>
                                <h3 style={{ margin: '0 0 5px', fontSize: '1.1rem' }}>{user.username}</h3>
                                <p style={{ margin: '0 0 15px', color: '#666', fontSize: '0.9rem' }}>{user.role}</p>

                                {status === 'connect' && (
                                    <button
                                        onClick={() => handleConnect(user._id)}
                                        style={{ background: '#2196f3', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
                                    >
                                        Connect
                                    </button>
                                )}
                                {status === 'sent' && (
                                    <button disabled style={{ background: '#e0e0e0', color: '#666', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'default', width: '100%' }}>
                                        Request Sent
                                    </button>
                                )}
                                {status === 'received' && (
                                    <button
                                        onClick={() => handleAccept(user._id)}
                                        style={{ background: '#4caf50', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
                                    >
                                        Accept Request
                                    </button>
                                )}
                                {status === 'connected' && (
                                    <div style={{ color: '#4caf50', fontWeight: 'bold' }}>
                                        ✓ Connected
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            {users.length === 0 && !loading && (
                <div style={{ textAlign: 'center', margin: '40px', color: '#666' }}>
                    No other users found in the network yet.
                </div>
            )}
        </div>
    );
};

export default NetworkPage;
