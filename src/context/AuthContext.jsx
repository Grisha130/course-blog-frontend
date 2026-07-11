import { createContext, useContext, useState, useEffect } from 'react';
import api, { getCsrfCookie } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [unverified, setUnverified] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkProfile = async () => {
    try {
      const res = await api.get('/profile');
      const currentUser = res.data.data;
      setUser(currentUser);
      setUnverified(false);
      return currentUser;
    } catch (err) {
      if (err.response?.status === 403) {
        setUnverified(true);
        if (err.response.data?.data) {
          setUser(err.response.data.data);
          return err.response.data.data;
        }
      } else {
        setUser(null);
        setUnverified(false);
      }
      return null;
    }
  };

  useEffect(() => {
    getCsrfCookie()
      .catch(() => {})
      .finally(() => {
        checkProfile().finally(() => setLoading(false));
      });
  }, []);

  const register = async (data) => {
    await getCsrfCookie();
    const res = await api.post('/register', data);
    setUser(res.data.data);
    setUnverified(true);
    return res.data;
  };

  const login = async (data) => {
    await getCsrfCookie();
    const res = await api.post('/login', data);
    const loggedInUser = res.data.data;

    setUser(loggedInUser);
    setUnverified(!loggedInUser.email_verified_at);

    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
    } finally {
      setUser(null);
      setUnverified(false);
    }
  };

  const resendVerification = () => api.post('/email/resend');

  return (
    <AuthContext.Provider
      value={{ user, unverified, loading, register, login, logout, resendVerification, refreshAuth: checkProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}