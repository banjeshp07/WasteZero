import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import socketService from '../../services/socketService';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Messaging.css';

const MessagingPage = () => {
    const [currentUserId, setCurrentUserId] = useState('');
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState({});
    const [coPartners, setCoPartners] = useState([]);    // list from API
    const [coPartnersLoading, setCoPartnersLoading] = useState(true);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // ── Auth + socket setup ──────────────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(decoded.id);
                socketService.connect(token);
                fetchInbox(token);
                fetchCoPartners(token);

                // Online presence tracking
                socketService.onOnlineUsers((userIds) => {
                    setOnlineUsers(new Set(userIds.map(String)));
                });
                socketService.onUserOnline((uid) => {
                    setOnlineUsers(prev => new Set([...prev, String(uid)]));
                });
                socketService.onUserOffline((uid) => {
                    setOnlineUsers(prev => {
                        const next = new Set(prev);
                        next.delete(String(uid));
                        return next;
                    });
                });
            } catch (e) {
                console.error('Token decode error', e);
            }
        }
        return () => socketService.offOnlineStatus();
    }, []);

    // ── Socket: incoming messages ────────────────────────────────────────────
    useEffect(() => {
        if (!currentUserId) return;

        socketService.offReceiveMessage();
        socketService.onReceiveMessage((msg) => {
            const incomingSenderId = msg.from?._id || msg.from;
            if (String(incomingSenderId) === String(currentUserId)) return;

            setMessages(prev => {
                const chatId = msg.chatId;
                const history = prev[chatId] || [];
                const isDuplicate = history.some(
                    m => m.text === msg.text &&
                        new Date(m.timestamp).getTime() === new Date(msg.time).getTime()
                );
                if (isDuplicate) return prev;
                return {
                    ...prev,
                    [chatId]: [...history, {
                        senderId: incomingSenderId,
                        text: msg.text,
                        timestamp: msg.time || new Date()
                    }]
                };
            });
        });
        return () => socketService.offReceiveMessage();
    }, [currentUserId]);

    // Track mobile view for responsive layout
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1024);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // ── API: fetch inbox (existing chats) ───────────────────────────────────
    const fetchInbox = async (token) => {
        try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            const myId = decoded.id;
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const formattedChats = res.data.map(chat => {
                const otherUser = chat.participants.find(p => String(p._id) !== String(myId));
                return {
                    id: chat._id,
                    name: otherUser?.username || 'Unknown',
                    receiverId: otherUser?._id,
                    lastMessage: chat.lastMessage || 'No messages yet',
                    role: otherUser?.role
                };
            });
            setChats(formattedChats);
        } catch (err) { console.error('Inbox load error:', err); }
    };

    // ── API: fetch co-partners (restricted contacts) ─────────────────────────
    const fetchCoPartners = async (token) => {
        setCoPartnersLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/opportunities/co-partners`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoPartners(res.data);
        } catch (err) {
            console.error('Co-partners load error:', err);
        } finally {
            setCoPartnersLoading(false);
        }
    };

    // ── Select an existing chat ──────────────────────────────────────────────
    const handleSelectChat = async (chat) => {
        setActiveChat(chat);
        socketService.joinRoom(chat.id);
        if (isMobile) {
            setIsChatOpen(true);
        }
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/${chat.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const history = res.data.map(m => ({
                senderId: m.from._id || m.from,
                text: m.text,
                timestamp: m.time
            }));
            setMessages(prev => ({ ...prev, [chat.id]: history }));
        } catch (err) { console.error('History fetch error:', err); }
    };

    // ── Send a message ───────────────────────────────────────────────────────
    const handleSendMessage = async (text) => {
        if (!activeChat || !text.trim()) return;
        const token = localStorage.getItem('token');
        const messageData = {
            chatId: activeChat.id,
            participantId: activeChat.receiverId,
            text
        };
        try {
            socketService.sendMessage({ ...messageData, from: currentUserId, to: activeChat.receiverId });
            await axios.post(`${import.meta.env.VITE_API_URL}/api/chat/send`, messageData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(prev => ({
                ...prev,
                [activeChat.id]: [...(prev[activeChat.id] || []),
                { senderId: currentUserId, text, timestamp: new Date() }]
            }));
        } catch (err) { console.error('Send failed:', err); }
    };

    // ── Start a chat with a co-partner ──────────────────────────────────────
    const startChatWithPartner = async (partner) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/chat`,
                { participantId: partner._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchInbox(token);
            handleSelectChat({
                id: res.data._id,
                name: partner.username,
                receiverId: partner._id
            });

            // Auto-open chat on mobile
            if (isMobile) {
                setIsChatOpen(true);
            }
        } catch (err) { console.error('Start chat error:', err); }
    };

    // ── Role badge colour ────────────────────────────────────────────────────
    const roleColor = (role) => role === 'ngo' ? '#7c3aed' : '#0ea5e9';

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="messaging-page-wrapper">
            {/* Navbar */}
            <div className="messaging-nav">
                <div className="nav-left">
                    <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
                    <h2 className="page-title">Messaging</h2>
                </div>
                <div className="nav-info">
                    {isMobile && (
                        <button
                            className="mobile-chat-toggle"
                            onClick={() => setIsChatOpen(prev => !prev)}
                        >
                            {isChatOpen ? 'Show Chats' : 'Show Chat'}
                        </button>
                    )}
                    <span className="nav-badge">🔒 Event co-partners only</span>
                </div>
            </div>

            <div className="messaging-main-layout">

                {/* Left: Inbox sidebar */}
                {(!isMobile || !isChatOpen) && (
                    <ChatList
                        chats={chats}
                        activeChat={activeChat}
                        onSelectChat={handleSelectChat}
                    />
                )}

                {/* Centre: Chat window */}
                {(!isMobile || isChatOpen) && (
                    <ChatWindow
                        chat={activeChat}
                        messages={activeChat ? (messages[activeChat.id] || []) : []}
                        onSendMessage={handleSendMessage}
                        currentUserId={currentUserId}
                        onlineUsers={onlineUsers}
                    />
                )}

                {/* Right: Co-partners panel */}
                {!isMobile && (
                    <div className="co-partners-panel">
                        <div className="co-partners-header">
                            <span>👥</span> Event Co-Partners
                        </div>

                        {coPartnersLoading ? (
                            <div className="co-partners-loading">Loading contacts…</div>
                        ) : coPartners.length === 0 ? (
                            <div className="co-partners-empty">
                                <div className="empty-icon-sm">🤝</div>
                                <p>No co-partners yet.</p>
                                <p className="sub-text">Get accepted into an event to start chatting with your team!</p>
                            </div>
                        ) : (
                            <div className="co-partners-list">
                                {coPartners.map(partner => (
                                    <div
                                        key={String(partner._id)}
                                        className="co-partner-card"
                                        onClick={() => startChatWithPartner(partner)}
                                    >
                                        <div className="partner-avatar">
                                            {partner.username.charAt(0).toUpperCase()}
                                            <span
                                                className="online-dot"
                                                style={{
                                                    backgroundColor: onlineUsers.has(String(partner._id))
                                                        ? '#4caf50' : '#bbb'
                                                }}
                                            />
                                        </div>
                                        <div className="partner-info">
                                            <div className="partner-name">{partner.username}</div>
                                            <div
                                                className="partner-role"
                                                style={{ color: roleColor(partner.role) }}
                                            >
                                                {partner.role?.toUpperCase()}
                                            </div>
                                            <div className="partner-events">
                                                {partner.events.map((ev, i) => (
                                                    <span key={i} className="event-tag">{ev}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <button className="chat-btn">💬</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default MessagingPage;