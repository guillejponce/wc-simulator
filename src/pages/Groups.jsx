import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Badge } from '../components/ui';
import { Flag, Loader2 } from 'lucide-react';
import { teamService } from '../services/teamService';

function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const assignments = await teamService.getGroupAssignments();
        
        // Transform assignments into groups structure
        const groupsMap = {};
        assignments.forEach(assignment => {
          const groupLetter = assignment.group.letter;
          if (!groupsMap[groupLetter]) {
            groupsMap[groupLetter] = {
              name: groupLetter,
              teams: Array(4).fill(null)
            };
          }
          groupsMap[groupLetter].teams[assignment.position - 1] = {
            id: assignment.team.id,
            name: assignment.team.name,
            code: assignment.team.code,
            flag_url: assignment.team.flag_url,
            region: assignment.team.region,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0
          };
        });

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
  }, []);

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
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5" />
            Group Stage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card key={group.name}>
                <CardHeader>
                  <CardTitle>Group {group.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">Pos</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead className="w-[40px]">P</TableHead>
                        <TableHead className="w-[40px]">W</TableHead>
                        <TableHead className="w-[40px]">D</TableHead>
                        <TableHead className="w-[40px]">L</TableHead>
                        <TableHead className="w-[40px]">GF</TableHead>
                        <TableHead className="w-[40px]">GA</TableHead>
                        <TableHead className="w-[40px]">GD</TableHead>
                        <TableHead className="w-[40px]">Pts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.teams.map((team, index) => (
                        <TableRow key={team?.id || `empty-${index}`}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            {team ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={team.flag_url || `https://flagcdn.com/w20/${team.code.toLowerCase()}.png`}
                                  alt={`${team.name} flag`}
                                  className="w-6 h-4 object-cover rounded"
                                />
                                {team.name}
                              </div>
                            ) : (
                              <span className="text-gray-400">TBD</span>
                            )}
                          </TableCell>
                          <TableCell>{team?.played || 0}</TableCell>
                          <TableCell>{team?.won || 0}</TableCell>
                          <TableCell>{team?.drawn || 0}</TableCell>
                          <TableCell>{team?.lost || 0}</TableCell>
                          <TableCell>{team?.goalsFor || 0}</TableCell>
                          <TableCell>{team?.goalsAgainst || 0}</TableCell>
                          <TableCell>{team ? team.goalsFor - team.goalsAgainst : 0}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{team?.points || 0}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Groups; 