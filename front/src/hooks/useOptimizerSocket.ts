import { useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { API_BASE } from '../lib/api';
import type { FileProgressEvent, FileErrorEvent, ZipReadyEvent } from '../types';

interface UseOptimizerSocketOptions {
  onFileProcessed: (e: FileProgressEvent) => void;
  onFileError: (e: FileErrorEvent) => void;
  onZipReady: (e: ZipReadyEvent) => void;
}

export const useOptimizerSocket = ({ onFileProcessed, onFileError, onZipReady }: UseOptimizerSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    const socketUrl = import.meta.env.DEV ? API_BASE : undefined;

    const socket = io(socketUrl, {
      withCredentials: true,
      path: '/socket.io',
      reconnection: true
    });

    socketRef.current = socket;

    const handleConnect = () => {
      setConnected(true);
      if (sessionIdRef.current) {
        socket.emit('join-session', sessionIdRef.current);
      }
    };
    const handleDisconnect = () => setConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('file-processed', onFileProcessed);
    socket.on('file-error', onFileError);
    socket.on('zip-ready', onZipReady);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('file-processed', onFileProcessed);
      socket.off('file-error', onFileError);
      socket.off('zip-ready', onZipReady);
      socket.disconnect();
    };
  }, []);

  // Joins the session room, but waits for the socket to actually be
  // connected first. This fixes a race where the very first
  // join-session emit (right after the page loads) can fire before
  // the initial handshake completes - the join never lands in time,
  // so the server emits file-processed to a room nobody joined yet.
  const joinSession = useCallback((sessionId: string): Promise<void> => {
    sessionIdRef.current = sessionId;
    const socket = socketRef.current;

    return new Promise((resolve) => {
      if (!socket) {
        resolve();
        return;
      }

      if (socket.connected) {
        socket.emit('join-session', sessionId);
        resolve();
        return;
      }

      // Not connected yet - wait for the connect event, then join.
      const handleConnect = () => {
        socket.emit('join-session', sessionId);
        resolve();
      };
      socket.once('connect', handleConnect);
    });
  }, []);

  const leaveSession = useCallback((sessionId: string) => {
    socketRef.current?.emit('leave-session', sessionId);
    if (sessionIdRef.current === sessionId) sessionIdRef.current = null;
  }, []);

  const sendHeartbeat = useCallback((sessionId: string) => {
    socketRef.current?.emit('heartbeat', sessionId);
  }, []);

  return { connected, joinSession, leaveSession, sendHeartbeat };
};
