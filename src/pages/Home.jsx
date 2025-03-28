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
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            FIFA World Cup Simulator
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl">
            Create your own World Cup tournament, manage teams, simulate matches, and track results all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white shadow-md border-0 backdrop-blur-sm w-full sm:w-auto"
              asChild
            >
              <Link to="/matches">Start Simulating</Link>
            </Button>
            <Button
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white hover:bg-opacity-10 backdrop-blur-sm w-full sm:w-auto"
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
              <Users className="h-5 w-5 text-[var(--wc-accent-blue)]" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Manage national teams participating in the World Cup</p>
              <div className="mt-4">
                <Link 
                  to="/teams" 
                  className="text-[var(--wc-blue)] hover:text-[var(--wc-dark-blue)] text-sm font-medium flex items-center"
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
              <Calendar className="h-5 w-5 text-[var(--wc-accent-blue)]" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Schedule and simulate World Cup matches</p>
              <div className="mt-4">
                <Link 
                  to="/matches" 
                  className="text-[var(--wc-blue)] hover:text-[var(--wc-dark-blue)] text-sm font-medium flex items-center"
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
              <Users className="h-5 w-5 text-[var(--wc-accent-blue)]" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Track standings and results for each group</p>
              <div className="mt-4">
                <Link 
                  to="/groups" 
                  className="text-[var(--wc-blue)] hover:text-[var(--wc-dark-blue)] text-sm font-medium flex items-center"
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
            className="bg-gradient-to-r from-[#eef2f7] to-[#e6edf5] hover:from-[#e6edf5] hover:to-[#d9e3ef] p-4 rounded-lg border border-[var(--wc-silver-blue)] flex items-center gap-3 transition-colors"
          >
            <div className="bg-[var(--wc-blue)] rounded-full p-2 text-white">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-[var(--text-heading)]">Create Match</h3>
              <p className="text-sm text-[var(--text-secondary)]">Add a new fixture</p>
            </div>
          </Link>

          <Link 
            to="/teams/new" 
            className="bg-gradient-to-r from-[#eef2f7] to-[#e6edf5] hover:from-[#e6edf5] hover:to-[#d9e3ef] p-4 rounded-lg border border-[var(--wc-silver-blue)] flex items-center gap-3 transition-colors"
          >
            <div className="bg-[var(--wc-light-blue)] rounded-full p-2 text-white">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-[var(--text-heading)]">Add Team</h3>
              <p className="text-sm text-[var(--text-secondary)]">Register new team</p>
            </div>
          </Link>

          <Link 
            to="/qualification" 
            className="bg-gradient-to-r from-[#eef2f7] to-[#e6edf5] hover:from-[#e6edf5] hover:to-[#d9e3ef] p-4 rounded-lg border border-[var(--wc-silver-blue)] flex items-center gap-3 transition-colors"
          >
            <div className="bg-[var(--wc-accent-blue)] rounded-full p-2 text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-[var(--text-heading)]">Qualification</h3>
              <p className="text-sm text-[var(--text-secondary)]">Track progression</p>
            </div>
          </Link>

          <Link 
            to="/draw" 
            className="bg-gradient-to-r from-[#eef2f7] to-[#e6edf5] hover:from-[#e6edf5] hover:to-[#d9e3ef] p-4 rounded-lg border border-[var(--wc-silver-blue)] flex items-center gap-3 transition-colors"
          >
            <div className="bg-[var(--wc-metallic-blue)] rounded-full p-2 text-white">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-[var(--text-heading)]">Draw</h3>
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
                <div className="bg-[#e6edf5] rounded-full p-1.5">
                  <Sparkles className="h-4 w-4 text-[var(--wc-accent-blue)]" />
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text-heading)]">Enhanced UI</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Completely redesigned user interface with improved responsiveness for all devices
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="bg-[#e6edf5] rounded-full p-1.5">
                  <Sparkles className="h-4 w-4 text-[var(--wc-accent-blue)]" />
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text-heading)]">Match Simulation</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    New match simulation engine with realistic outcomes based on team strengths
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="bg-[#e6edf5] rounded-full p-1.5">
                  <Sparkles className="h-4 w-4 text-[var(--wc-accent-blue)]" />
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text-heading)]">Venue Support</h3>
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