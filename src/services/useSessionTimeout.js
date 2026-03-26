import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const SESSION_TIMEOUT = 60 * 60 * 1000; // 30 minutes in milliseconds

const useSessionTimeout = (isSignedIn, signOut) => {
  const navigate = useNavigate();

  const startSessionTimer = useCallback(() => {
    clearTimeout(window.sessionTimeout);
    window.sessionTimeout = setTimeout(() => {
      signOut();
      navigate('/'); 
    }, SESSION_TIMEOUT);
  }, [signOut, navigate]);

  const resetSessionTimer = useCallback(() => {
    if (isSignedIn) {
      startSessionTimer();
    }
  }, [isSignedIn, startSessionTimer]);

  useEffect(() => {
    if (isSignedIn) {
      startSessionTimer();
    }

    const handleUserActivity = () => {
      resetSessionTimer();
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);

    return () => {
      clearTimeout(window.sessionTimeout);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
    };
  }, [isSignedIn, resetSessionTimer, startSessionTimer]);

  return resetSessionTimer;
};

export default useSessionTimeout;
