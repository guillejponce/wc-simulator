import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { statisticsService } from '../services/statisticsService';
import { Trophy, Award, AlertTriangle, AlertCircle } from 'lucide-react';

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

    loadStats();
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-black">Tournament Statistics</h1>

      {/* Top Scorers */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Scorers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-black">Player</th>
                  <th className="text-center py-2 text-black">Team</th>
                  <th className="text-center py-2 text-black">Goals</th>
                  <th className="text-center py-2 text-black">Assists</th>
                  <th className="text-center py-2 text-black">Matches</th>
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
                          <span className="font-medium text-black">{index + 1}.</span>
                          <span className="text-black">{stat.player.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-2">
                        <div className="flex items-center justify-center gap-2">
                          {stat.player.team?.flag_url && (
                            <img 
                              src={stat.player.team.flag_url} 
                              alt={stat.player.team.name} 
                              className="w-6 h-4 object-cover rounded-sm shadow-sm"
                            />
                          )}
                          <span className="text-black">{stat.player.team?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="text-center py-2 font-bold text-black">{stat.goals}</td>
                      <td className="text-center py-2 text-black">{stat.assists}</td>
                      <td className="text-center py-2 text-black">{stat.matches_played}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Assists */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Award className="w-5 h-5 text-blue-500" />
            Top Assists
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-black">Player</th>
                  <th className="text-center py-2 text-black">Team</th>
                  <th className="text-center py-2 text-black">Assists</th>
                  <th className="text-center py-2 text-black">Goals</th>
                  <th className="text-center py-2 text-black">Matches</th>
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
                          <span className="font-medium text-black">{index + 1}.</span>
                          <span className="text-black">{stat.player.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-2">
                        <div className="flex items-center justify-center gap-2">
                          {stat.player.team?.flag_url && (
                            <img 
                              src={stat.player.team.flag_url} 
                              alt={stat.player.team.name} 
                              className="w-6 h-4 object-cover rounded-sm shadow-sm"
                            />
                          )}
                          <span className="text-black">{stat.player.team?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="text-center py-2 font-bold text-black">{stat.assists}</td>
                      <td className="text-center py-2 text-black">{stat.goals}</td>
                      <td className="text-center py-2 text-black">{stat.matches_played}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cards Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yellow Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Yellow Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-black">Player</th>
                    <th className="text-center py-2 text-black">Team</th>
                    <th className="text-center py-2 text-black">Yellow Cards</th>
                    <th className="text-center py-2 text-black">Matches</th>
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
                            <span className="font-medium text-black">{index + 1}.</span>
                            <span className="text-black">{stat.player.name}</span>
                          </div>
                        </td>
                        <td className="text-center py-2">
                          <div className="flex items-center justify-center gap-2">
                            {stat.player.team?.flag_url && (
                              <img 
                                src={stat.player.team.flag_url} 
                                alt={stat.player.team.name} 
                                className="w-6 h-4 object-cover rounded-sm shadow-sm"
                              />
                            )}
                            <span className="text-black">{stat.player.team?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="text-center py-2 font-bold text-black">{stat.yellow_cards}</td>
                        <td className="text-center py-2 text-black">{stat.matches_played}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Red Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Red Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-black">Player</th>
                    <th className="text-center py-2 text-black">Team</th>
                    <th className="text-center py-2 text-black">Red Cards</th>
                    <th className="text-center py-2 text-black">Matches</th>
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
                            <span className="font-medium text-black">{index + 1}.</span>
                            <span className="text-black">{stat.player.name}</span>
                          </div>
                        </td>
                        <td className="text-center py-2">
                          <div className="flex items-center justify-center gap-2">
                            {stat.player.team?.flag_url && (
                              <img 
                                src={stat.player.team.flag_url} 
                                alt={stat.player.team.name} 
                                className="w-6 h-4 object-cover rounded-sm shadow-sm"
                              />
                            )}
                            <span className="text-black">{stat.player.team?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="text-center py-2 font-bold text-black">{stat.red_cards}</td>
                        <td className="text-center py-2 text-black">{stat.matches_played}</td>
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