/*
 * AuthContext - shares "who is logged in" with every component, so we do not have to
 * pass the user down through props (this avoids "prop drilling").
 */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => api.getSession()?.user || null);

  const login = useCallback(async (membershipId, password) => {
    const session = await api.login(membershipId, password);
    api.saveSession(session);
    setUser(session.user);
    return session.user;
  }, []);

  const logout = useCallback(() => {
    api.clearSession();
    setUser(null);
  }, []);

  // api.js fires this event when the server says our token is no longer valid.
  useEffect(() => {
    window.addEventListener('session-expired', logout);
    return () => window.removeEventListener('session-expired', logout);
  }, [logout]);

  // After a browser refresh, confirm the saved token still works and refresh the user details.
  useEffect(() => {
    if (!api.getSession()?.token) return;
    api.getMe()
      .then(({ user: fresh }) => {
        api.saveSession({ ...api.getSession(), user: fresh });
        setUser(fresh);
      })
      .catch(() => {}); // a 401 already logs the user out via the event above
  }, []);

  const value = useMemo(() => ({
    user,
    login,
    logout,
    isAdmin: user?.role === 'administrator',
    isStaff: user?.role === 'administrator' || user?.role === 'librarian',
  }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
