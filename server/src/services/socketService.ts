import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import dbPool from '../config/db.js';

let io: SocketIOServer | null = null;

const allowedOrigins = [
    process.env.CORS_ORIGIN,
    'http://localhost:5173',
    'http://localhost:3200',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3200',
    'https://pixelstar.ir',
].filter(Boolean); // remove undefined/null

export const initSocket = (httpServer: HTTPServer): SocketIOServer => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
                if (!origin || allowedOrigins.includes(origin)) {  // reuse the same array if you want
                    callback(null, true);
                } else {
                    console.warn(`Socket.IO CORS blocked origin: ${origin}`);
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        // Client joins a session room once it has a sessionId
        socket.on('join-session', (sessionId: string) => {
            if (!sessionId) return;
            socket.join(sessionId);
            console.log(`Socket ${socket.id} joined session ${sessionId}`);
        });

        // Client can leave a room explicitly (optional)
        socket.on('leave-session', (sessionId: string) => {
            if (!sessionId) return;
            socket.leave(sessionId);
        });

        // Heartbeat: client pings periodically, we update last_active
        socket.on('heartbeat', async (sessionId: string) => {
            if (!sessionId) return;
            try {
                await dbPool.query(
                    'UPDATE sessions SET last_active = NOW() WHERE id = ?',
                    [sessionId]
                );
            } catch (err) {
                console.error('Heartbeat update failed:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = (): SocketIOServer => {
    if (!io) {
        throw new Error('Socket.io not initialized. Call initSocket(httpServer) first.');
    }
    return io;
};

// Helper to emit an event to all clients in a session room
export const emitToSession = (sessionId: string, event: string, payload: unknown) => {
    if (!io) {
        console.warn('Socket.io not initialized, skipping emit:', event);
        return;
    }
    io.to(sessionId).emit(event, payload);
};