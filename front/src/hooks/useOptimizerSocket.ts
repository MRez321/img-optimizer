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
    const socket = io(API_BASE, { withCredentials: true });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // Rejoin the room if we reconnected mid-session
      if (sessionIdRef.current) {
        socket.emit('join-session', sessionIdRef.current);
      }
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('file-processed', onFileProcessed);
    socket.on('file-error', onFileError);
    socket.on('zip-ready', onZipReady);

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const joinSession = useCallback((sessionId: string) => {
    sessionIdRef.current = sessionId;
    socketRef.current?.emit('join-session', sessionId);
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
