import { useState, useEffect, useCallback } from 'react';
import { Prediction, User } from '../types';

const TOKEN_KEY = 'flora_guard_token';

export function useApp() {
  const [user, setUser] = useState<User | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.predictions) setPredictions(data.predictions);
      }
    } catch {
      // silently ignore – history will appear empty
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          setUser(data.user);
          return loadHistory(token);
        })
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [loadHistory]);

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || 'Login failed';
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
      await loadHistory(data.token);
      return null;
    } catch {
      return 'Network error. Is the server running?';
    }
  };

  const register = async (name: string, email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || 'Registration failed';
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
      return null;
    } catch {
      return 'Network error. Is the server running?';
    }
  };

  const logout = () => {
    setUser(null);
    setPredictions([]);
    localStorage.removeItem(TOKEN_KEY);
  };

  const addPrediction = (prediction: Prediction) => {
    setPredictions((prev) => [prediction, ...prev]);
  };

  return { user, predictions, loading, login, register, logout, addPrediction };
}
