import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Button } from '../components/ui';
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
  const [resolvedRound32Matchups, setResolvedRound32Matchups] = useState([]);
  const navigate = useNavigate();

  // Define the Round of 32 matchups according to FIFA format - CORRECT PAIRINGS
  const round32Matchups = [
    { id: 73, stage: 'Round of 32', team1: 'Runner-up Group A', team2: 'Runner-up Group B' },
    { id: 74, stage: 'Round of 32', team1: 'Winner Group E', team2: '3rd Group A/B/C/D/F' },
    { id: 75, stage: 'Round of 32', team1: 'Winner Group F', team2: 'Runner-up Group C' },
    { id: 76, stage: 'Round of 32', team1: 'Winner Group C', team2: 'Runner-up Group F' },
    { id: 77, stage: 'Round of 32', team1: 'Winner Group I', team2: '3rd Group C/D/F/G/H' },
    { id: 78, stage: 'Round of 32', team1: 'Runner-up Group E', team2: 'Runner-up Group I' },
    { id: 79, stage: 'Round of 32', team1: 'Winner Group A', team2: '3rd Group C/E/F/H/I' },
    { id: 80, stage: 'Round of 32', team1: 'Winner Group L', team2: '3rd Group E/H/I/J/K' },
    { id: 81, stage: 'Round of 32', team1: 'Winner Group D', team2: '3rd Group B/E/F/I/J' },
    { id: 82, stage: 'Round of 32', team1: 'Winner Group G', team2: '3rd Group A/E/H/I/J' },
    { id: 83, stage: 'Round of 32', team1: 'Runner-up Group K', team2: 'Runner-up Group L' },
    { id: 84, stage: 'Round of 32', team1: 'Winner Group H', team2: 'Runner-up Group J' },
    { id: 85, stage: 'Round of 32', team1: 'Winner Group B', team2: '3rd Group E/F/G/I/J' },
    { id: 86, stage: 'Round of 32', team1: 'Winner Group J', team2: 'Runner-up Group H' },
    { id: 87, stage: 'Round of 32', team1: 'Winner Group K', team2: '3rd Group D/E/I/J/L' },
    { id: 88, stage: 'Round of 32', team1: 'Runner-up Group D', team2: 'Runner-up Group G' }
  ];

  const round16Matchups = [
    { id: 89, stage: 'Round of 16', team1: 'Winner 74', team2: 'Winner 77' },
    { id: 90, stage: 'Round of 16', team1: 'Winner 73', team2: 'Winner 75' },
    { id: 91, stage: 'Round of 16', team1: 'Winner 76', team2: 'Winner 78' },
    { id: 92, stage: 'Round of 16', team1: 'Winner 79', team2: 'Winner 80' },
    { id: 93, stage: 'Round of 16', team1: 'Winner 83', team2: 'Winner 84' },
    { id: 94, stage: 'Round of 16', team1: 'Winner 81', team2: 'Winner 82' },
    { id: 95, stage: 'Round of 16', team1: 'Winner 86', team2: 'Winner 88' },
    { id: 96, stage: 'Round of 16', team1: 'Winner 85', team2: 'Winner 87' },
  ];

  const quarterFinalsMatchups = [
    { id: 97, stage: 'Quarter-finals', team1: 'Winner 89', team2: 'Winner 90' },
    { id: 98, stage: 'Quarter-finals', team1: 'Winner 93', team2: 'Winner 94' },
    { id: 99, stage: 'Quarter-finals', team1: 'Winner 91', team2: 'Winner 92' },
    { id: 100, stage: 'Quarter-finals', team1: 'Winner 95', team2: 'Winner 96' },
  ];

  const semiFinalsMatchups = [
    { id: 101, stage: 'Semi-finals', team1: 'Winner 97', team2: 'Winner 98' },
    { id: 102, stage: 'Semi-finals', team1: 'Winner 99', team2: 'Winner 100' },
  ];

  const thirdPlaceMatchup = { id: 103, stage: 'Third Place', team1: 'Loser 101', team2: 'Loser 102' };
  const finalMatchup = { id: 104, stage: 'Final', team1: 'Winner 101', team2: 'Winner 102' };

  const allKnockoutStages = [
    ...round32Matchups,
    ...round16Matchups,
    ...quarterFinalsMatchups,
    ...semiFinalsMatchups,
    thirdPlaceMatchup,
    finalMatchup
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

        // Recalculate stats from all group matches to ensure data is accurate
        const { data: groupMatches, error: matchesError } = await supabase
          .from('match')
          .select('home_team_id, away_team_id, home_score, away_score, status, group_id')
          .not('group_id', 'is', null);

        if (matchesError) {
          console.error('Error fetching group matches:', matchesError);
          throw matchesError;
        }

        if (groupMatches) {
          for (const groupId in groupsMap) {
            const group = groupsMap[groupId];
            for (const team of group.teams) {
              if (team && team.id) {
                const playedMatches = groupMatches.filter(m => 
                  m.group_id === group.id &&
                  (m.home_team_id === team.id || m.away_team_id === team.id) &&
                  (m.status === 'completed' || m.status === 'in_progress')
                );

                let won = 0, drawn = 0, lost = 0, goalsFor = 0, goalsAgainst = 0;

                playedMatches.forEach(m => {
                  const isHome = m.home_team_id === team.id;
                  const scoreFor = isHome ? (m.home_score || 0) : (m.away_score || 0);
                  const scoreAgainst = isHome ? (m.away_score || 0) : (m.home_score || 0);

                  goalsFor += scoreFor;
                  goalsAgainst += scoreAgainst;

                   if (m.status === 'completed') {
                    if (scoreFor > scoreAgainst) won++;
                    else if (scoreFor < scoreAgainst) lost++;
                    else drawn++;
                  }
                });
                
                team.played = playedMatches.length;
                team.won = won;
                team.drawn = drawn;
                team.lost = lost;
                team.goalsFor = goalsFor;
                team.goalsAgainst = goalsAgainst;
                team.goalDifference = goalsFor - goalsAgainst;
                team.points = (won * 3) + drawn;
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

        // Resolve third-place matchups
        const qualifyingThirds = thirdPlaceTeams.slice(0, 8);
        const resolvedMatchups = resolveThirdPlaceMatchups(round32Matchups, qualifyingThirds);
        setResolvedRound32Matchups(resolvedMatchups);

      } catch (err) {
        console.error('Error fetching knockout data:', err);
        setError('Failed to load knockout data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchKnockoutData();
  }, [refreshKey]);

  const handleCreateMatch = async (matchup) => {
    const team1 = getTeamForPosition(matchup.team1);
    const team2 = getTeamForPosition(matchup.team2, matchup);

    if (!team1 || !team2) {
      alert("Both teams must be determined before creating a match.");
      return;
    }

    const basePayload = {
      home_team_id: team1.id,
      away_team_id: team2.id,
      status: 'scheduled',
    };

    let payload = { ...basePayload, match_number: matchup.id, stage: matchup.stage };

    try {
      let { error } = await supabase.from('match').insert(payload).single();
      if (error && (error.message.includes('match_number') || error.message.includes('stage'))) {
        // Remove missing columns and retry
        ({ error } = await supabase.from('match').insert(basePayload).single());
      }
      if (error) throw error;

      alert('Match created successfully!');
      setRefreshKey(Date.now()); // Refresh data
    } catch (error) {
      console.error('Error creating match:', error);
      alert(`Failed to create match: ${error.message}`);
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!matchId) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this match? This cannot be undone.');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('match').delete().eq('id', matchId);
      if (error) throw error;
      alert('Match deleted successfully.');
      setRefreshKey(Date.now());
    } catch (err) {
      console.error('Error deleting match:', err);
      alert(`Failed to delete match: ${err.message}`);
    }
  };

  const resolveThirdPlaceMatchups = (matchups, thirdPlaceTeams) => {
    let availableTeams = [...thirdPlaceTeams];
    let resolved = false;

    // We'll return the original matchups if we can't resolve them
    const finalMatchups = JSON.parse(JSON.stringify(matchups));

    // Backtracking function to find a valid assignment
    function findAssignment(matchupIndex, currentAssignments) {
      if (matchupIndex === matchups.length) {
        resolved = true;
        return true;
      }

      const matchup = matchups[matchupIndex];
      if (!matchup.team2.startsWith('3rd Group')) {
        // Not a third-place matchup, move to the next
        return findAssignment(matchupIndex + 1, currentAssignments);
      }

      const allowedGroups = matchup.team2.split(' ')[2].split('/');
      
      for (let i = 0; i < availableTeams.length; i++) {
        const team = availableTeams[i];
        if (allowedGroups.includes(team.groupName)) {
          // Add assignment
          currentAssignments[matchup.id] = team;
          
          // Temporarily remove team from available pool
          const removedTeam = availableTeams.splice(i, 1)[0];

          if (findAssignment(matchupIndex + 1, currentAssignments)) {
            return true; // Found a full valid assignment
          }

          // Backtrack
          availableTeams.splice(i, 0, removedTeam); // Add team back
          delete currentAssignments[matchup.id]; // Remove assignment
        }
      }

      return false; // No valid assignment found from this path
    }
    
    const assignments = {};
    const thirdPlaceMatchups = matchups.filter(m => m.team2.startsWith('3rd Group'));
    
    // A simplified assignment function for just the third place matchups
    function findThirdPlaceAssignment(matchupIdx, currentAssignments) {
        if (matchupIdx === thirdPlaceMatchups.length) {
            resolved = true;
            return true;
        }

        const matchup = thirdPlaceMatchups[matchupIdx];
        const allowedGroups = matchup.team2.split(' ')[2].split('/');

        for (let i = 0; i < availableTeams.length; i++) {
            const team = availableTeams[i];
            if (allowedGroups.includes(team.groupName)) {
                currentAssignments[matchup.id] = team;
                const removedTeam = availableTeams.splice(i, 1)[0];

                if (findThirdPlaceAssignment(matchupIdx + 1, currentAssignments)) {
                    return true;
                }

                availableTeams.splice(i, 0, removedTeam);
                delete currentAssignments[matchup.id];
            }
        }
        return false;
    }

    findThirdPlaceAssignment(0, assignments);

    if (resolved) {
      return finalMatchups.map(m => {
        if (assignments[m.id]) {
          return { ...m, resolvedTeam2: assignments[m.id] };
        }
        return m;
      });
    } else {
      console.warn("Could not resolve third place matchups with a valid assignment.");
      return finalMatchups;
    }
  };

  // Function to get team for a specific position
  const getTeamForPosition = (position, matchup = null) => {
    const parts = position.split(' ');
    // First handle direct group references
    if (parts[0] === 'Winner' && parts[1] === 'Group') {
      const groupName = parts[2];
      const group = groups.find(g => g.name === groupName);
      return group?.teams[0] || null; // First place
    }
    if (parts[0] === 'Runner-up' && parts[1] === 'Group') {
      const groupName = parts[2];
      const group = groups.find(g => g.name === groupName);
      return group?.teams[1] || null; // Second place
    }
    if (parts[0] === '3rd' && parts[1] === 'Group') {
      return matchup?.resolvedTeam2 || null;
    }

    // Then handle winners/losers of previous knockout matches (e.g., 'Winner 73')
    if (position.startsWith('Winner') || position.startsWith('Loser')) {
      const tokens = position.split(' ');
      const matchId = parseInt(tokens[1], 10);
      if (!Number.isFinite(matchId)) return null;
      const sourceMatch = knockoutMatches.find(m => m.match_number === matchId);
      if (sourceMatch && sourceMatch.status === 'completed') {
        const isWinner = tokens[0] === 'Winner';
        const homeWon = sourceMatch.home_score > sourceMatch.away_score || (sourceMatch.home_score === sourceMatch.away_score && sourceMatch.home_penalty_score > sourceMatch.away_penalty_score);
        const awayWon = sourceMatch.away_score > sourceMatch.home_score || (sourceMatch.home_score === sourceMatch.away_score && sourceMatch.away_penalty_score > sourceMatch.home_penalty_score);
        if (isWinner) {
          if (homeWon) return sourceMatch.home_team;
          if (awayWon) return sourceMatch.away_team;
        } else {
          if (!homeWon) return sourceMatch.home_team;
          if (!awayWon) return sourceMatch.away_team;
        }
      }
      return null;
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
  const BracketFlag = ({ position, showLabel = false, matchup = null }) => {
    const team = getTeamForPosition(position, matchup);
    const posLabel = getPositionLabel(position);
    const isWinnerOrLoser = position.startsWith('Winner') || position.startsWith('Loser');

    if (!team) {
      return (
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-6 bg-gray-300 rounded border"></div>
          {showLabel && <div className="text-xs text-gray-400">{isWinnerOrLoser ? position : posLabel}</div>}
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
            {isWinnerOrLoser ? position : posLabel}
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
          <BracketFlag position={matchup.team2} showLabel={true} matchup={matchup} />
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
              {resolvedRound32Matchups.map((matchup) => (
                <BracketMatchup key={matchup.id} matchup={matchup} />
              ))}
            </div>
          </div>

          {/* Round of 16 */}
          <div className="mb-8">
            <h3 className="text-center font-bold text-[var(--wc-blue)] mb-4">Round of 16</h3>
            <div className="grid grid-cols-8 gap-6">
              {round16Matchups.map((matchup) => (
                 <BracketMatchup key={matchup.id} matchup={matchup} />
              ))}
            </div>
          </div>

          {/* Quarter Finals */}
          <div className="mb-8">
            <h3 className="text-center font-bold text-[var(--wc-blue)] mb-4">Quarter Finals</h3>
            <div className="grid grid-cols-4 gap-12 justify-center">
               {quarterFinalsMatchups.map((matchup) => (
                <BracketMatchup key={matchup.id} matchup={matchup} />
              ))}
            </div>
          </div>

          {/* Semi Finals */}
          <div className="mb-8">
            <h3 className="text-center font-bold text-[var(--wc-blue)] mb-4">Semi Finals</h3>
            <div className="grid grid-cols-2 gap-24 justify-center">
              {semiFinalsMatchups.map((matchup) => (
                <BracketMatchup key={matchup.id} matchup={matchup} />
              ))}
            </div>
          </div>

          {/* Final */}
          <div className="mb-8">
            <h3 className="text-center font-bold text-[var(--wc-blue)] mb-4">Final</h3>
            <div className="flex justify-center">
               <BracketMatchup matchup={finalMatchup} />
            </div>
          </div>

          {/* Third Place */}
          <div>
            <h3 className="text-center font-bold text-[var(--wc-blue)] mb-4">Third Place</h3>
            <div className="flex justify-center">
               <BracketMatchup matchup={thirdPlaceMatchup} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render match row for the table
  const renderMatchRow = (matchup) => {
    const team1 = getTeamForPosition(matchup.team1, matchup);
    const team2 = getTeamForPosition(matchup.team2, matchup);

    // Find match using match_number when available, otherwise by teams + stage + scheduled/completed
    const matchData = knockoutMatches.find(m => {
      if (m.match_number) return m.match_number === matchup.id;
      // fallback matching logic
      const sameTeams = m.home_team_id === team1?.id && m.away_team_id === team2?.id;
      return sameTeams;
    });
    
    const homeTeamName = team1?.name || matchup.team1;
    const awayTeamName = team2?.name || matchup.team2;
    const formattedDate = matchData?.datetime ? matchDateHelpers.formatDate(matchData.datetime) : 'TBD';
    const formattedTime = matchData?.datetime ? matchDateHelpers.formatTime(matchData.datetime) : 'TBD';
    const venueName = matchData?.venue?.name || 'TBD';
    
    return (
      <TableRow 
        key={matchup.id} 
        className="hover:bg-[rgba(91,138,182,0.05)] cursor-pointer border-b border-neutral-200" 
        onClick={() => matchData?.id && navigate(`/matches/${matchData.id}`)}
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
                <span className="text-xs">{homeTeamName}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-[var(--text-primary)]">{homeTeamName}</span>
              {team1 && <div className="text-xs text-[var(--text-secondary)]">{getPositionLabel(matchup.team1)} Group {team1.groupName}</div>}
            </div>
          </div>
        </TableCell>
        <TableCell className="text-center text-[var(--text-primary)]">
          {matchData?.status === 'completed' ? (
            <span className="font-bold text-lg">{matchData.home_score || 0} - {matchData.away_score || 0}</span>
          ) : matchData?.status === 'in_progress' ? (
            <span className="font-medium text-emerald-600 animate-pulse">{matchData.home_score || 0} - {matchData.away_score || 0}</span>
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
                 <span className="text-xs">{awayTeamName}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-[var(--text-primary)]">{awayTeamName}</span>
               {team2 && <div className="text-xs text-[var(--text-secondary)]">{getPositionLabel(matchup.team2)} Group {team2.groupName}</div>}
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
            {matchup.stage}
          </span>
        </TableCell>
        <TableCell>
          {matchData?.id ? (
            <span className={`status-indicator status-${matchData.status}`}>
              {matchData.status}
            </span>
          ) : (
            <span className="status-indicator status-scheduled">Pending</span>
          )}
        </TableCell>
        <TableCell>
          {/* Action buttons */}
          {!matchData && (
            <Button
              variant="outline"
              size="sm"
              disabled={!team1 || !team2}
              onClick={(e) => {
                e.stopPropagation();
                handleCreateMatch({
                  ...matchup,
                  home_team_id: team1?.id,
                  away_team_id: team2?.id,
                });
              }}
            >
              Create
            </Button>
          )}
          {matchData?.id && matchData.status === 'scheduled' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteMatch(matchData.id);
              }}
            >
              Delete
            </Button>
          )}
          {matchData?.id && matchData.status !== 'scheduled' && (
            <span className="text-xs text-gray-500 italic">Created</span>
          )}
        </TableCell>
      </TableRow>
    );
  };

  const getDisplayableMatchups = () => {
    const createdMatchNumbers = knockoutMatches.map(m => m.match_number);
    let displayable = allKnockoutStages.filter(m => createdMatchNumbers.includes(m.id));

    const stages = ['Round of 32', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Third Place', 'Final'];
    for (const stage of stages) {
      const stageMatchups = allKnockoutStages.filter(m => m.stage === stage);
      const createdInStage = stageMatchups.filter(m => createdMatchNumbers.includes(m.id));
      
      if (createdInStage.length < stageMatchups.length) {
        // This is the next stage to create matches for
        const newMatchups = stageMatchups.filter(m => !createdMatchNumbers.includes(m.id));
        displayable = [...displayable, ...newMatchups];
        break; // Stop after adding the next stage
      }
    }
    return displayable;
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
            Knockout Matches
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
                  <TableHead className="font-bold text-[var(--text-primary)]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getDisplayableMatchups().map((matchup) => {
                  // For R32 matchups, ensure we use the version with resolved third places
                  if (matchup.stage === 'Round of 32') {
                    const resolvedMatchup = resolvedRound32Matchups.find(m => m.id === matchup.id);
                    return renderMatchRow(resolvedMatchup || matchup);
                  }
                  return renderMatchRow(matchup);
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