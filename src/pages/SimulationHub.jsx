import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Progress, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui';
import { Trophy, Users, Calendar, Flag, Target, Award, Settings, ArrowRight, TrendingUp } from 'lucide-react';
import { supabase } from '../supabase';
import { matchService, matchDateHelpers } from '../services/matchService';
import { statisticsService } from '../services/statisticsService';
import '../assets/styles/theme.css';

function SimulationHub() {
  const [activeTab, setActiveTab] = useState('overview');
  const [tournamentStats, setTournamentStats] = useState({
    totalMatches: 0,
    playedMatches: 0,
    upcomingMatches: 0,
    totalTeams: 0,
    qualifiedTeams: 0,
    currentStage: 'Group Stage',
    progress: 0
  });
  const [recentMatches, setRecentMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch matches
        const matches = await matchService.getMatches();
        
        // Fetch teams
        const { data: teams, error: teamsError } = await supabase
          .from('team')
          .select('*');
        
        if (teamsError) throw teamsError;

        // Fetch player statistics
        const playerStats = await statisticsService.getPlayerStatistics();
        
        // Calculate tournament statistics
        const totalMatches = matches?.length || 0;
        const playedMatches = matches?.filter(m => m.status === 'completed')?.length || 0;
        const upcomingMatches = matches?.filter(m => m.status === 'scheduled')?.length || 0;
        const inProgressMatches = matches?.filter(m => m.status === 'in_progress')?.length || 0;
        const totalTeams = teams?.length || 0;
        const qualifiedTeams = teams?.filter(t => t.qualified)?.length || 0;
        
        // Calculate progress (matches completed / total matches)
        const progress = totalMatches > 0 ? Math.round((playedMatches / totalMatches) * 100) : 0;
        
        // Determine current stage
        let currentStage = 'Not Started';
        if (inProgressMatches > 0) {
          currentStage = 'Group Stage (Live)';
        } else if (playedMatches > 0) {
          currentStage = 'Group Stage';
        }

        setTournamentStats({
          totalMatches,
          playedMatches,
          upcomingMatches,
          totalTeams,
          qualifiedTeams,
          currentStage,
          progress
        });

        // Set recent matches (last 5 completed matches)
        const recent = matches
          ?.filter(m => m.status === 'completed')
          ?.sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
          ?.slice(0, 5) || [];
        setRecentMatches(recent);

        // Set upcoming matches (next 5 scheduled matches)
        const upcoming = matches
          ?.filter(m => m.status === 'scheduled')
          ?.sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
          ?.slice(0, 5) || [];
        setUpcomingMatches(upcoming);

        // Set top scorers (top 5)
        const scorers = playerStats
          ?.filter(p => p.goals > 0)
          ?.sort((a, b) => b.goals - a.goals)
          ?.slice(0, 5) || [];
        setTopScorers(scorers);

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching tournament data:', err);
        setError('Failed to load tournament data');
        setIsLoading(false);
      }
    };

    fetchTournamentData();

    // Subscribe to real-time updates
    const matchSubscription = supabase
      .channel('tournament_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match' }, () => {
        fetchTournamentData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goal' }, () => {
        fetchTournamentData();
      })
      .subscribe();

    return () => {
      matchSubscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="px-4 py-6 md:py-8 flex items-center justify-center min-h-[400px]">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:py-8 space-y-6">
      {/* Tournament Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg border border-neutral-100">
          <CardHeader className="card-header-metallic border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-[var(--text-heading)]">
                <Trophy className="w-5 h-5 text-[var(--wc-blue)]" />
                FIFA World Cup 2026™
              </CardTitle>
              <Badge 
                variant={tournamentStats.progress > 0 ? "success" : "default"} 
                className={`w-fit ${tournamentStats.progress > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
              >
                {tournamentStats.progress > 0 ? 'In Progress' : 'Scheduled'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Tournament Progress</span>
                <span className="font-medium text-[var(--text-primary)]">{tournamentStats.progress}%</span>
              </div>
              <Progress value={tournamentStats.progress} className="h-2" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="text-sm text-[var(--text-secondary)]">Current Stage</div>
                  <div className="font-medium text-[var(--text-primary)]">{tournamentStats.currentStage}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="text-sm text-[var(--text-secondary)]">Matches Played</div>
                  <div className="font-medium text-[var(--text-primary)]">{tournamentStats.playedMatches}/{tournamentStats.totalMatches}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="text-sm text-[var(--text-secondary)]">Teams Participating</div>
                  <div className="font-medium text-[var(--text-primary)]">{tournamentStats.qualifiedTeams}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="text-sm text-[var(--text-secondary)]">Upcoming Matches</div>
                  <div className="font-medium text-[var(--text-primary)]">{tournamentStats.upcomingMatches}</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between border-t bg-gray-50">
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link to="/groups">
                <Users className="w-4 h-4 mr-2" />
                View Groups
              </Link>
            </Button>
            <Button className="w-full sm:w-auto bg-[var(--wc-blue)] hover:bg-[var(--wc-light-blue)]" asChild>
              <Link to="/matches">
                <Calendar className="w-4 h-4 mr-2" />
                View All Matches
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Top Scorers Quick View */}
      {topScorers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-lg border border-neutral-100">
            <CardHeader className="card-header-metallic border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[var(--text-heading)]">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top Scorers
                </CardTitle>
                <Link 
                  to="/stats" 
                  className="text-[var(--wc-blue)] hover:text-[var(--wc-dark-blue)] text-sm font-medium flex items-center"
                >
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {topScorers.map((scorer, index) => (
                  <div key={scorer.player.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      {scorer.player.team?.flag_url && (
                        <img 
                          src={scorer.player.team.flag_url} 
                          alt={scorer.player.team.name} 
                          className="w-5 h-4 object-cover rounded-sm shadow-sm"
                        />
                      )}
                      <span className="font-medium text-[var(--text-primary)] text-sm">{scorer.player.name}</span>
                      <span className="text-xs text-[var(--text-secondary)]">{scorer.player.team?.name}</span>
                    </div>
                    <div className="font-bold text-[var(--text-primary)]">{scorer.goals}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs Section */}
      <Tabs value={activeTab} onChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto -mx-4 px-4">
          <TabsList className="w-full sm:w-auto mb-2 sm:mb-0">
            <TabsTrigger value="overview" className="flex-1 sm:flex-initial">Overview</TabsTrigger>
            <TabsTrigger value="matches" className="flex-1 sm:flex-initial">Recent Matches</TabsTrigger>
            <TabsTrigger value="upcoming" className="flex-1 sm:flex-initial">Upcoming</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="card-header-metallic">
                <CardTitle className="flex items-center gap-2 text-[var(--text-heading)]">
                  <Calendar className="w-5 h-5 text-[var(--wc-accent-blue)]" />
                  Matches
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">{tournamentStats.totalMatches}</div>
                <div className="text-sm text-[var(--text-secondary)]">{tournamentStats.playedMatches} completed, {tournamentStats.upcomingMatches} upcoming</div>
                <Link 
                  to="/matches" 
                  className="text-[var(--wc-blue)] hover:text-[var(--wc-dark-blue)] text-sm font-medium flex items-center mt-2"
                >
                  View Schedule
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="card-header-metallic">
                <CardTitle className="flex items-center gap-2 text-[var(--text-heading)]">
                  <Users className="w-5 h-5 text-[var(--wc-accent-blue)]" />
                  Teams
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">{tournamentStats.qualifiedTeams}</div>
                <div className="text-sm text-[var(--text-secondary)]">Participating in the tournament</div>
                <Link 
                  to="/teams" 
                  className="text-[var(--wc-blue)] hover:text-[var(--wc-dark-blue)] text-sm font-medium flex items-center mt-2"
                >
                  View Teams
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="card-header-metallic">
                <CardTitle className="flex items-center gap-2 text-[var(--text-heading)]">
                  <Flag className="w-5 h-5 text-[var(--wc-accent-blue)]" />
                  Groups
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">Group Stage</div>
                <div className="text-sm text-[var(--text-secondary)]">Current tournament phase</div>
                <Link 
                  to="/groups" 
                  className="text-[var(--wc-blue)] hover:text-[var(--wc-dark-blue)] text-sm font-medium flex items-center mt-2"
                >
                  View Standings
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <Card>
            <CardHeader className="card-header-metallic border-b">
              <CardTitle className="flex items-center gap-2 text-[var(--text-heading)]">
                <Calendar className="w-5 h-5" />
                Recent Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentMatches.length > 0 ? (
                <div className="divide-y">
                  {recentMatches.map((match) => (
                    <Link
                      key={match.id}
                      to={`/matches/${match.id}`}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {match.home_team?.flag_url && (
                              <img 
                                src={match.home_team.flag_url} 
                                alt={match.home_team.name} 
                                className="w-6 h-4 object-cover rounded-sm shadow-sm"
                              />
                            )}
                            <span className="font-medium text-[var(--text-primary)] text-sm">{match.home_team?.name || 'TBD'}</span>
                          </div>
                          <div className="font-bold text-lg text-[var(--text-primary)]">
                            {match.home_score || 0} - {match.away_score || 0}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[var(--text-primary)] text-sm">{match.away_team?.name || 'TBD'}</span>
                            {match.away_team?.flag_url && (
                              <img 
                                src={match.away_team.flag_url} 
                                alt={match.away_team.name} 
                                className="w-6 h-4 object-cover rounded-sm shadow-sm"
                              />
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-[var(--text-secondary)]">
                          {matchDateHelpers.formatDate(match.datetime)}
                        </div>
                      </div>
                      {match.group && (
                        <div className="mt-2">
                          <span className="inline-block bg-[var(--wc-silver-blue)] bg-opacity-20 text-[var(--wc-blue)] px-2 py-1 rounded-full text-xs font-medium">
                            Group {match.group.name}
                          </span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center text-[var(--text-secondary)] py-8">
                  No matches have been completed yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader className="card-header-metallic border-b">
              <CardTitle className="flex items-center gap-2 text-[var(--text-heading)]">
                <Calendar className="w-5 h-5" />
                Upcoming Fixtures
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {upcomingMatches.length > 0 ? (
                <div className="divide-y">
                  {upcomingMatches.map((match) => (
                    <Link
                      key={match.id}
                      to={`/matches/${match.id}`}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {match.home_team?.flag_url && (
                              <img 
                                src={match.home_team.flag_url} 
                                alt={match.home_team.name} 
                                className="w-6 h-4 object-cover rounded-sm shadow-sm"
                              />
                            )}
                            <span className="font-medium text-[var(--text-primary)] text-sm">{match.home_team?.name || 'TBD'}</span>
                          </div>
                          <span className="font-medium text-[var(--text-muted)]">vs</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[var(--text-primary)] text-sm">{match.away_team?.name || 'TBD'}</span>
                            {match.away_team?.flag_url && (
                              <img 
                                src={match.away_team.flag_url} 
                                alt={match.away_team.name} 
                                className="w-6 h-4 object-cover rounded-sm shadow-sm"
                              />
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-[var(--text-primary)]">
                            {matchDateHelpers.formatDate(match.datetime)}
                          </div>
                          <div className="text-xs text-[var(--text-secondary)]">
                            {matchDateHelpers.formatTime(match.datetime)}
                          </div>
                        </div>
                      </div>
                      {match.group && (
                        <div className="mt-2">
                          <span className="inline-block bg-[var(--wc-silver-blue)] bg-opacity-20 text-[var(--wc-blue)] px-2 py-1 rounded-full text-xs font-medium">
                            Group {match.group.name}
                          </span>
                        </div>
                      )}
                      {match.venue && (
                        <div className="mt-1 text-xs text-[var(--text-secondary)]">
                          📍 {match.venue.name}, {match.venue.city}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center text-[var(--text-secondary)] py-8">
                  No upcoming matches scheduled.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SimulationHub; 