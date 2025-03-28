import React from 'react';
import { Trophy, Users, Target, Flag } from 'lucide-react';
import '../../assets/styles/theme.css';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout({ children }) {
  const navigation = [
    { name: 'Qualification', href: '/qualification', icon: Users },
    { name: 'Draw', href: '/draw', icon: Trophy },
    { name: 'Groups', href: '/groups', icon: Flag },
    { name: 'Matches', href: '/matches', icon: Target },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Layout; 