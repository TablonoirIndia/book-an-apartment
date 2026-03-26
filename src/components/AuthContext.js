// import React, { createContext, useState, useEffect, useCallback } from 'react';
// import { useNavigate } from "react-router-dom";
// import authService from './services/authService';
// import useSessionTimeout from './services/useSessionTimeout';

// const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {

//     const navigate = useNavigate();

//     const [isSignedIn, setIsSignedIn] = useState(false);
//     const [user, setUser] = useState(null);
   

//     const signIn = async (phoneNumber) => {        
//         try {
//             const response = await authService.login(phoneNumber);   
//             const userId = response.data.user.id;
//             const user = await authService.getUser(userId);
//             setIsSignedIn(true);

//             localStorage.setItem('token', response.data.token);
//             localStorage.setItem('user', JSON.stringify(user));
//             localStorage.setItem('loginTimestamp', Date.now());

//             setUser(user);
//             return user, response;           
//         } catch (error) {
//             setIsSignedIn(false);
//             setUser(null);
//             throw error;
//         }
//     };

//     const signOut = async () => {
//         try {
//             const response = await authService.logout();            
//             if (response) {
//                 setIsSignedIn(false);
//                 setUser(null);
//                 localStorage.removeItem('token');
//                 localStorage.removeItem('user');
//                 clearTimeout(window.sessionTimeout);
//                 navigate('/');
//             } else {
//                 console.error('Sign out failed:', response);
//             }
//         } catch (error) {
//             console.error('Sign out error:', error);
//         }
//     };

//     const startSessionTimer = useCallback(() => {
//         clearTimeout(window.sessionTimeout);
//         window.sessionTimeout = setTimeout(() => {
//             signOut();
//             navigate('/'); 
//         }, SESSION_TIMEOUT);
//     }, [signOut, navigate]);
  
//     useSessionTimeout(isSignedIn, signOut); // Use the custom hook

//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         const userData = localStorage.getItem('user');
//         const loginTimestamp = localStorage.getItem('loginTimestamp');
    
//         if (token && userData && loginTimestamp) {
//             const currentTime = Date.now();
//             const elapsedTime = currentTime - loginTimestamp;
//             if (elapsedTime < SESSION_TIMEOUT) {
//                 setIsSignedIn(true);
//                 setUser(JSON.parse(userData));
//                 startSessionTimer(); // Restart the session timer if the session is still valid
//             } else {
//                 signOut(); // Sign out if the session has expired
//             }
//         }
//     }, [signOut, startSessionTimer]);
    

//     return (
//         <AuthContext.Provider value={{ isSignedIn, user, signIn, signOut }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export default AuthContext;

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import authService from '../services/authService';
import useSessionTimeout from '../services/useSessionTimeout';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const navigate = useNavigate();

    const [isSignedIn, setIsSignedIn] = useState(false);
    const [user, setUser] = useState(null);

    const signIn = async (phoneNumber) => {        
        try {
            const response = await authService.login(phoneNumber);   
            const userId = response.data.user.id;
            const user = await authService.getUser(userId);
            setIsSignedIn(true);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('loginTimestamp', Date.now());

            setUser(user);
            return user, response;  // return as object for both
        } catch (error) {
            setIsSignedIn(false);
            setUser(null);
            throw error;
        }
    };

    const signOut = useCallback(async () => {
        try {
            const response = await authService.logout();            
            if (response) {
                setIsSignedIn(false);
                setUser(null);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                clearTimeout(window.sessionTimeout);
                navigate('/');
            } else {
                console.error('Sign out failed:', response);
            }
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }, [navigate]);

    const startSessionTimer = useCallback(() => {
        clearTimeout(window.sessionTimeout);
        window.sessionTimeout = setTimeout(() => {
            signOut();
        }, SESSION_TIMEOUT);
    }, [signOut]);
  
    useSessionTimeout(isSignedIn, signOut);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        const loginTimestamp = localStorage.getItem('loginTimestamp');
    
        if (token && userData && loginTimestamp) {
            const currentTime = Date.now();
            const elapsedTime = currentTime - loginTimestamp;
            if (elapsedTime < SESSION_TIMEOUT) {
                setIsSignedIn(true);
                setUser(JSON.parse(userData));
                startSessionTimer();
            } else {
                signOut();
            }
        }
        
        // Clean-up function to clear the session timeout when component unmounts
        return () => clearTimeout(window.sessionTimeout);

    }, [startSessionTimer, signOut]);
    
    return (
        <AuthContext.Provider value={{ isSignedIn, user, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
