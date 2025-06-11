import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui';
import { Trophy, Users, Clock, MapPin, Calendar } from 'lucide-react';
import { supabase } from '../supabase';
import { matchDateHelpers } from '../services/matchService';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/theme.css';

function Knockout() {
  const [groups, setGroups] = useState([]);
  const [thirdPlaces, setThirdPlaces] = useState([]);
  const [knockoutMatches, setKnockoutMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const navigate = useNavigate();

  // Define the Round of 32 matchups according to FIFA format - CORRECT ORDER
  const round32Matchups = [
    { id: 1, team1: 'Winner Group E', team2: '3rd Group A/B/D/E/F' },
    { id: 2, team1: 'Winner Group I', team2: '3rd Group C/D/F/G/H' },
    { id: 3, team1: 'Runner-up Group A', team2: 'Runner-up Group B' },
    { id: 4, team1: 'Winner Group F', team2: 'Runner-up Group C' },
    { id: 5, team1: 'Runner-up Group L', team2: 'Runner-up Group K' },
    { id: 6, team1: 'Winner Group H', team2: 'Runner-up Group J' },
    { id: 7, team1: 'Winner Group D', team2: '3rd Group B/E/F/I/J' },
    { id: 8, team1: 'Winner Group G', team2: '3rd Group A/E/H/I/J' },
    { id: 9, team1: 'Winner Group C', team2: 'Runner-up Group F' },
    { id: 10, team1: 'Runner-up Group E', team2: 'Runner-up Group I' },
    { id: 11, team1: 'Winner Group A', team2: '3rd Group C/E/F/H/I' },
    { id: 12, team1: 'Winner Group L', team2: '3rd Group E/H/I/J/K' },
    { id: 13, team1: 'Winner Group J', team2: 'Runner-up Group H' },
    { id: 14, team1: 'Runner-up Group D', team2: 'Runner-up Group G' },
    { id: 15, team1: 'Winner Group B', team2: '3rd Group E/F/G/I/J' },
    { id: 16, team1: 'Winner Group K', team2: '3rd Group D/E/I/J/L' }
  ];

  useEffect(() => {
    const fetchKnockoutData = async () => {
      try {
        setLoading(true);

        // Fetch groups data (reuse logic from Groups.jsx)
        const { data: groupsData, error: groupsError } = await supabase
          .from('group')
          .select('*')
          .order('name');

        if (groupsError) throw groupsError;

        const { data: teamGroupRecords, error: teamGroupError } = await supabase
          .from('team_group')
          .select(`
            *,
            team:team_id(id, name, code, flag_url, region)
          `)
          .order('group_id')
          .order('position');

        if (teamGroupError) throw teamGroupError;

        // Process groups data (same logic as Groups.jsx)
        const groupsMap = {};
        
        groupsData.forEach(group => {
          groupsMap[group.id] = {
            id: group.id,
            name: group.name,
            teams: []
          };

          for (let i = 1; i <= 4; i++) {
            const teamId = group[`team${i}_id`];
            if (teamId) {
              const teamStats = teamGroupRecords.find(record => 
                record.team_id === teamId && record.group_id === group.id
              );

              if (teamStats) {
                groupsMap[group.id].teams.push({
                  id: teamStats.team.id,
                  name: teamStats.team.name,
                  code: teamStats.team.code,
                  flag_url: teamStats.team.flag_url,
                  region: teamStats.team.region,
                  played: teamStats.played || 0,
                  won: teamStats.won || 0,
                  drawn: teamStats.drawn || 0,
                  lost: teamStats.lost || 0,
                  goalsFor: teamStats.goals_for || 0,
                  goalsAgainst: teamStats.goals_against || 0,
                  goalDifference: teamStats.goal_difference || 0,
                  points: teamStats.points || 0,
                  position: teamStats.position || i,
                  groupName: group.name
                });
              } else {
                // We'll handle teams without stats in a second pass
                groupsMap[group.id].teams.push({
                  id: teamId,
                  position: i,
                  isPlaceholder: true,
                  groupName: group.name
                });
              }
            }
          }
        });

        // Second pass: fetch details for teams without stats
        for (const groupId in groupsMap) {
          const group = groupsMap[groupId];
          for (let i = 0; i < group.teams.length; i++) {
            const team = group.teams[i];
            if (team.isPlaceholder) {
              const { data: teamData, error: teamError } = await supabase
                .from('team')
                .select('*')
                .eq('id', team.id)
                .single();
              
              if (!teamError && teamData) {
                group.teams[i] = {
                  id: teamData.id,
                  name: teamData.name,
                  code: teamData.code,
                  flag_url: teamData.flag_url,
                  region: teamData.region,
                  played: 0,
                  won: 0,
                  drawn: 0,
                  lost: 0,
                  goalsFor: 0,
                  goalsAgainst: 0,
                  goalDifference: 0,
                  points: 0,
                  position: team.position,
                  groupName: team.groupName
                };
              }
            }
          }
        }

        // Sort teams within each group
        for (const groupId in groupsMap) {
          const group = groupsMap[groupId];
          group.teams.sort((a, b) => {
            if (!a && !b) return 0;
            if (!a) return 1;
            if (!b) return -1;
            
            if (a.played > 0 || b.played > 0) {
              if (a.points !== b.points) return b.points - a.points;
              if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
              if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
              return a.name.localeCompare(b.name);
            }
            return a.position - b.position;
          });

          while (group.teams.length < 4) {
            group.teams.push(null);
          }
          group.teams = group.teams.slice(0, 4);
        }

        const groupsArray = Object.values(groupsMap).sort((a, b) => 
          a.name.localeCompare(b.name)
        );

        // Extract third places and sort them
        const thirdPlaceTeams = groupsArray
          .map(group => group.teams[2])
          .filter(team => team && team.name)
          .sort((a, b) => {
            if (a.points !== b.points) return b.points - a.points;
            if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
            if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
            return a.name.localeCompare(b.name);
          });

        setGroups(groupsArray);
        setThirdPlaces(thirdPlaceTeams);

        // Fetch knockout matches
        const { data: knockoutData, error: knockoutError } = await supabase
          .from('match')
          .select(`
            *,
            home_team:home_team_id(id, name, code, flag_url),
            away_team:away_team_id(id, name, code, flag_url),
            venue:venue_id(id, name, city, country)
          `)
          .is('group_id', null) // Knockout matches don't have group_id
          .order('datetime', { ascending: true });

        if (knockoutError) throw knockoutError;
        setKnockoutMatches(knockoutData || []);

      } catch (err) {
        console.error('Error fetching knockout data:', err);
        setError('Failed to load knockout data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchKnockoutData();
  }, [refreshKey]);

  // Function to get team for a specific position
  const getTeamForPosition = (position) => {
    const parts = position.split(' ');
    
    // Handle Winners
    if (parts[0] === 'Winner' && parts[1] === 'Group') {
      const groupName = parts[2];
      const group = groups.find(g => g.name === groupName);
      return group?.teams[0] || null; // First place
    }
    
    // Handle Runners-up
    if (parts[0] === 'Runner-up' && parts[1] === 'Group') {
      const groupName = parts[2];
      const group = groups.find(g => g.name === groupName);
      return group?.teams[1] || null; // Second place
    }
    
    // Handle Third places (complex logic)
    if (parts[0] === '3rd' && parts[1] === 'Group') {
      const qualifyingThirds = thirdPlaces.slice(0, 8);
      
      // Map specific third place combinations to positions
      const thirdPlaceMap = {
        'A/B/D/E/F': qualifyingThirds[0],
        'C/D/F/G/H': qualifyingThirds[1],
        'B/E/F/I/J': qualifyingThirds[2],
        'A/E/H/I/J': qualifyingThirds[3],
        'C/E/F/H/I': qualifyingThirds[4],
        'E/H/I/J/K': qualifyingThirds[5],
        'E/F/G/I/J': qualifyingThirds[6],
        'D/E/I/J/L': qualifyingThirds[7]
      };
      
      return thirdPlaceMap[parts[2]] || null;
    }
    
    return null;
  };

  // Get qualifying position label
  const getPositionLabel = (position) => {
    if (position.includes('Winner')) return '1st';
    if (position.includes('Runner-up')) return '2nd';
    if (position.includes('3rd')) return '3rd';
    return '';
  };

  // Component for rendering a bracket team (flag only)
  const BracketFlag = ({ position, showLabel = false }) => {
    const team = getTeamForPosition(position);
    const posLabel = getPositionLabel(position);

    if (!team) {
      return (
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-6 bg-gray-300 rounded border"></div>
          {showLabel && <div className="text-xs text-gray-400">{posLabel}</div>}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-1">
        <img
          src={team.flag_url || `https://flagcdn.com/w20/${team.code.toLowerCase()}.png`}
          alt={`${team.name} flag`}
          className="w-8 h-6 object-cover rounded border-2 border-[var(--wc-blue)] shadow-sm"
          title={`${team.name} (${posLabel} Group ${team.groupName})`}
        />
        {showLabel && (
          <div className="text-xs text-[var(--wc-blue)] font-medium text-center">
            {posLabel}
          </div>
        )}
      </div>
    );
  };

  // Component for a single bracket matchup (flags only)
  const BracketMatchup = ({ matchup, position = 'left' }) => {
    return (
      <div className="flex flex-col items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="text-xs font-medium text-[var(--wc-blue)] text-center">
          {matchup.id}
        </div>
        <div className="flex flex-col items-center gap-2">
          <BracketFlag position={matchup.team1} showLabel={true} />
          <div className="text-xs text-gray-400 font-bold">VS</div>
          <BracketFlag position={matchup.team2} showLabel={true} />
        </div>
      </div>
    );
  };

  // Tournament bracket component with progression lines
  const TournamentBracket = () => {
    return (
      <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Round of 32 */}
          <div className="mb-8">
            <h3 className="text-center font-bold text-[var(--wc-blue)] mb-4">Round of 32</h3>
            <div className="grid grid-cols-8 gap-3">
              {round32Matchups.map((matchup) => (
                <BracketMatchup key={matchup.id} matchup={matchup} />
              ))}
            </div>
          </div>

          {/* Round of 16 */}
          <div className="mb-8">
            <h3 className="text-center font-bold text-[var(--wc-blue)] mb-4">Round of 16</h3>
            <div className="grid grid-cols-8 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-2 p-2 bg-gray-100 border border-gray-300 rounded-lg">
                  <div className="text-xs font-medium text-gray-500">R16-{index + 1}</div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-6 bg-gray-300 rounded border"></div>
                    <div className="text-xs text-gray-400 font-bold">VS</div>
                    <div className="w-8 h-6 bg-gray-300 rounded border"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quarter Finals */}
          <div className="mb-8">
            <h3 className="text-center font-bold text-[var(--wc-blue)] mb-4">Quarter Finals</h3>
            <div className="grid grid-cols-4 gap-12 justify-center">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-2 p-2 bg-gray-100 border border-gray-300 rounded-lg">
                  <div className="text-xs font-medium text-gray-500">QF-{index + 1}</div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-6 bg-gray-300 rounded border"></div>
                    <div className="text-xs text-gray-400 font-bold">VS</div>
                    <div className="w-8 h-6 bg-gray-300 rounded border"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Semi Finals */}
          <div className="mb-8">
            <h3 className="text-center font-bold text-[var(--wc-blue)] mb-4">Semi Finals</h3>
            <div className="grid grid-cols-2 gap-24 justify-center">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-2 p-2 bg-gray-100 border border-gray-300 rounded-lg">
                  <div className="text-xs font-medium text-gray-500">SF-{index + 1}</div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-6 bg-gray-300 rounded border"></div>
                    <div className="text-xs text-gray-400 font-bold">VS</div>
                    <div className="w-8 h-6 bg-gray-300 rounded border"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final */}
          <div className="mb-8">
            <h3 className="text-center font-bold text-[var(--wc-blue)] mb-4">Final</h3>
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-b from-yellow-50 to-yellow-100 border-2 border-yellow-400 rounded-lg shadow-lg">
                <div className="text-sm font-bold text-yellow-700">🏆 FINAL</div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-7 bg-gray-300 rounded border"></div>
                  <div className="text-xs text-gray-400 font-bold">VS</div>
                  <div className="w-10 h-7 bg-gray-300 rounded border"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Third Place */}
          <div>
            <h3 className="text-center font-bold text-[var(--wc-blue)] mb-4">Third Place</h3>
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-2 p-3 bg-gradient-to-b from-orange-50 to-orange-100 border-2 border-orange-400 rounded-lg">
                <div className="text-sm font-bold text-orange-700">🥉 3rd PLACE</div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-6 bg-gray-300 rounded border"></div>
                  <div className="text-xs text-gray-400 font-bold">VS</div>
                  <div className="w-8 h-6 bg-gray-300 rounded border"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render match row for the table
  const renderMatchRow = (match, matchup) => {
    const team1 = getTeamForPosition(matchup.team1);
    const team2 = getTeamForPosition(matchup.team2);
    const homeTeamName = team1?.name || 'TBD';
    const awayTeamName = team2?.name || 'TBD';
    const formattedDate = match?.datetime ? matchDateHelpers.formatDate(match.datetime) : 'TBD';
    const formattedTime = match?.datetime ? matchDateHelpers.formatTime(match.datetime) : 'TBD';
    const venueName = match?.venue?.name || 'TBD';
    
    return (
      <TableRow 
        key={matchup.id} 
        className="hover:bg-[rgba(91,138,182,0.05)] cursor-pointer border-b border-neutral-200" 
        onClick={() => match?.id && navigate(`/matches/${match.id}`)}
      >
        <TableCell>
          <div className="flex items-center gap-2">
            {team1?.flag_url ? (
              <img 
                src={team1.flag_url} 
                alt={homeTeamName} 
                className="w-8 h-6 object-cover shadow-sm border border-neutral-200 rounded"
              />
            ) : (
              <div className="w-8 h-6 bg-neutral-100 rounded flex items-center justify-center text-neutral-400">
                <span className="text-xs">TBD</span>
              </div>
            )}
            <div>
              <span className="font-medium text-[var(--text-primary)]">{homeTeamName}</span>
              <div className="text-xs text-[var(--text-secondary)]">{getPositionLabel(matchup.team1)} Group {matchup.team1.split(' ').pop()}</div>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-center text-[var(--text-primary)]">
          {match?.status === 'completed' ? (
            <span className="font-bold text-lg">{match.home_score || 0} - {match.away_score || 0}</span>
          ) : match?.status === 'in_progress' ? (
            <span className="font-medium text-emerald-600 animate-pulse">{match.home_score || 0} - {match.away_score || 0}</span>
          ) : (
            <span className="font-medium text-[var(--text-muted)]">vs</span>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {team2?.flag_url ? (
              <img 
                src={team2.flag_url} 
                alt={awayTeamName} 
                className="w-8 h-6 object-cover shadow-sm border border-neutral-200 rounded"
              />
            ) : (
              <div className="w-8 h-6 bg-neutral-100 rounded flex items-center justify-center text-[var(--text-muted)]">
                <span className="text-xs">TBD</span>
              </div>
            )}
            <div>
              <span className="font-medium text-[var(--text-primary)]">{awayTeamName}</span>
              <div className="text-xs text-[var(--text-secondary)]">{getPositionLabel(matchup.team2)} Group {matchup.team2.split(' ').pop()}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <div className="font-medium text-[var(--text-primary)]">{formattedDate}</div>
            <div className="text-sm text-[var(--text-secondary)]">{formattedTime}</div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1 text-[var(--text-secondary)]">
            <MapPin className="w-3 h-3 text-[var(--text-muted)]" />
            <span className="text-sm">{venueName}</span>
          </div>
        </TableCell>
        <TableCell>
          <span className="inline-block bg-[var(--wc-silver-blue)] bg-opacity-20 text-[var(--wc-blue)] px-3 py-1 rounded-full font-medium text-sm">
            Round of 32
          </span>
        </TableCell>
        <TableCell>
          {match?.status === 'scheduled' ? (
            <span className="status-indicator status-scheduled">Scheduled</span>
          ) : match?.status === 'in_progress' ? (
            <span className="status-indicator status-live">Live</span>
          ) : match?.status === 'completed' ? (
            <span className="status-indicator status-completed">Completed</span>
          ) : (
            <span className="status-indicator status-scheduled">Pending</span>
          )}
        </TableCell>
      </TableRow>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loader" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8 font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
      <div className="header-gradient mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 md:p-6">
        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold flex flex-col md:flex-row items-center gap-2 md:gap-3">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
          <span>FIFA World Cup 2026™</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl opacity-90 mt-2 text-center md:text-left">Knockout Stage</p>
      </div>

      {/* Tournament Bracket */}
      <TournamentBracket />

      {/* Matches Table */}
      <Card className="match-card shadow-lg border border-neutral-100">
        <CardHeader className="card-header-metallic p-4 md:p-6 border-b border-neutral-100">
          <CardTitle className="text-lg md:text-xl font-semibold text-[var(--text-heading)] flex items-center gap-2">
            <div className="w-1 h-6 bg-[var(--wc-blue)] rounded-full"></div>
            Round of 32 Matches
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#f7f9fc]">
                <TableRow>
                  <TableHead className="font-bold text-[var(--text-primary)]">Home Team</TableHead>
                  <TableHead className="font-bold text-[var(--text-primary)] text-center">Score</TableHead>
                  <TableHead className="font-bold text-[var(--text-primary)]">Away Team</TableHead>
                  <TableHead className="font-bold text-[var(--text-primary)]">Date & Time</TableHead>
                  <TableHead className="font-bold text-[var(--text-primary)]">Venue</TableHead>
                  <TableHead className="font-bold text-[var(--text-primary)]">Stage</TableHead>
                  <TableHead className="font-bold text-[var(--text-primary)]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {round32Matchups.map((matchup) => {
                  const matchData = knockoutMatches.find(m => m.match_number === matchup.id);
                  return renderMatchRow(matchData, matchup);
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Knockout; 