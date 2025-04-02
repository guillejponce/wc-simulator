import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui';
import { Users } from 'lucide-react';
import { playerService } from '../services/playerService';

function LineupViewer({ lineup, team }) {
  const [allTeamPlayers, setAllTeamPlayers] = useState([]);

  useEffect(() => {
    const loadTeamPlayers = async () => {
      if (team?.id) {
        const players = await playerService.getPlayersByTeam(team.id);
        setAllTeamPlayers(players || []);
      }
    };
    loadTeamPlayers();
  }, [team?.id]);

  if (!lineup || !lineup.lineup_players || lineup.lineup_players.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">No lineup available</p>
      </div>
    );
  }

  // Group players by position type for organized display
  const playersByPosition = lineup.lineup_players.reduce((acc, lp) => {
    // Get the general position type from the specific position
    let positionType;
    
    if (lp.position === 'GK') {
      positionType = 'Goalkeeper';
    } else if (['LB', 'CB', 'RB', 'LWB', 'RWB'].includes(lp.position.replace(/[0-9]/g, ''))) {
      positionType = 'Defenders';
    } else if (['CDM', 'CM', 'LM', 'RM', 'CAM', 'LAM', 'RAM'].includes(lp.position.replace(/[0-9]/g, ''))) {
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

  // Order of positions for display
  const positionOrder = ['Goalkeeper', 'Defenders', 'Midfielders', 'Forwards'];

  // Get bench players (all team players that are not in the lineup)
  const benchPlayers = allTeamPlayers.filter(player => 
    !lineup.lineup_players.some(lp => lp.player_id === player.id)
  );

  // Group bench players by position
  const benchByPosition = benchPlayers.reduce((acc, player) => {
    const position = player.position || 'Unknown';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(player);
    return acc;
  }, {});

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="border-b px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          {team?.flag_url && (
            <img
              src={team.flag_url}
              alt={team.name}
              className="w-5 h-4 sm:w-6 sm:h-4 object-cover rounded shadow-sm"
            />
          )}
          <CardTitle className="text-sm sm:text-base font-medium text-black truncate">
            {team?.name} ({lineup.formation})
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {/* Starting XI */}
          <div className="px-3 py-2 sm:px-4">
            <div className="text-[10px] sm:text-xs uppercase tracking-wider font-medium text-gray-400 mb-1.5 sm:mb-2">Starting XI</div>
            {positionOrder.map(positionType => {
              if (!playersByPosition[positionType]) return null;
              
              return (
                <div key={positionType} className="mb-1.5 sm:mb-2 last:mb-0">
                  <div className="text-[10px] sm:text-xs font-medium text-gray-500 mb-0.5 sm:mb-1">{positionType}</div>
                  <div className="space-y-0.5 sm:space-y-1">
                    {playersByPosition[positionType].map(lp => (
                      <div key={lp.id} className="flex items-center text-xs sm:text-sm">
                        <span className="w-5 sm:w-6 text-gray-600 font-medium">{lp.shirt_number || lp.player?.number}</span>
                        <span className="flex-1 text-black truncate">{lp.player?.name}</span>
                        <span className="text-[10px] sm:text-xs text-gray-500 ml-1">{lp.position}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bench */}
          {benchPlayers.length > 0 && (
            <div className="px-3 py-2 sm:px-4 bg-gray-50">
              <div className="text-[10px] sm:text-xs uppercase tracking-wider font-medium text-gray-400 mb-1.5 sm:mb-2">Bench</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-0.5 sm:gap-y-1 gap-x-2 sm:gap-x-4">
                {Object.entries(benchByPosition).map(([position, players]) => (
                  players.map(player => (
                    <div key={player.id} className="flex items-center text-xs sm:text-sm">
                      <span className="w-5 sm:w-6 text-gray-600 font-medium">{player.number}</span>
                      <span className="flex-1 text-black truncate">{player.name}</span>
                      <span className="text-[10px] sm:text-xs text-gray-500 ml-1">
                        {position === 'GK' ? 'GK' :
                         position === 'DEF' ? 'DEF' :
                         position === 'MID' ? 'MID' :
                         position === 'FWD' ? 'FWD' : position}
                      </span>
                    </div>
                  ))
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default LineupViewer; 