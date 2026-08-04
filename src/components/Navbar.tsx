import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, History, LogOut, User as UserIcon, Menu, X, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { User } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  const navLinks = user ? [
    { name: 'Predict', path: '/dashboard', icon: <Leaf size={16} /> },
    { name: 'Library', path: '/library', icon: <Info size={16} /> },
    { name: 'History', path: '/history', icon: <History size={16} /> },
  ] : [
    { name: 'Library', path: '/library', icon: <Info size={16} /> },
  ];

  return (
    <nav className="sticky top-0 z-50 px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-2xl px-4 md:px-6 py-3">
        <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <Leaf size={24} />
          </div>
          <span className="font-serif text-xl md:text-2xl font-bold tracking-tight text-emerald-950">FloraGuard</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              {navLinks.map(link => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-emerald-600 flex items-center gap-1.5",
                    isActive(link.path) ? "text-emerald-600" : "text-gray-600"
                  )}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-gray-900">{user.name}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Member</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-gray-400"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <Link 
              to="/auth" 
              className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-emerald-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-4 right-4 md:hidden glass rounded-3xl p-6 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  {navLinks.map(link => (
                    <Link 
                      key={link.path}
                      to={link.path} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl transition-colors",
                        isActive(link.path) ? "bg-emerald-50 text-emerald-600" : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {link.icon}
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  ))}
                  <button 
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors mt-2"
                  >
                    <LogOut size={16} />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <Link 
                  to="/auth" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-emerald-600 text-white p-4 rounded-2xl font-bold text-center shadow-lg"
                >
                  Sign In to FloraGuard
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
