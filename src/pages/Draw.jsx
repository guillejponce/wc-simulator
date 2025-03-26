import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Badge, Progress, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Select } from '../components/ui';
import { Trophy, Users, Target, Award, Flag, Shuffle } from 'lucide-react';
import { teamService } from '../services/teamService';

function Draw() {
  const [drawStatus, setDrawStatus] = useState('setup'); // setup, in_progress, completed
  const [currentPot, setCurrentPot] = useState(1);
  const [drawnTeams, setDrawnTeams] = useState([]);
  const [groups, setGroups] = useState(Array(12).fill().map(() => ({ teams: Array(4).fill(null) })));
  const [pots, setPots] = useState({ 1: [], 2: [], 3: [], 4: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);

  useEffect(() => {
    const initializeDraw = async () => {
      try {
        setLoading(true);
        
        // Initialize groups in the database
        await teamService.initializeGroups();

        // Get all qualified teams
        const teams = await teamService.getTeams();
        const qualifiedTeams = teams.filter(team => team.qualified);

        // Separate host nations
        const hostNations = qualifiedTeams.filter(team => 
          ['USA', 'CAN', 'MEX'].includes(team.code)
        );

        // Sort remaining teams by FIFA ranking
        const remainingTeams = qualifiedTeams
          .filter(team => !['USA', 'CAN', 'MEX'].includes(team.code))
          .sort((a, b) => a.fifa_ranking - b.fifa_ranking);

        // Calculate how many top-ranked teams to add to Pot 1
        const topTeamsForPot1 = 12 - hostNations.length;

        // Distribute teams into pots (12 teams per pot)
        const newPots = {
          1: [...hostNations, ...remainingTeams.slice(0, topTeamsForPot1)],
          2: remainingTeams.slice(topTeamsForPot1, topTeamsForPot1 + 12),
          3: remainingTeams.slice(topTeamsForPot1 + 12, topTeamsForPot1 + 24),
          4: remainingTeams.slice(topTeamsForPot1 + 24, topTeamsForPot1 + 36)
        };

        setPots(newPots);

        // Load existing group assignments
        const assignments = await teamService.getGroupAssignments();
        
        // Update groups with existing assignments
        const newGroups = Array(12).fill().map(() => ({ teams: Array(4).fill(null) }));
        assignments.forEach(assignment => {
          const groupIndex = assignment.group.letter.charCodeAt(0) - 65;
          const positionIndex = assignment.position - 1;
          newGroups[groupIndex].teams[positionIndex] = assignment.team;
        });

        setGroups(newGroups);

        // Update drawn teams
        setDrawnTeams(assignments.map(a => a.team));
      } catch (err) {
        setError('Failed to initialize draw. Please try again.');
        console.error('Error initializing draw:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeDraw();
  }, []);

  const handleStartDraw = async () => {
    try {
      setLoading(true);
      // Clear all existing assignments
      const assignments = await teamService.getGroupAssignments();
      await Promise.all(
        assignments.map(assignment => 
          teamService.saveGroupAssignment(assignment.team_id, assignment.group.letter, null)
        )
      );

      setDrawStatus('in_progress');
      setDrawnTeams([]);
      setGroups(Array(12).fill().map(() => ({ teams: Array(4).fill(null) })));
    } catch (err) {
      setError('Failed to start new draw. Please try again.');
      console.error('Error starting new draw:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeam = async (groupIndex, positionIndex, teamId) => {
    try {
      // Find the team in any pot
      const team = Object.values(pots).flat().find(t => t.id === teamId);
      if (!team) return;

      // Check if team is already assigned
      const isTeamAssigned = groups.some(group => 
        group.teams.some(t => t && t.id === teamId)
      );

      if (isTeamAssigned) {
        setError('This team has already been assigned to a group');
        return;
      }

      // Check confederation restrictions
      const groupTeams = groups[groupIndex].teams;
      const hasSameConfederation = groupTeams.some(t => 
        t && t.region === team.region
      );

      if (hasSameConfederation) {
        setError('Teams from the same confederation cannot be in the same group');
        return;
      }

      // Save the group assignment to the database
      const groupLetter = String.fromCharCode(65 + groupIndex);
      await teamService.saveGroupAssignment(teamId, groupLetter, positionIndex + 1);

      // Update groups with the selected team
      setGroups(prev => {
        const newGroups = [...prev];
        newGroups[groupIndex].teams[positionIndex] = team;
        return newGroups;
      });

      // Add team to drawn teams if not already there
      if (!drawnTeams.some(t => t.id === team.id)) {
        setDrawnTeams(prev => [...prev, team]);
      }

      setError(null);
    } catch (err) {
      console.error('Error assigning team:', err);
      setError('Failed to save team assignment. Please try again.');
    }
  };

  const handleRemoveTeam = async (groupIndex, positionIndex) => {
    try {
      const team = groups[groupIndex].teams[positionIndex];
      if (!team) return;

      // Remove the group assignment from the database
      const groupLetter = String.fromCharCode(65 + groupIndex);
      await teamService.saveGroupAssignment(team.id, groupLetter, null);

      // Remove team from drawn teams
      setDrawnTeams(prev => prev.filter(t => t.id !== team.id));

      // Update groups
      setGroups(prev => {
        const newGroups = [...prev];
        newGroups[groupIndex].teams[positionIndex] = null;
        return newGroups;
      });

      setError(null);
    } catch (err) {
      console.error('Error removing team:', err);
      setError('Failed to remove team. Please try again.');
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-blue-600" />
              Group Draw
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Draw Progress</span>
                <span className="font-medium">
                  {drawnTeams.length}/48 Teams
                </span>
              </div>
              <Progress value={(drawnTeams.length / 48) * 100} />
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleStartDraw}
              disabled={drawStatus === 'in_progress'}
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Start New Draw
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Pots Display */}
      <Card>
        <CardHeader>
          <CardTitle>Draw Pots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(pots).map(([potNumber, teams]) => (
              <div key={potNumber} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Pot {potNumber}</h3>
                <div className="space-y-2">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className={`flex items-center justify-between p-2 rounded ${
                        drawnTeams.some(drawnTeam => drawnTeam.id === team.id)
                          ? 'bg-gray-200'
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={team.flag_url || `https://flagcdn.com/w20/${team.code.toLowerCase()}.png`}
                          alt={`${team.name} flag`}
                          className="w-6 h-4 object-cover rounded"
                        />
                        <span className="font-medium">{team.name}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`border-${getConfederationColor(team.region)}-200 text-${getConfederationColor(team.region)}-800`}
                      >
                        {team.region}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group, groupIndex) => (
          <Card key={groupIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-blue-600" />
                Group {String.fromCharCode(65 + groupIndex)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {group.teams.map((team, positionIndex) => (
                  <div
                    key={positionIndex}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    {team ? (
                      <>
                        <div className="flex items-center gap-2">
                          <img
                            src={team.flag_url || `https://flagcdn.com/w20/${team.code.toLowerCase()}.png`}
                            alt={`${team.name} flag`}
                            className="w-6 h-4 object-cover rounded"
                          />
                          <span className="font-medium">{team.name}</span>
                          <Badge
                            variant="outline"
                            className={`border-${getConfederationColor(team.region)}-200 text-${getConfederationColor(team.region)}-800`}
                          >
                            {team.region}
                          </Badge>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveTeam(groupIndex, positionIndex)}
                        >
                          Remove
                        </Button>
                      </>
                    ) : (
                      <Select
                        onChange={(e) => handleAssignTeam(groupIndex, positionIndex, e.target.value)}
                        className="w-full"
                      >
                        <option value="">Select a team</option>
                        {Object.values(pots)
                          .flat()
                          .filter(t => !drawnTeams.some(dt => dt.id === t.id))
                          .map(team => {
                            // Find which pot this team belongs to
                            const potNumber = Object.entries(pots).find(([_, teams]) => 
                              teams.some(t => t.id === team.id)
                            )?.[0];
                            return (
                              <option key={team.id} value={team.id}>
                                {team.name} (Pot {potNumber})
                              </option>
                            );
                          })}
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Draw Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Draw Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Pot 1 contains the host nations (USA, Canada, Mexico) plus highest-ranked teams
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Pots 2-4 are determined by FIFA rankings
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Each group will contain 4 teams
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Teams from the same confederation cannot be drawn into the same group
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default Draw; 