import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Composer from './pages/Composer';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { useAuth } from './hooks/useAuth';

function App() {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-950">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {token ? (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/compose" element={<Composer />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </>
        ) : (
          <Route path="*" element={<Login />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
