import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from './ui';
import { Users, Award, User } from 'lucide-react';
import '../assets/styles/LineupEditor.css';

function LineupViewer({ lineup, team }) {
  if (!lineup || !lineup.lineup_players || lineup.lineup_players.length === 0) {
    return (
      <div className="no-lineup-message">
        <div className="no-lineup-icon">
          <Users size={48} />
        </div>
        <h3 className="text-lg font-medium text-gray-700">No Lineup Available</h3>
        <p className="text-sm text-gray-600 mt-2">
          The lineup for this team has not been set yet.
        </p>
      </div>
    );
  }

  // Group players by position type for organized display
  const playersByPosition = lineup.lineup_players.reduce((acc, lp) => {
    // Get the general position type from the specific position
    let positionType;
    
    if (lp.position === 'GK') {
      positionType = 'Goalkeeper';
    } else if (['LB', 'CB', 'RB', 'LWB', 'RWB'].includes(lp.position)) {
      positionType = 'Defenders';
    } else if (['CDM', 'CM', 'LM', 'RM', 'CAM', 'LAM', 'RAM'].includes(lp.position)) {
      positionType = 'Midfielders';
    } else {
      positionType = 'Forwards';
    }
    
    if (!acc[positionType]) {
      acc[positionType] = [];
    }
    
    acc[positionType].push(lp);
    return acc;
  }, {});

  // Position display names
  const positionNames = {
    'GK': 'Goalkeeper',
    'LB': 'Left Back',
    'CB': 'Center Back',
    'RB': 'Right Back',
    'LWB': 'Left Wing Back',
    'RWB': 'Right Wing Back',
    'CDM': 'Defensive Midfielder',
    'CM': 'Central Midfielder',
    'LM': 'Left Midfielder',
    'RM': 'Right Midfielder',
    'CAM': 'Attacking Midfielder',
    'LAM': 'Left Attacking Mid',
    'RAM': 'Right Attacking Mid',
    'LW': 'Left Winger',
    'RW': 'Right Winger',
    'ST': 'Striker'
  };

  // Order of positions for display
  const positionOrder = ['Goalkeeper', 'Defenders', 'Midfielders', 'Forwards'];
  
  // Position colors for visual distinction
  const positionColors = {
    'Goalkeeper': 'bg-yellow-100 border-yellow-300 text-yellow-800',
    'Defenders': 'bg-blue-100 border-blue-300 text-blue-800',
    'Midfielders': 'bg-green-100 border-green-300 text-green-800',
    'Forwards': 'bg-red-100 border-red-300 text-red-800'
  };

  return (
    <div className="lineup-viewer">
      <Card className="shadow-md border border-gray-200">
        <CardHeader className="card-header-metallic border-b">
          <div className="lineup-team-header">
            {team?.flag_url && (
              <img
                src={team.flag_url}
                alt={team.name}
                className="lineup-team-flag"
              />
            )}
            <CardTitle className="text-lg font-semibold text-black">
              {team?.name || 'Team'} Lineup
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 bg-white">
          <div className="lineup-formation mb-4 bg-gray-50 py-2 rounded-md border border-gray-200">
            Formation: <span className="font-bold text-blue-700">{lineup.formation}</span>
          </div>
          
          {positionOrder.map(positionType => {
            if (!playersByPosition[positionType]) return null;
            
            return (
              <div key={positionType} className="lineup-section">
                <h4 className={`px-2 py-1 rounded ${positionColors[positionType]} inline-block`}>
                  {positionType} ({playersByPosition[positionType].length})
                </h4>
                <div className="space-y-2 mt-2">
                  {playersByPosition[positionType].map(lp => (
                    <div key={lp.id} className="player-row flex items-center bg-gray-50 rounded-md border border-gray-100 p-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {lp.shirt_number || lp.player?.number || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-black flex items-center">
                          {lp.player?.name || 'Unknown Player'}
                          {lp.is_captain && (
                            <span className="lineup-captain">
                              <Award size={12} /> Captain
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {positionNames[lp.position] || lp.position}
                          {lp.player?.club && ` • ${lp.player.club}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export default LineupViewer; 