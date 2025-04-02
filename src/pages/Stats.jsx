import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { statisticsService } from '../services/statisticsService';
import { Trophy, Award, AlertTriangle, AlertCircle } from 'lucide-react';
import { supabase } from '../supabase';

function Stats() {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const playerStats = await statisticsService.getPlayerStatistics();
        setStats(playerStats);
      } catch (err) {
        console.error('Error loading statistics:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    // Load initial stats
    loadStats();

    // Subscribe to match events changes
    const matchEventsSubscription = supabase
      .channel('match_events_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_event'
        },
        () => {
          // Reload stats when any match event changes
          loadStats();
        }
      )
      .subscribe();

    // Subscribe to goals changes
    const goalsSubscription = supabase
      .channel('goals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goal'
        },
        () => {
          // Reload stats when any goal changes
          loadStats();
        }
      )
      .subscribe();

    // Subscribe to match score changes
    const matchScoreSubscription = supabase
      .channel('match_score_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'match',
          filter: 'home_score,away_score'
        },
        () => {
          // Reload stats when match score changes
          loadStats();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      matchEventsSubscription.unsubscribe();
      goalsSubscription.unsubscribe();
      matchScoreSubscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded">
          <div className="font-medium">Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-black">Tournament Statistics</h1>

      {/* Top Scorers */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="flex items-center gap-2 text-black text-lg sm:text-xl">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            Top Scorers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-black text-xs sm:text-sm">Player</th>
                  <th className="text-center py-2 text-black text-xs sm:text-sm">Team</th>
                  <th className="text-center py-2 text-black text-xs sm:text-sm">Goals</th>
                  <th className="text-center py-2 text-black text-xs sm:text-sm hidden sm:table-cell">Assists</th>
                  <th className="text-center py-2 text-black text-xs sm:text-sm hidden sm:table-cell">Matches</th>
                </tr>
              </thead>
              <tbody>
                {stats
                  .filter(player => player.goals > 0)
                  .slice(0, 10)
                  .map((stat, index) => (
                    <tr key={stat.player.id} className="border-b last:border-0">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-black text-xs sm:text-sm">{index + 1}.</span>
                          <span className="text-black text-xs sm:text-sm">{stat.player.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-2">
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                          {stat.player.team?.flag_url && (
                            <img 
                              src={stat.player.team.flag_url} 
                              alt={stat.player.team.name} 
                              className="w-4 h-3 sm:w-5 sm:h-4 object-cover rounded-sm shadow-sm"
                            />
                          )}
                          <span className="text-black text-xs sm:text-sm">{stat.player.team?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="text-center py-2 font-bold text-black text-xs sm:text-sm">{stat.goals}</td>
                      <td className="text-center py-2 text-black text-xs sm:text-sm hidden sm:table-cell">{stat.assists}</td>
                      <td className="text-center py-2 text-black text-xs sm:text-sm hidden sm:table-cell">{stat.matches_played}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Assists */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="flex items-center gap-2 text-black text-lg sm:text-xl">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            Top Assists
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-black text-xs sm:text-sm">Player</th>
                  <th className="text-center py-2 text-black text-xs sm:text-sm">Team</th>
                  <th className="text-center py-2 text-black text-xs sm:text-sm">Assists</th>
                  <th className="text-center py-2 text-black text-xs sm:text-sm hidden sm:table-cell">Goals</th>
                  <th className="text-center py-2 text-black text-xs sm:text-sm hidden sm:table-cell">Matches</th>
                </tr>
              </thead>
              <tbody>
                {stats
                  .filter(player => player.assists > 0)
                  .sort((a, b) => b.assists - a.assists)
                  .slice(0, 10)
                  .map((stat, index) => (
                    <tr key={stat.player.id} className="border-b last:border-0">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-black text-xs sm:text-sm">{index + 1}.</span>
                          <span className="text-black text-xs sm:text-sm">{stat.player.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-2">
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                          {stat.player.team?.flag_url && (
                            <img 
                              src={stat.player.team.flag_url} 
                              alt={stat.player.team.name} 
                              className="w-4 h-3 sm:w-5 sm:h-4 object-cover rounded-sm shadow-sm"
                            />
                          )}
                          <span className="text-black text-xs sm:text-sm">{stat.player.team?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="text-center py-2 font-bold text-black text-xs sm:text-sm">{stat.assists}</td>
                      <td className="text-center py-2 text-black text-xs sm:text-sm hidden sm:table-cell">{stat.goals}</td>
                      <td className="text-center py-2 text-black text-xs sm:text-sm hidden sm:table-cell">{stat.matches_played}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cards Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Yellow Cards */}
        <Card>
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="flex items-center gap-2 text-black text-lg sm:text-xl">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              Yellow Cards
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-black text-xs sm:text-sm">Player</th>
                    <th className="text-center py-2 text-black text-xs sm:text-sm">Team</th>
                    <th className="text-center py-2 text-black text-xs sm:text-sm">Yellow Cards</th>
                    <th className="text-center py-2 text-black text-xs sm:text-sm hidden sm:table-cell">Matches</th>
                  </tr>
                </thead>
                <tbody>
                  {stats
                    .filter(player => player.yellow_cards > 0)
                    .sort((a, b) => b.yellow_cards - a.yellow_cards)
                    .slice(0, 10)
                    .map((stat, index) => (
                      <tr key={stat.player.id} className="border-b last:border-0">
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-black text-xs sm:text-sm">{index + 1}.</span>
                            <span className="text-black text-xs sm:text-sm">{stat.player.name}</span>
                          </div>
                        </td>
                        <td className="text-center py-2">
                          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            {stat.player.team?.flag_url && (
                              <img 
                                src={stat.player.team.flag_url} 
                                alt={stat.player.team.name} 
                                className="w-4 h-3 sm:w-5 sm:h-4 object-cover rounded-sm shadow-sm"
                              />
                            )}
                            <span className="text-black text-xs sm:text-sm">{stat.player.team?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="text-center py-2 font-bold text-black text-xs sm:text-sm">{stat.yellow_cards}</td>
                        <td className="text-center py-2 text-black text-xs sm:text-sm hidden sm:table-cell">{stat.matches_played}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Red Cards */}
        <Card>
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="flex items-center gap-2 text-black text-lg sm:text-xl">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              Red Cards
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-black text-xs sm:text-sm">Player</th>
                    <th className="text-center py-2 text-black text-xs sm:text-sm">Team</th>
                    <th className="text-center py-2 text-black text-xs sm:text-sm">Red Cards</th>
                    <th className="text-center py-2 text-black text-xs sm:text-sm hidden sm:table-cell">Matches</th>
                  </tr>
                </thead>
                <tbody>
                  {stats
                    .filter(player => player.red_cards > 0)
                    .sort((a, b) => b.red_cards - a.red_cards)
                    .slice(0, 10)
                    .map((stat, index) => (
                      <tr key={stat.player.id} className="border-b last:border-0">
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-black text-xs sm:text-sm">{index + 1}.</span>
                            <span className="text-black text-xs sm:text-sm">{stat.player.name}</span>
                          </div>
                        </td>
                        <td className="text-center py-2">
                          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            {stat.player.team?.flag_url && (
                              <img 
                                src={stat.player.team.flag_url} 
                                alt={stat.player.team.name} 
                                className="w-4 h-3 sm:w-5 sm:h-4 object-cover rounded-sm shadow-sm"
                              />
                            )}
                            <span className="text-black text-xs sm:text-sm">{stat.player.team?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="text-center py-2 font-bold text-black text-xs sm:text-sm">{stat.red_cards}</td>
                        <td className="text-center py-2 text-black text-xs sm:text-sm hidden sm:table-cell">{stat.matches_played}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Stats; 