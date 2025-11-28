// contexts/PollContext.tsx - FIXED VERSION
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../utils/api';

export type PollStatus = 'not_started' | 'active' | 'paused' | 'finished';

interface PollContextType {
  pollStatus: PollStatus;
  setPollStatus: (status: PollStatus) => void;
  isLoginEnabled: boolean;
  updatePollStatus: (status: PollStatus) => Promise<void>;
  loading: boolean;
  refreshPollStatus: () => Promise<void>;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

export const usePoll = () => {
  const context = useContext(PollContext);
  if (context === undefined) {
    throw new Error('usePoll must be used within a PollProvider');
  }
  return context;
};

interface PollProviderProps {
  children: ReactNode;
}

export const PollProvider: React.FC<PollProviderProps> = ({ children }) => {
  const [pollStatus, setPollStatus] = useState<PollStatus>('not_started');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Convert backend status to frontend status
  const getPollStatusFromBackend = (backendData: any): PollStatus => {
    if (!backendData.is_active && !backendData.is_paused) return 'not_started';
    if (backendData.is_active && !backendData.is_paused) return 'active';
    if (backendData.is_paused) return 'paused';
    if (!backendData.is_active && backendData.end_time) return 'finished';
    return 'not_started';
  };

  // Fetch poll status from backend with caching
  const fetchPollStatus = async (force = false) => {
    const now = Date.now();
    // Only fetch if forced or if more than 30 seconds have passed
    if (!force && now - lastUpdated < 30000) {
      console.log('Using cached poll status');
      return;
    }

    try {
      // Only set loading for initial load or forced refresh
      if (isInitialLoad || force) {
        setLoading(true);
      }
      
      const response = await api.get('/poll/status', { skipAuth: true });
      const status = getPollStatusFromBackend(response);
      setPollStatus(status);
      setLastUpdated(now);
      console.log('Poll status fetched:', status);
    } catch (error) {
      console.error('Failed to fetch poll status:', error);
      // Fallback to localStorage if API fails
      const savedPollStatus = localStorage.getItem('pollStatus') as PollStatus;
      if (savedPollStatus && ['not_started', 'active', 'paused', 'finished'].includes(savedPollStatus)) {
        setPollStatus(savedPollStatus);
      }
    } finally {
      if (isInitialLoad || force) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  };

  // Load poll status on initial load
  useEffect(() => {
    fetchPollStatus(true); // Force fetch on initial load
    
    // Poll for status updates every 60 seconds
    const interval = setInterval(() => {
      fetchPollStatus(false); // Don't force, use cache
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const isLoginEnabled = pollStatus === 'active';

  const updatePollStatus = async (status: PollStatus) => {
    try {
      setLoading(true);
      
      // Map frontend status to backend format
      let isActive = false;
      let isPaused = false;
      
      switch (status) {
        case 'active':
          isActive = true;
          isPaused = false;
          break;
        case 'paused':
          isActive = true;
          isPaused = true;
          break;
        case 'finished':
          isActive = false;
          isPaused = false;
          break;
        case 'not_started':
          isActive = false;
          isPaused = false;
          break;
      }

      // Call backend API to update poll status
      await api.put('/poll/status', {
        isActive,
        isPaused,
        startTime: status === 'active' ? new Date().toISOString() : null,
        endTime: status === 'finished' ? new Date().toISOString() : null
      });

      // Update local state immediately
      setPollStatus(status);
      setLastUpdated(Date.now());
      localStorage.setItem('pollStatus', status);
      
      console.log(`Poll status updated to: ${status}`);
    } catch (error) {
      console.error('Failed to update poll status:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshPollStatus = async () => {
    await fetchPollStatus(true); // Force refresh
  };

  return (
    <PollContext.Provider value={{ 
      pollStatus, 
      setPollStatus, 
      isLoginEnabled,
      updatePollStatus,
      loading,
      refreshPollStatus
    }}>
      {children}
    </PollContext.Provider>
  );
};