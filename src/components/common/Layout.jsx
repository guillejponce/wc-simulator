import React from 'react';
import { Trophy, Users, Target, Flag } from 'lucide-react';
import '../../assets/styles/theme.css';

function Layout({ children }) {
  const navigation = [
    { name: 'Qualification', href: '/qualification', icon: Users },
    { name: 'Draw', href: '/draw', icon: Trophy },
    { name: 'Groups', href: '/groups', icon: Flag },
    { name: 'Matches', href: '/matches', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-[var(--background-secondary)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <a href="/" className="flex items-center gap-2">
                <Trophy className="w-8 h-8 text-[var(--wc-blue)]" />
                <span className="font-bold text-xl bg-gradient-to-r from-[var(--wc-red)] to-[var(--wc-blue)] text-transparent bg-clip-text">
                  WC 2026
                </span>
              </a>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-[var(--text-primary)] hover:bg-[var(--background-secondary)] hover:text-[var(--wc-blue)] transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 min-h-screen container mx-auto px-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[var(--border-color)] py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[var(--wc-blue)]" />
              <span className="font-bold text-lg text-[var(--text-primary)]">FIFA World Cup 2026™</span>
            </div>
            <p className="text-[var(--text-primary)] opacity-80">
              United 2026 - Canada, Mexico & USA
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout; 