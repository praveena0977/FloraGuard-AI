import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { HistoryPage } from './pages/HistoryPage';
import { DiseaseLibrary } from './pages/DiseaseLibrary';
import { useApp } from './hooks/useApp';

export default function App() {
  const { user, predictions, loading, login, register, logout, addPrediction } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcf9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-emerald-900 font-serif text-xl font-medium animate-pulse">FloraGuard AI</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#fdfcf9]">
        <Navbar user={user} onLogout={logout} />
        
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/dashboard" /> : <AuthPage onLogin={login} onRegister={register} />}
          />
          
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard onAddPrediction={addPrediction} /> : <Navigate to="/auth" />} 
          />
          
          <Route 
            path="/history" 
            element={user ? <HistoryPage predictions={predictions} /> : <Navigate to="/auth" />} 
          />
          
          <Route path="/library" element={<DiseaseLibrary />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        
        <footer className="py-12 px-6 border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                <span className="font-bold text-lg">F</span>
              </div>
              <span className="font-serif text-xl font-bold text-emerald-950">FloraGuard AI</span>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-gray-500 font-medium">
              <a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Contact Us</a>
            </div>
            
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} FloraGuard AI. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
