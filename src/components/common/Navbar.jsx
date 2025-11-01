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
    <nav className="bg-wc-black border-b-4 border-wc-gold relative z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="relative">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-wc-gold" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bebas text-lg sm:text-xl tracking-wider">WC 2026 SIMULATOR</span>
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
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors font-bebas tracking-wider ${
                    isActive(item.href)
                      ? 'bg-wc-dark-gray text-wc-gold'
                      : 'text-white hover:bg-wc-dark-gray hover:text-wc-gold'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-1.5" />
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
              className="text-white border-wc-gold hover:bg-wc-gold hover:text-wc-black font-bebas tracking-wider"
            >
              <LogIn className="h-4 w-4 mr-1.5" />
              Sign In
            </Button>
            <Button 
              size="sm" 
              className="bg-wc-gold text-wc-black hover:bg-wc-gold/90 font-bebas tracking-wider"
            >
              <UserPlus className="h-4 w-4 mr-1.5" />
              Create Account
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:bg-wc-dark-gray h-10 w-10 p-2 rounded-full"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
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
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-40 w-full max-w-xs bg-wc-black md:hidden overflow-y-auto shadow-xl"
            >
              <div className="px-4 py-4 border-b border-wc-dark-gray">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-6 w-6 text-wc-gold" />
                    <span className="text-white font-bebas text-lg tracking-wider">WC 2026 SIMULATOR</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-wc-dark-gray h-10 w-10 p-2 rounded-full"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              
              <div className="px-4 py-6 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 rounded-md text-base font-medium font-bebas tracking-wider ${
                      isActive(item.href)
                        ? 'bg-wc-dark-gray text-wc-gold'
                        : 'text-white hover:bg-wc-dark-gray hover:text-wc-gold'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                ))}
              </div>
              
              {/* Mobile Auth Buttons */}
              <div className="px-4 py-6 border-t border-wc-dark-gray space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full text-white border-wc-gold hover:bg-wc-gold hover:text-wc-black justify-center font-bebas tracking-wider text-base"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In
                </Button>
                <Button 
                  className="w-full bg-wc-gold text-wc-black hover:bg-wc-gold/90 justify-center font-bebas tracking-wider text-base"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
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