import React from 'react';
import { Trophy, Globe, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#f5f5f5] border-t border-gray-200 pt-8 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and tagline */}
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-2 mb-3">
              <Trophy className="h-5 w-5 text-[#1a472a]" />
              <span className="font-bold text-[#1a472a]">FIFA World Cup 2026</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Experience the excitement of the first-ever 48-team World Cup tournament
              across Canada, Mexico, and the United States.
            </p>
            <div className="flex items-center space-x-4">
              <a href="https://github.com" className="text-gray-500 hover:text-gray-700 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://fifa.com" className="text-gray-500 hover:text-gray-700 transition-colors">
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-[#1a472a] mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/matches" className="text-sm text-gray-600 hover:text-[#1a472a] transition-colors">
                  Matches
                </Link>
              </li>
              <li>
                <Link to="/groups" className="text-sm text-gray-600 hover:text-[#1a472a] transition-colors">
                  Groups
                </Link>
              </li>
              <li>
                <Link to="/teams" className="text-sm text-gray-600 hover:text-[#1a472a] transition-colors">
                  Teams
                </Link>
              </li>
              <li>
                <Link to="/stats" className="text-sm text-gray-600 hover:text-[#1a472a] transition-colors">
                  Statistics
                </Link>
              </li>
            </ul>
          </div>
          
          {/* About */}
          <div>
            <h3 className="font-semibold text-[#1a472a] mb-4">About</h3>
            <p className="text-sm text-gray-600 mb-4">
              This simulator allows you to create and manage your own World Cup tournament,
              with realistic match simulations and comprehensive statistics.
            </p>
            <p className="text-xs text-gray-500">
              &copy; {currentYear} FIFA World Cup Simulator. All rights reserved.
            </p>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <p className="text-xs text-gray-500">
              This is a fan project and is not affiliated with, or endorsed by FIFA.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 