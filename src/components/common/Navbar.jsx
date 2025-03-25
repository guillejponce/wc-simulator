import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge } from '../ui';
import { Trophy, Menu, X, ChevronDown, Globe, Users, Calendar, Target, Award, Settings, LogIn, UserPlus } from 'lucide-react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Tournaments', href: '/', icon: Trophy },
    { name: 'Qualification', href: '/qualification', icon: Globe },
    { name: 'Draw', href: '/draw', icon: Target },
    { name: 'Groups', href: '/groups', icon: Users },
    { name: 'Matches', href: '/matches', icon: Calendar },
    { name: 'Knockout', href: '/knockout', icon: Award },
    { name: 'Teams', href: '/teams', icon: Users },
    { name: 'Stats', href: '/stats', icon: Award },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-[#1a472a] via-[#2d5a3f] to-[#1a472a] border-b-4 border-[#ffd700]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="relative">
                <Globe className="h-6 w-6 text-[#ffd700]" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#ffd700] rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-sm">FIFA World Cup 2026</span>
                <span className="text-[#ffd700] text-xs">Simulator</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-[#2d5a3f] text-[#ffd700] shadow-lg shadow-[#1a472a]/20'
                      : 'text-white hover:bg-[#2d5a3f] hover:text-[#ffd700]'
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5 mr-1.5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-white border-[#ffd700] hover:bg-[#ffd700] hover:text-[#1a472a] text-xs px-2"
            >
              <LogIn className="h-3.5 w-3.5 mr-1.5" />
              Sign In
            </Button>
            <Button 
              size="sm" 
              className="bg-[#ffd700] text-[#1a472a] hover:bg-[#ffd700]/90 text-xs px-2 font-semibold"
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Create Account
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:bg-[#2d5a3f] h-8 w-8"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#1a472a]"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(item.href)
                      ? 'bg-[#2d5a3f] text-[#ffd700]'
                      : 'text-white hover:bg-[#2d5a3f] hover:text-[#ffd700]'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar; 