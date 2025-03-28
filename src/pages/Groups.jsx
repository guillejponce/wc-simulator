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
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="header-gradient mb-6 md:mb-8 p-4 md:p-6">
        <h1 className="text-2xl md:text-4xl font-bold flex flex-col md:flex-row items-center gap-2 md:gap-3">
          <Flag className="w-6 h-6 md:w-8 md:h-8" />
          <span>FIFA World Cup 2026™</span>
        </h1>
        <p className="text-lg md:text-xl opacity-90 mt-2 text-center md:text-left">Group Stage</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {groups.map((group) => (
          <div key={group.name} className="group-card">
            <div className="card-header-metallic p-3 md:p-4 border-b border-[var(--border-color)]">
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-heading)]">Group {group.name}</h2>
            </div>
            <div className="p-2 md:p-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="table-header">
                    <TableHead className="w-[30px] md:w-[40px] text-[var(--text-primary)]">Pos</TableHead>
                    <TableHead className="text-[var(--text-primary)]">Team</TableHead>
                    <TableHead className="w-[30px] md:w-[40px] text-[var(--text-primary)]">P</TableHead>
                    <TableHead className="w-[30px] md:w-[40px] text-[var(--text-primary)]">Pts</TableHead>
                    <TableHead className="hidden md:table-cell w-[40px] text-[var(--text-primary)]">W</TableHead>
                    <TableHead className="hidden md:table-cell w-[40px] text-[var(--text-primary)]">D</TableHead>
                    <TableHead className="hidden md:table-cell w-[40px] text-[var(--text-primary)]">L</TableHead>
                    <TableHead className="hidden md:table-cell w-[40px] text-[var(--text-primary)]">GF</TableHead>
                    <TableHead className="hidden md:table-cell w-[40px] text-[var(--text-primary)]">GA</TableHead>
                    <TableHead className="hidden md:table-cell w-[40px] text-[var(--text-primary)]">GD</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.teams.map((team, index) => (
                    <TableRow 
                      key={team?.id || `empty-${index}`}
                      className={index < 2 ? 'bg-[rgba(91,138,182,0.1)]' : ''}
                    >
                      <TableCell className="font-medium text-[var(--text-primary)]">{index + 1}</TableCell>
                      <TableCell>
                        {team ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={team.flag_url || `https://flagcdn.com/w20/${team.code.toLowerCase()}.png`}
                              alt={`${team.name} flag`}
                              className="w-5 h-4 md:w-6 md:h-4 object-cover rounded shadow-sm"
                            />
                            <span className="font-medium text-[var(--text-primary)] text-sm md:text-base truncate">{team.name}</span>
                          </div>
                        ) : (
                          <span className="text-[var(--text-primary)] opacity-60">TBD</span>
                        )}
                      </TableCell>
                      <TableCell className="text-[var(--text-primary)]">{team?.played || 0}</TableCell>
                      <TableCell>
                        <span className="badge text-[var(--text-primary)] font-medium text-sm md:text-base py-1 px-2 md:px-3">{team?.points || 0}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-[var(--text-primary)]">{team?.won || 0}</TableCell>
                      <TableCell className="hidden md:table-cell text-[var(--text-primary)]">{team?.drawn || 0}</TableCell>
                      <TableCell className="hidden md:table-cell text-[var(--text-primary)]">{team?.lost || 0}</TableCell>
                      <TableCell className="hidden md:table-cell text-[var(--text-primary)]">{team?.goalsFor || 0}</TableCell>
                      <TableCell className="hidden md:table-cell text-[var(--text-primary)]">{team?.goalsAgainst || 0}</TableCell>
                      <TableCell className="hidden md:table-cell text-[var(--text-primary)]">{team?.goalDifference || team ? (team.goalsFor || 0) - (team.goalsAgainst || 0) : 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Groups; 