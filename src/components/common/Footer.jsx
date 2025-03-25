import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Tournament Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">FIFA World Cup 2026</h3>
            <p className="text-gray-400 mb-4">
              The first-ever 48-team World Cup tournament, hosted across three nations.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/simulations" className="text-gray-400 hover:text-white">
                  Tournaments
                </Link>
              </li>
              <li>
                <Link to="/qualification" className="text-gray-400 hover:text-white">
                  Qualification
                </Link>
              </li>
              <li>
                <Link to="/draw" className="text-gray-400 hover:text-white">
                  Group Draw
                </Link>
              </li>
              <li>
                <Link to="/matches" className="text-gray-400 hover:text-white">
                  Match Schedule
                </Link>
              </li>
            </ul>
          </div>

          {/* Host Nations */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Host Nations</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  United States
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Canada
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Mexico
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">
                <a href="mailto:info@wc2026sim.com" className="hover:text-white">
                  info@wc2026sim.com
                </a>
              </li>
              <li className="text-gray-400">
                <a href="#" className="hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li className="text-gray-400">
                <a href="#" className="hover:text-white">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} FIFA World Cup 2026 Simulator. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 