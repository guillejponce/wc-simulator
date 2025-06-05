import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Badge } from '../components/ui';
import { Flag, Loader2 } from 'lucide-react';
import { teamService } from '../services/teamService';
import { supabase } from '../supabase';
import '../assets/styles/theme.css';

function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);

        // Fetch all groups from the database
        const { data: groupsData, error: groupsError } = await supabase
          .from('group')
          .select('*')
          .order('name');

        if (groupsError) {
          console.error('Error fetching groups:', groupsError);
          throw groupsError;
        }

        // Fetch all team_group records with team information
        const { data: teamGroupRecords, error: teamGroupError } = await supabase
          .from('team_group')
          .select(`
            *,
            team:team_id(id, name, code, flag_url, region)
          `)
          .order('group_id')
          .order('position');
        
        if (teamGroupError) {
          console.error('Error fetching team group records:', teamGroupError);
          throw teamGroupError;
        }

        // Create groups map to organize teams by group
        const groupsMap = {};
        
        // Initialize groups
        groupsData.forEach(group => {
          groupsMap[group.id] = {
            id: group.id,
            name: group.name,
            teams: []
          };

          // Add teams based on their assigned positions in the group table
          for (let i = 1; i <= 4; i++) {
            const teamId = group[`team${i}_id`];
            if (teamId) {
              // Find the team's stats if they exist
              const teamStats = teamGroupRecords.find(record => 
                record.team_id === teamId && record.group_id === group.id
              );

              if (teamStats) {
                // Team has played matches and has stats
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
                  position: teamStats.position || i
                });
              } else {
                // Team is assigned but has no match stats yet
                // We need to fetch the team details separately
                const fetchTeamDetails = async (teamId) => {
                  const { data: teamData, error: teamError } = await supabase
                    .from('team')
                    .select('*')
                    .eq('id', teamId)
                    .single();
                  
                  if (teamError) {
                    console.error('Error fetching team details:', teamError);
                    return null;
                  }
                  
                  return teamData;
                };

                // We'll handle this in a second pass to avoid async issues in the loop
                groupsMap[group.id].teams.push({
                  id: teamId,
                  position: i,
                  isPlaceholder: true // Mark for later processing
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
                  position: team.position
                };
              }
            }
          }
        }

        // Sort teams within each group by standings (position for teams with stats, then by initial position)
        for (const groupId in groupsMap) {
          const group = groupsMap[groupId];
          group.teams.sort((a, b) => {
            // Handle null teams
            if (!a && !b) return 0;
            if (!a) return 1;
            if (!b) return -1;
            
            // Teams with match stats should be sorted by their calculated position
            if (a.played > 0 || b.played > 0) {
              // Sort by points (desc), then goal difference (desc), then goals for (desc)
              if (a.points !== b.points) {
                return b.points - a.points;
              }
              if (a.goalDifference !== b.goalDifference) {
                return b.goalDifference - a.goalDifference;
              }
              if (a.goalsFor !== b.goalsFor) {
                return b.goalsFor - a.goalsFor;
              }
              // If all stats are equal, sort by name
              return a.name.localeCompare(b.name);
            }
            // For teams without matches, sort by their initial position
            return a.position - b.position;
          });

          // Ensure we have exactly 4 slots (fill with null if needed)
          while (group.teams.length < 4) {
            group.teams.push(null);
          }
          // Truncate if we somehow have more than 4
          group.teams = group.teams.slice(0, 4);
        }

        // Convert to array and sort by group name
        const groupsArray = Object.values(groupsMap).sort((a, b) => 
          a.name.localeCompare(b.name)
        );

        setGroups(groupsArray);
      } catch (err) {
        console.error('Error fetching groups:', err);
        setError('Failed to load groups. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [refreshKey]);

  const refreshGroups = () => {
    setRefreshKey(Date.now());
  };

  const getConfederationColor = (confederation) => {
    const colors = {
      UEFA: 'blue',
      CONMEBOL: 'green',
      CONCACAF: 'red',
      CAF: 'yellow',
      AFC: 'purple',
      OFC: 'orange',
      PLAYOFF: 'gray',
    };
    return colors[confederation] || 'gray';
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
          <Flag className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
          <span>FIFA World Cup 2026™</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl opacity-90 mt-2 text-center md:text-left">Group Stage</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {groups.map((group) => (
          <div key={group.name} className="group-card bg-white rounded-lg shadow-sm border border-[var(--border-color)]">
            <div className="card-header-metallic p-2 sm:p-3 md:p-4 border-b border-[var(--border-color)]">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--text-heading)]">Group {group.name}</h2>
            </div>
            <div className="p-2 sm:p-3 md:p-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="table-header bg-gray-50">
                      <TableHead className="w-[30px] text-[var(--text-primary)] text-xs sm:text-sm font-semibold">Pos</TableHead>
                      <TableHead className="text-[var(--text-primary)] text-xs sm:text-sm font-semibold">Team</TableHead>
                      <TableHead className="w-[30px] text-[var(--text-primary)] text-xs sm:text-sm font-semibold">P</TableHead>
                      <TableHead className="w-[30px] text-[var(--text-primary)] text-xs sm:text-sm font-semibold">Pts</TableHead>
                      <TableHead className="hidden sm:table-cell w-[30px] text-[var(--text-primary)] text-xs sm:text-sm font-semibold">W</TableHead>
                      <TableHead className="hidden sm:table-cell w-[30px] text-[var(--text-primary)] text-xs sm:text-sm font-semibold">D</TableHead>
                      <TableHead className="hidden sm:table-cell w-[30px] text-[var(--text-primary)] text-xs sm:text-sm font-semibold">L</TableHead>
                      <TableHead className="hidden md:table-cell w-[30px] text-[var(--text-primary)] text-xs sm:text-sm font-semibold">GF</TableHead>
                      <TableHead className="hidden md:table-cell w-[30px] text-[var(--text-primary)] text-xs sm:text-sm font-semibold">GA</TableHead>
                      <TableHead className="w-[30px] text-[var(--text-primary)] text-xs sm:text-sm font-semibold">GD</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.teams.map((team, index) => (
                      <TableRow 
                        key={team?.id || `empty-${index}`}
                        className={`border-b last:border-0 ${
                          index < 2 ? 'bg-[rgba(91,138,182,0.05)]' : ''
                        }`}
                      >
                        <TableCell className="font-medium text-[var(--text-primary)] text-xs sm:text-sm py-2">
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${
                            index < 2 ? 'bg-[var(--wc-blue)] text-white' : 'bg-gray-100'
                          }`}>
                            {index + 1}
                          </span>
                        </TableCell>
                        <TableCell className="py-2">
                          {team ? (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <img
                                src={team.flag_url || `https://flagcdn.com/w20/${team.code.toLowerCase()}.png`}
                                alt={`${team.name} flag`}
                                className="w-4 h-3 sm:w-5 sm:h-4 md:w-6 md:h-4 object-cover rounded shadow-sm"
                              />
                              <span className="font-medium text-[var(--text-primary)] text-xs sm:text-sm md:text-base truncate">{team.name}</span>
                            </div>
                          ) : (
                            <span className="text-[var(--text-secondary)] opacity-60 text-xs sm:text-sm">TBD</span>
                          )}
                        </TableCell>
                        <TableCell className="text-[var(--text-primary)] text-xs sm:text-sm py-2">{team?.played || 0}</TableCell>
                        <TableCell className="py-2">
                          <span className="inline-flex items-center justify-center min-w-[24px] h-6 bg-[var(--wc-blue)] text-[var(--text-on-color)] rounded text-xs sm:text-sm font-medium px-1.5">
                            {team?.points || 0}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-[var(--text-primary)] text-xs sm:text-sm py-2">{team?.won || 0}</TableCell>
                        <TableCell className="hidden sm:table-cell text-[var(--text-primary)] text-xs sm:text-sm py-2">{team?.drawn || 0}</TableCell>
                        <TableCell className="hidden sm:table-cell text-[var(--text-primary)] text-xs sm:text-sm py-2">{team?.lost || 0}</TableCell>
                        <TableCell className="hidden md:table-cell text-[var(--text-primary)] text-xs sm:text-sm py-2">{team?.goalsFor || 0}</TableCell>
                        <TableCell className="hidden md:table-cell text-[var(--text-primary)] text-xs sm:text-sm py-2">{team?.goalsAgainst || 0}</TableCell>
                        <TableCell className="text-[var(--text-primary)] text-xs sm:text-sm py-2">
                          <span className={`font-medium ${
                            (team?.goalDifference || 0) > 0 ? 'text-green-600' : 
                            (team?.goalDifference || 0) < 0 ? 'text-red-600' : 
                            'text-[var(--text-secondary)]'
                          }`}>
                            {team?.goalDifference || 0}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Groups; 