import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // Make sure this matches backend URL

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect(token) {
        if (this.socket) return;

        this.socket = io(SOCKET_URL, {
            auth: {
                token: token
            }
        });

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        this.socket.on('connect_error', (err) => {
            console.error('WebSocket connection error:', err);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }


    joinRoom(chatId) {
        if (this.socket) {
            this.socket.emit('join_chat', chatId);
            console.log(`Joining chat room: ${chatId}`);
        }
    }

    joinNotificationRoom(userId) {
        if (this.socket) {
            this.socket.emit('join', userId);
        }
    }

    leaveRoom(room) {
        if (this.socket) {
            this.socket.emit('leave_room', room);
        }
    }

    sendMessage(messageData) {
        if (this.socket) {
            this.socket.emit('send_message', messageData);
        }
    }

    onReceiveMessage(callback) {
        if (this.socket) {
            this.socket.on('receive_message', callback);
        }
    }

    onNotification(callback) {
        if (this.socket) {
            this.socket.on('notification', callback);
        }
    }

    offReceiveMessage() {
        if (this.socket) {
            this.socket.off('receive_message');
        }
    }

    onOnlineUsers(callback) {
        if (this.socket) {
            this.socket.on('online_users', callback);
        }
    }

    onUserOnline(callback) {
        if (this.socket) {
            this.socket.on('user_online', callback);
        }
    }

    onUserOffline(callback) {
        if (this.socket) {
            this.socket.on('user_offline', callback);
        }
    }

    offOnlineStatus() {
        if (this.socket) {
            this.socket.off('online_users');
            this.socket.off('user_online');
            this.socket.off('user_offline');
        }
    }
}

export default new SocketService();
