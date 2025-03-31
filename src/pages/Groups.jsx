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
        // Get group assignments first to create the group structure
        const assignments = await teamService.getGroupAssignments();
        
        // Transform assignments into groups structure
        const groupsMap = {};
        assignments.forEach(assignment => {
          const groupLetter = assignment.group.letter;
          if (!groupsMap[groupLetter]) {
            groupsMap[groupLetter] = {
              id: assignment.group.id,
              name: groupLetter,
              teams: Array(4).fill(null)
            };
          }
          
          // Create a basic team record at the appropriate position
          const teamIndex = assignment.position - 1;
          if (teamIndex >= 0 && teamIndex < 4) {
            groupsMap[groupLetter].teams[teamIndex] = {
              id: assignment.team.id,
              name: assignment.team.name,
              code: assignment.team.code,
              flag_url: assignment.team.flag_url,
              region: assignment.team.region,
              // Default stats (will be updated later)
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              points: 0,
              position: assignment.position
            };
          }
        });

        // Now fetch team_group records to get actual standings
        const { data: teamGroupRecords, error: teamGroupError } = await supabase
          .from('team_group')
          .select('*, team:team_id(id, name, code, flag_url, region)');
        
        if (teamGroupError) {
          console.error('Error fetching team group records:', teamGroupError);
          throw teamGroupError;
        }

        // Update teams with standings data
        if (teamGroupRecords?.length > 0) {
          for (const record of teamGroupRecords) {
            // Find the group this record belongs to
            for (const groupKey in groupsMap) {
              const group = groupsMap[groupKey];
              if (group.id === record.group_id) {
                // Find the team in this group
                const teamIndex = group.teams.findIndex(team => 
                  team && team.id === record.team_id
                );
                
                if (teamIndex >= 0) {
                  // Update team stats
                  group.teams[teamIndex] = {
                    ...group.teams[teamIndex],
                    played: record.played || 0,
                    won: record.won || 0,
                    drawn: record.drawn || 0, 
                    lost: record.lost || 0,
                    goalsFor: record.goals_for || 0,
                    goalsAgainst: record.goals_against || 0,
                    goalDifference: record.goal_difference || 0,
                    points: record.points || 0,
                    position: record.position || teamIndex + 1
                  };
                }
                break;
              }
            }
          }
        }

        // Sort teams in each group by position
        for (const groupKey in groupsMap) {
          const group = groupsMap[groupKey];
          // Sort by position (keeping null values at the end)
          group.teams.sort((a, b) => {
            if (!a) return 1;
            if (!b) return -1;
            return (a.position || 999) - (b.position || 999);
          });
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
                            <span className="text-[var(--text-primary)] opacity-60 text-xs sm:text-sm">TBD</span>
                          )}
                        </TableCell>
                        <TableCell className="text-[var(--text-primary)] text-xs sm:text-sm py-2">{team?.played || 0}</TableCell>
                        <TableCell className="py-2">
                          <span className="inline-flex items-center justify-center min-w-[24px] h-6 bg-[var(--wc-blue)] text-white rounded text-xs sm:text-sm font-medium px-1.5">
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
                            'text-gray-600'
                          }`}>
                            {team?.goalDifference || team ? (team.goalsFor || 0) - (team.goalsAgainst || 0) : 0}
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