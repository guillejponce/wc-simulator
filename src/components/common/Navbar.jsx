import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge } from '../ui';
import { Trophy, Menu, X, ChevronDown, Globe, Users, Calendar, Target, Award, Settings, LogIn, UserPlus } from 'lucide-react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);
  
  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

  const isActive = (path) => {
    if (path === '/teams' && location.pathname.startsWith('/teams/')) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-[#1a472a] via-[#2d5a3f] to-[#1a472a] border-b-4 border-[#ffd700] relative z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="relative">
                <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-[#ffd700]" />
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#ffd700] rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xs sm:text-sm">FIFA World Cup 2026</span>
                <span className="text-[#ffd700] text-[10px] sm:text-xs">Simulator</span>
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
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:bg-[#2d5a3f] h-9 w-9 sm:h-10 sm:w-10 p-2 rounded-full"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-30 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-40 w-[85%] max-w-sm bg-[#1a472a] md:hidden overflow-y-auto shadow-xl"
            >
              <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-[#2d5a3f]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-[#ffd700]" />
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-xs sm:text-sm">FIFA World Cup 2026</span>
                      <span className="text-[#ffd700] text-[10px] sm:text-xs">Simulator</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-[#2d5a3f] h-9 w-9 sm:h-10 sm:w-10 p-2 rounded-full"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </div>
              </div>
              
              <div className="px-3 sm:px-4 py-4 sm:py-6 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2.5 sm:py-3 rounded-md text-sm sm:text-base font-medium ${
                      isActive(item.href)
                        ? 'bg-[#2d5a3f] text-[#ffd700] shadow-inner shadow-[#1a472a]/50'
                        : 'text-white hover:bg-[#2d5a3f] hover:text-[#ffd700]'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    {item.name}
                  </Link>
                ))}
              </div>
              
              {/* Mobile Auth Buttons */}
              <div className="px-3 sm:px-4 py-4 sm:py-6 border-t border-[#2d5a3f] space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full text-white border-[#ffd700] hover:bg-[#ffd700] hover:text-[#1a472a] justify-center text-sm sm:text-base"
                >
                  <LogIn className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Sign In
                </Button>
                <Button 
                  className="w-full bg-[#ffd700] text-[#1a472a] hover:bg-[#ffd700]/90 justify-center font-semibold text-sm sm:text-base"
                >
                  <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Create Account
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar; 