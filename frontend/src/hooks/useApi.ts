import axios from 'axios';
import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useApi = (token: string | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async (method: string, endpoint: string, data?: any) => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios({
          method,
          url: `${API_BASE}${endpoint}`,
          data,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        return response.data;
      } catch (err: any) {
        const message = err.response?.data?.error || 'API request failed';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return { request, loading, error };
};
