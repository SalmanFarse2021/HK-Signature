/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { adminLogin as apiAdminLogin } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken'));
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('adminUser');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) localStorage.setItem('adminToken', token);
    else localStorage.removeItem('adminToken');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('adminUser', JSON.stringify(user));
    else localStorage.removeItem('adminUser');
  }, [user]);

  async function login(credentials) {
    const res = await apiAdminLogin(credentials);
    if (res?.token) setToken(res.token);
    if (res?.user) setUser(res.user);
    return res;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ token, user, login, logout }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

