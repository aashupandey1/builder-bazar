import { createContext, useContext, useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bb_token');
    if (!token) {
      setLoading(false);
      return;
    }
    axiosClient
      .get(ENDPOINTS.ME)
      .then((res) => setUser(res.data.data))
      .catch(() => {
        localStorage.removeItem('bb_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await axiosClient.post(ENDPOINTS.LOGOUT);
    localStorage.removeItem('bb_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);