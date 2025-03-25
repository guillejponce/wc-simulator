import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Badge, Progress } from '../components/ui';
import { Trophy, Users, Target, Award, Flag, Shuffle } from 'lucide-react';

function Draw() {
  const [drawStatus, setDrawStatus] = useState('setup'); // setup, in_progress, completed
  const [currentPot, setCurrentPot] = useState(1);
  const [drawnTeams, setDrawnTeams] = useState([]);
  const [groups, setGroups] = useState(Array(16).fill().map(() => ({ teams: [] })));

  const handleStartDraw = () => {
    setDrawStatus('in_progress');
    setCurrentPot(1);
    setDrawnTeams([]);
    setGroups(Array(16).fill().map(() => ({ teams: [] })));
  };

  const handleDrawTeam = () => {
    // This will be implemented when we have real data
    console.log('Drawing next team...');
  };

  const getConfederationColor = (confederation) => {
    const colors = {
      UEFA: 'blue',
      CONMEBOL: 'green',
      CONCACAF: 'red',
      CAF: 'yellow',
      AFC: 'purple',
      OFC: 'orange',
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Current Pot</div>
                  <div className="font-medium">Pot {currentPot}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Teams Drawn</div>
                  <div className="font-medium">{drawnTeams.length}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="font-medium capitalize">{drawStatus.replace('_', ' ')}</div>
                </div>
              </div>
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
            <Button
              onClick={handleDrawTeam}
              disabled={drawStatus !== 'in_progress' || drawnTeams.length === 48}
            >
              <Target className="w-4 h-4 mr-2" />
              Draw Next Team
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {groups.map((group, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-blue-600" />
                Group {String.fromCharCode(65 + index)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {group.teams.length === 0 ? (
                  <div className="text-sm text-gray-500 italic">
                    No teams drawn yet
                  </div>
                ) : (
                  group.teams.map((team, teamIndex) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium">{team.name}</span>
                      <Badge
                        variant="outline"
                        className={`border-${getConfederationColor(team.confederation)}-200 text-${getConfederationColor(team.confederation)}-800`}
                      >
                        {team.confederation}
                      </Badge>
                    </div>
                  ))
                )}
                {group.teams.length < 3 && (
                  <div className="text-sm text-gray-500 italic">
                    {3 - group.teams.length} team{3 - group.teams.length !== 1 ? 's' : ''} remaining
                  </div>
                )}
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
              Teams are drawn from 4 pots based on FIFA rankings
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Each group will contain 3 teams
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Teams from the same confederation cannot be drawn into the same group
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Host nations (USA, Canada, Mexico) are automatically assigned to specific groups
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default Draw; 