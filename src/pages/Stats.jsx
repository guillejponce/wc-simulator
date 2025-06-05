import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import { statisticsService } from '../services/statisticsService';
import { Trophy, Award, AlertTriangle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../supabase';

function Stats() {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for expandable sections
  const [expandedSections, setExpandedSections] = useState({
    scorers: false,
    assists: false,
    yellowCards: false,
    redCards: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getDisplayLimit = (section, hasData) => {
    if (!hasData) return 0;
    return expandedSections[section] ? hasData : Math.min(10, hasData);
  };

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

  // Prepare data for each category
  const scorersData = stats.filter(player => player.goals > 0);
  const assistsData = stats.filter(player => player.assists > 0).sort((a, b) => b.assists - a.assists);
  const yellowCardsData = stats.filter(player => player.yellow_cards > 0).sort((a, b) => b.yellow_cards - a.yellow_cards);
  const redCardsData = stats.filter(player => player.red_cards > 0).sort((a, b) => b.red_cards - a.red_cards);

  const renderPlayerTable = (data, category, columns) => {
    const displayLimit = getDisplayLimit(category, data.length);
    const hasMoreData = data.length > 10;
    
    return (
      <>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {columns.map((column, index) => (
                  <th key={index} className={column.className}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, displayLimit).map((stat, index) => (
                <tr key={stat.player.id} className="border-b last:border-0">
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--text-primary)] text-xs sm:text-sm">{index + 1}.</span>
                      <span className="text-[var(--text-primary)] text-xs sm:text-sm">{stat.player.name}</span>
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
                      <span className="text-[var(--text-primary)] text-xs sm:text-sm">{stat.player.team?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  {columns.slice(2).map((column, colIndex) => (
                    <td key={colIndex} className={column.className}>
                      {column.getValue(stat)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {hasMoreData && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSection(category)}
              className="flex items-center gap-2 mx-auto"
            >
              {expandedSections[category] ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show All ({data.length} players)
                </>
              )}
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-[var(--text-heading)]">Tournament Statistics</h1>

      {/* Top Scorers */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="flex items-center gap-2 text-[var(--text-heading)] text-lg sm:text-xl">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            Top Scorers
            {scorersData.length > 0 && (
              <span className="text-sm font-normal text-[var(--text-muted)]">({scorersData.length} players)</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          {scorersData.length > 0 ? (
            renderPlayerTable(scorersData, 'scorers', [
              { label: 'Player', className: 'text-left py-2 text-[var(--text-primary)] text-xs sm:text-sm' },
              { label: 'Team', className: 'text-center py-2 text-[var(--text-primary)] text-xs sm:text-sm' },
              { 
                label: 'Goals', 
                className: 'text-center py-2 text-[var(--text-primary)] text-xs sm:text-sm', 
                getValue: (stat) => <span className="font-bold">{stat.goals}</span>
              },
              { 
                label: 'Assists', 
                className: 'text-center py-2 text-[var(--text-primary)] text-xs sm:text-sm hidden sm:table-cell', 
                getValue: (stat) => stat.assists
              },
              { 
                label: 'Matches', 
                className: 'text-center py-2 text-[var(--text-primary)] text-xs sm:text-sm hidden sm:table-cell', 
                getValue: (stat) => stat.matches_played
              }
            ])
          ) : (
            <div className="text-center py-8 text-[var(--text-muted)]">
              <Trophy className="w-12 h-12 mx-auto mb-2 text-[var(--text-muted)]" />
              <p>No goals scored yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Assists */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="flex items-center gap-2 text-[var(--text-heading)] text-lg sm:text-xl">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            Top Assists
            {assistsData.length > 0 && (
              <span className="text-sm font-normal text-[var(--text-muted)]">({assistsData.length} players)</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          {assistsData.length > 0 ? (
            renderPlayerTable(assistsData, 'assists', [
              { label: 'Player', className: 'text-left py-2 text-[var(--text-primary)] text-xs sm:text-sm' },
              { label: 'Team', className: 'text-center py-2 text-[var(--text-primary)] text-xs sm:text-sm' },
              { 
                label: 'Assists', 
                className: 'text-center py-2 text-[var(--text-primary)] text-xs sm:text-sm', 
                getValue: (stat) => <span className="font-bold">{stat.assists}</span>
              },
              { 
                label: 'Goals', 
                className: 'text-center py-2 text-[var(--text-primary)] text-xs sm:text-sm hidden sm:table-cell', 
                getValue: (stat) => stat.goals
              },
              { 
                label: 'Matches', 
                className: 'text-center py-2 text-[var(--text-primary)] text-xs sm:text-sm hidden sm:table-cell', 
                getValue: (stat) => stat.matches_played
              }
            ])
          ) : (
            <div className="text-center py-8 text-[var(--text-muted)]">
              <Award className="w-12 h-12 mx-auto mb-2 text-[var(--text-muted)]" />
              <p>No assists recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cards Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Yellow Cards */}
        <Card>
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="flex items-center gap-2 text-[var(--text-heading)] text-lg sm:text-xl">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              Yellow Cards
              {yellowCardsData.length > 0 && (
                <span className="text-sm font-normal text-[var(--text-muted)]">({yellowCardsData.length})</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            {yellowCardsData.length > 0 ? (
              renderPlayerTable(yellowCardsData, 'yellowCards', [
                { label: 'Player', className: 'text-left py-2 text-[var(--text-primary)] text-xs sm:text-sm' },
                { label: 'Team', className: 'text-center py-2 text-[var(--text-primary)] text-xs sm:text-sm' },
                { 
                  label: 'Yellow Cards', 
                  className: 'text-center py-2 text-[var(--text-primary)] text-xs sm:text-sm', 
                  getValue: (stat) => <span className="font-bold">{stat.yellow_cards}</span>
                },
                { 
                  label: 'Matches', 
                  className: 'text-center py-2 text-[var(--text-primary)] text-xs sm:text-sm hidden sm:table-cell', 
                  getValue: (stat) => stat.matches_played
                }
              ])
            ) : (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-[var(--text-muted)]" />
                <p>No yellow cards yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Red Cards */}
        <Card>
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="flex items-center gap-2 text-[var(--text-heading)] text-lg sm:text-xl">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              Red Cards
              {redCardsData.length > 0 && (
                <span className="text-sm font-normal text-[var(--text-muted)]">({redCardsData.length})</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            {redCardsData.length > 0 ? (
              renderPlayerTable(redCardsData, 'redCards', [
                { label: 'Player', className: 'text-left py-2 text-[var(--text-primary)] text-xs sm:text-sm' },
                { label: 'Team', className: 'text-center py-2 text-[var(--text-primary)] text-xs sm:text-sm' },
                { 
                  label: 'Red Cards', 
                  className: 'text-center py-2 text-[var(--text-primary)] text-xs sm:text-sm', 
                  getValue: (stat) => <span className="font-bold">{stat.red_cards}</span>
                },
                { 
                  label: 'Matches', 
                  className: 'text-center py-2 text-[var(--text-primary)] text-xs sm:text-sm hidden sm:table-cell', 
                  getValue: (stat) => stat.matches_played
                }
              ])
            ) : (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 text-[var(--text-muted)]" />
                <p>No red cards yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Stats; 