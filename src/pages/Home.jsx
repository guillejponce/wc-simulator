import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Button } from '../components/ui/Button';
import { Trophy, Users, Calendar, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import '../assets/styles/theme.css';

function Home() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
      {/* Hero section */}
      <div className="header-gradient rounded-xl shadow-lg overflow-hidden">
        <div className="py-10 md:py-16 px-6 md:px-8">
          <h1 className="text-3xl md:text-5xl font-bebas tracking-wider mb-4">
            FIFA WORLD CUP 2026 SIMULATOR
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl">
            Create your own World Cup tournament, manage teams, simulate matches, and track results all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              className="bg-wc-gold text-wc-black hover:bg-wc-gold/90 shadow-md border-0 w-full sm:w-auto font-bebas tracking-wider"
              asChild
            >
              <Link to="/matches">Start Simulating</Link>
            </Button>
            <Button
              variant="outline"
              className="bg-transparent border-wc-gold text-white hover:bg-wc-gold hover:text-wc-black w-full sm:w-auto font-bebas tracking-wider"
              asChild
            >
              <Link to="/groups">View Groups</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tournament overview */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-[var(--text-heading)]">Tournament Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="h-full">
            <CardHeader className="card-header-metallic flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Teams</CardTitle>
              <Users className="h-5 w-5 text-wc-gold" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Manage national teams participating in the World Cup</p>
              <div className="mt-4">
                <Link 
                  to="/teams" 
                  className="text-wc-black hover:text-wc-gold text-sm font-medium flex items-center font-bebas tracking-wider"
                >
                  View Teams
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader className="card-header-metallic flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Matches</CardTitle>
              <Calendar className="h-5 w-5 text-wc-gold" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Schedule and simulate World Cup matches</p>
              <div className="mt-4">
                <Link 
                  to="/matches" 
                  className="text-wc-black hover:text-wc-gold text-sm font-medium flex items-center font-bebas tracking-wider"
                >
                  View Matches
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader className="card-header-metallic flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Groups</CardTitle>
              <Users className="h-5 w-5 text-wc-gold" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Track standings and results for each group</p>
              <div className="mt-4">
                <Link 
                  to="/groups" 
                  className="text-wc-black hover:text-wc-gold text-sm font-medium flex items-center font-bebas tracking-wider"
                >
                  View Groups
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-[var(--text-heading)]">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/matches/new" 
            className="bg-gradient-to-r from-neutral-50 to-neutral-100 hover:from-neutral-100 hover:to-neutral-200 p-4 rounded-lg border border-neutral-200 flex items-center gap-3 transition-colors"
          >
            <div className="bg-wc-black rounded-full p-2 text-wc-gold">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bebas tracking-wider text-base text-[var(--text-heading)]">Create Match</h3>
              <p className="text-sm text-[var(--text-secondary)]">Add a new fixture</p>
            </div>
          </Link>

          <Link 
            to="/teams/new" 
            className="bg-gradient-to-r from-neutral-50 to-neutral-100 hover:from-neutral-100 hover:to-neutral-200 p-4 rounded-lg border border-neutral-200 flex items-center gap-3 transition-colors"
          >
            <div className="bg-wc-gold rounded-full p-2 text-wc-black">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bebas tracking-wider text-base text-[var(--text-heading)]">Add Team</h3>
              <p className="text-sm text-[var(--text-secondary)]">Register new team</p>
            </div>
          </Link>

          <Link 
            to="/qualification" 
            className="bg-gradient-to-r from-neutral-50 to-neutral-100 hover:from-neutral-100 hover:to-neutral-200 p-4 rounded-lg border border-neutral-200 flex items-center gap-3 transition-colors"
          >
            <div className="bg-wc-dark-gray rounded-full p-2 text-wc-gold">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bebas tracking-wider text-base text-[var(--text-heading)]">Qualification</h3>
              <p className="text-sm text-[var(--text-secondary)]">Track progression</p>
            </div>
          </Link>

          <Link 
            to="/draw" 
            className="bg-gradient-to-r from-neutral-50 to-neutral-100 hover:from-neutral-100 hover:to-neutral-200 p-4 rounded-lg border border-neutral-200 flex items-center gap-3 transition-colors"
          >
            <div className="bg-wc-black rounded-full p-2 text-wc-gold">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bebas tracking-wider text-base text-[var(--text-heading)]">Draw</h3>
              <p className="text-sm text-[var(--text-secondary)]">Group allocation</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Latest Updates */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-[var(--text-heading)]">Latest Updates</h2>
        <Card>
          <CardHeader className="card-header-metallic">
            <CardTitle className="text-lg font-semibold text-[var(--text-heading)]">What's New</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="bg-wc-gold rounded-full p-1.5">
                  <Sparkles className="h-4 w-4 text-wc-black" />
                </div>
                <div>
                  <h3 className="font-bebas tracking-wider text-base text-[var(--text-heading)]">Enhanced UI</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Completely redesigned user interface with improved responsiveness for all devices
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="bg-wc-gold rounded-full p-1.5">
                  <Sparkles className="h-4 w-4 text-wc-black" />
                </div>
                <div>
                  <h3 className="font-bebas tracking-wider text-base text-[var(--text-heading)]">Match Simulation</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    New match simulation engine with realistic outcomes based on team strengths
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="bg-wc-gold rounded-full p-1.5">
                  <Sparkles className="h-4 w-4 text-wc-black" />
                </div>
                <div>
                  <h3 className="font-bebas tracking-wider text-base text-[var(--text-heading)]">Venue Support</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Added venue selection for matches with real-world stadium information
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Home; 