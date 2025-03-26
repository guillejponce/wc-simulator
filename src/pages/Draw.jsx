import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Badge, Progress, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Select } from '../components/ui';
import { Trophy, Users, Target, Award, Flag, Shuffle } from 'lucide-react';
import { teamService } from '../services/teamService';
import '../assets/styles/theme.css';

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
      <div className="header-gradient">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Trophy className="w-8 h-8" />
          Group Draw
        </h1>
        <p className="text-xl opacity-90 mt-2">Draw teams into groups for the FIFA World Cup 2026™</p>
      </div>

      {/* Draw Progress */}
      <div className="card p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-primary)]">Draw Progress</span>
            <span className="font-medium text-[var(--text-primary)]">
              {drawnTeams.length}/48 Teams
            </span>
          </div>
          <div className="h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--wc-red)] to-[var(--wc-blue)]"
              style={{ width: `${(drawnTeams.length / 48) * 100}%` }}
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 text-[var(--wc-red)] rounded-lg text-sm font-medium">
              {error}
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleStartDraw}
            disabled={drawStatus === 'in_progress'}
            className="button-primary flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Start New Draw
          </button>
        </div>
      </div>

      {/* Pots Display */}
      <div className="card">
        <div className="p-6 border-b border-[var(--border-color)]">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Draw Pots</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(pots).map(([potNumber, teams]) => (
              <div key={potNumber} className="card bg-[var(--background-secondary)]">
                <div className="p-4">
                  <h3 className="font-semibold mb-2 text-[var(--text-primary)]">Pot {potNumber}</h3>
                  <div className="space-y-2">
                    {teams.map((team) => (
                      <div
                        key={team.id}
                        className={`flex items-center justify-between p-2 rounded ${
                          drawnTeams.some(drawnTeam => drawnTeam.id === team.id)
                            ? 'opacity-50 bg-[var(--background-secondary)]'
                            : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={team.flag_url || `https://flagcdn.com/w20/${team.code.toLowerCase()}.png`}
                            alt={`${team.name} flag`}
                            className="w-6 h-4 object-cover rounded shadow-sm"
                          />
                          <span className="font-medium text-[var(--text-primary)]">{team.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className="group-card">
            <div className="p-4 border-b border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Group {String.fromCharCode(65 + groupIndex)}</h2>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {group.teams.map((team, positionIndex) => (
                  <div
                    key={positionIndex}
                    className="flex items-center justify-between p-2 bg-[var(--background-secondary)] rounded"
                  >
                    {team ? (
                      <>
                        <div className="flex items-center gap-2">
                          <img
                            src={team.flag_url || `https://flagcdn.com/w20/${team.code.toLowerCase()}.png`}
                            alt={`${team.name} flag`}
                            className="w-6 h-4 object-cover rounded shadow-sm"
                          />
                          <span className="font-medium text-[var(--text-primary)]">{team.name}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveTeam(groupIndex, positionIndex)}
                          className="px-3 py-1 text-sm bg-[var(--wc-red)] text-white rounded hover:opacity-90 transition-opacity"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <Select
                        onChange={(e) => handleAssignTeam(groupIndex, positionIndex, e.target.value)}
                        className="w-full text-[var(--text-primary)]"
                      >
                        <option value="" className="text-[var(--text-primary)]">Select a team</option>
                        {Object.values(pots)
                          .flat()
                          .filter(t => !drawnTeams.some(dt => dt.id === t.id))
                          .map(team => {
                            const potNumber = Object.entries(pots).find(([_, teams]) => 
                              teams.some(t => t.id === team.id)
                            )?.[0];
                            return (
                              <option key={team.id} value={team.id} className="text-[var(--text-primary)]">
                                {team.name} (Pot {potNumber})
                              </option>
                            );
                          })}
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Draw Rules */}
      <div className="card">
        <div className="p-6 border-b border-[var(--border-color)]">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Draw Rules</h2>
        </div>
        <div className="p-6">
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-[var(--text-primary)]">
              <span className="w-2 h-2 bg-[var(--wc-blue)] rounded-full"></span>
              Pot 1 contains the host nations (USA, Canada, Mexico) plus highest-ranked teams
            </li>
            <li className="flex items-center gap-2 text-[var(--text-primary)]">
              <span className="w-2 h-2 bg-[var(--wc-blue)] rounded-full"></span>
              Pots 2-4 are determined by FIFA rankings
            </li>
            <li className="flex items-center gap-2 text-[var(--text-primary)]">
              <span className="w-2 h-2 bg-[var(--wc-blue)] rounded-full"></span>
              Each group will contain 4 teams
            </li>
            <li className="flex items-center gap-2 text-[var(--text-primary)]">
              <span className="w-2 h-2 bg-[var(--wc-blue)] rounded-full"></span>
              Teams from the same confederation cannot be drawn into the same group
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Draw; 