import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Select,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  Label,
  Badge
} from './ui';
import { lineupService } from '../services/lineupService';
import { playerService } from '../services/playerService';
import { Users, UserPlus, X, Check, AlertCircle } from 'lucide-react';

function LineupEditor({ match, team, onSave, onCancel }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingLineup, setExistingLineup] = useState(null);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [formation, setFormation] = useState('4-3-3');
  const [isPlayerSelectorOpen, setIsPlayerSelectorOpen] = useState(false);
  const [positionToFill, setPositionToFill] = useState(null);
  const [error, setError] = useState(null);

  // This defines the positions needed for each formation
  const formationPositions = {
    '4-4-2': ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'RM', 'ST', 'ST'],
    '4-3-3': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CM', 'CM', 'LW', 'ST', 'RW'],
    '4-2-3-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CDM', 'LAM', 'CAM', 'RAM', 'ST'],
    '3-5-2': ['GK', 'CB', 'CB', 'CB', 'LWB', 'CM', 'CM', 'CM', 'RWB', 'ST', 'ST'],
    '3-4-3': ['GK', 'CB', 'CB', 'CB', 'LM', 'CM', 'CM', 'RM', 'LW', 'ST', 'RW'],
    '5-3-2': ['GK', 'LWB', 'CB', 'CB', 'CB', 'RWB', 'CM', 'CM', 'CM', 'ST', 'ST'],
    '5-4-1': ['GK', 'LWB', 'CB', 'CB', 'CB', 'RWB', 'LM', 'CM', 'CM', 'RM', 'ST']
  };

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

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if there's an existing lineup
        const lineup = await lineupService.getLineupByMatchTeam(match.id, team.id);
        
        // Fetch available players
        const players = await playerService.getPlayersByTeam(team.id);
        
        if (!players || players.length === 0) {
          setError(`No hay jugadores disponibles para ${team.name}. Asegúrate de añadir jugadores al equipo primero.`);
          setAvailablePlayers([]);
        } else {
          setAvailablePlayers(players || []);
        }
        
        if (lineup) {
          setExistingLineup(lineup);
          setFormation(lineup.formation || '4-3-3');
          
          // Map lineup_players to selectedPlayers format
          const lineupPlayers = lineup.lineup_players?.map(lp => ({
            ...lp.player,
            specific_position: lp.position,
            is_captain: lp.is_captain,
            shirt_number: lp.shirt_number,
            player_id: lp.player_id
          })) || [];
          
          setSelectedPlayers(lineupPlayers);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading lineup data:', err);
        setError('No se pudieron cargar los datos de alineación. Por favor, intenta de nuevo o verifica que hay jugadores en el equipo.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [match.id, team.id]);

  // Handle formation change
  const handleFormationChange = (e) => {
    setFormation(e.target.value);
    
    // Reset selected players if formation changes
    if (selectedPlayers.length > 0) {
      const confirmChange = window.confirm(
        'Changing formation will reset your current lineup. Are you sure you want to continue?'
      );
      
      if (confirmChange) {
        setSelectedPlayers([]);
      } else {
        setFormation(formation); // Revert back
      }
    }
  };

  // Open player selector for a specific position
  const handleSelectPlayerForPosition = (position) => {
    setPositionToFill(position);
    setIsPlayerSelectorOpen(true);
  };

  // Handle player selection
  const handlePlayerSelect = (player) => {
    // Check if player is already selected in another position
    const existingIndex = selectedPlayers.findIndex(p => p.id === player.id);
    
    if (existingIndex >= 0) {
      // Remove player from the previous position
      const updatedPlayers = [...selectedPlayers];
      updatedPlayers.splice(existingIndex, 1);
      
      // Add to the new position
      updatedPlayers.push({
        ...player,
        specific_position: positionToFill
      });
      
      setSelectedPlayers(updatedPlayers);
    } else {
      // Add player to the selected position
      setSelectedPlayers([
        ...selectedPlayers,
        {
          ...player,
          specific_position: positionToFill
        }
      ]);
    }
    
    setIsPlayerSelectorOpen(false);
  };

  // Remove player from position
  const handleRemovePlayer = (playerId) => {
    setSelectedPlayers(selectedPlayers.filter(player => player.id !== playerId));
  };

  // Filter players by appropriate position for selector
  const getFilteredPlayersForCurrentPosition = () => {
    // Devolver todos los jugadores disponibles sin filtrar por posición
    return availablePlayers;
  };

  // Handle save lineup
  const handleSaveLineup = async () => {
    // Validate lineup - must have 11 players with all positions filled
    const requiredPositions = formationPositions[formation];
    
    if (selectedPlayers.length < 11) {
      setError(`Your lineup is incomplete. You need 11 players (currently have ${selectedPlayers.length}).`);
      return;
    }
    
    // Check if all required positions are filled
    const filledPositions = selectedPlayers.map(p => p.specific_position);
    const missingPositions = requiredPositions.filter(pos => !filledPositions.includes(pos));
    
    if (missingPositions.length > 0) {
      setError(`Missing players for positions: ${missingPositions.map(p => positionNames[p]).join(', ')}`);
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // Asegurarse de que los datos del jugador tienen la estructura correcta
      const playerData = selectedPlayers.map(player => ({
        player_id: player.id,
        specific_position: player.specific_position,
        shirt_number: player.number || 0,
        is_captain: player.is_captain || false,
        start_minute: 0,
        end_minute: null
      }));
      
      const lineupData = {
        match_id: match.id,
        team_id: team.id,
        formation: formation,
        is_starting: true,
        players: playerData
      };
      
      console.log('Sending lineup data:', JSON.stringify(lineupData));
      
      let result;
      if (existingLineup) {
        // Update existing lineup
        result = await lineupService.updateLineup(existingLineup.id, lineupData);
      } else {
        // Create new lineup
        result = await lineupService.createLineup(lineupData);
      }
      
      setSaving(false);
      
      if (onSave) {
        onSave(result);
      }
    } catch (err) {
      console.error('Error saving lineup:', err);
      setError(`Error al guardar alineación: ${err.message || 'Verifica la consola para más detalles'}`);
      setSaving(false);
    }
  };

  // Render pitch based on formation
  const renderPitch = () => {
    const requiredPositions = formationPositions[formation];
    
    // Get layout based on formation
    const formationLayout = () => {
      switch (formation) {
        case '4-4-2':
          return {
            GK: { gridColumn: '4', gridRow: '15' },
            LB: { gridColumn: '1', gridRow: '11' },
            CB: { gridColumn: '3', gridRow: '11' },
            'CB-2': { gridColumn: '5', gridRow: '11' },
            RB: { gridColumn: '7', gridRow: '11' },
            LM: { gridColumn: '1', gridRow: '7' },
            CM: { gridColumn: '3', gridRow: '7' },
            'CM-2': { gridColumn: '5', gridRow: '7' },
            RM: { gridColumn: '7', gridRow: '7' },
            ST: { gridColumn: '3', gridRow: '3' },
            'ST-2': { gridColumn: '5', gridRow: '3' }
          };
        case '4-3-3':
          return {
            GK: { gridColumn: '4', gridRow: '15' },
            LB: { gridColumn: '1', gridRow: '11' },
            CB: { gridColumn: '3', gridRow: '11' },
            'CB-2': { gridColumn: '5', gridRow: '11' },
            RB: { gridColumn: '7', gridRow: '11' },
            CDM: { gridColumn: '4', gridRow: '9' },
            CM: { gridColumn: '2', gridRow: '7' },
            'CM-2': { gridColumn: '6', gridRow: '7' },
            LW: { gridColumn: '1', gridRow: '3' },
            ST: { gridColumn: '4', gridRow: '3' },
            RW: { gridColumn: '7', gridRow: '3' }
          };
        case '4-2-3-1':
          return {
            GK: { gridColumn: '4', gridRow: '15' },
            LB: { gridColumn: '1', gridRow: '11' },
            CB: { gridColumn: '3', gridRow: '11' },
            'CB-2': { gridColumn: '5', gridRow: '11' },
            RB: { gridColumn: '7', gridRow: '11' },
            CDM: { gridColumn: '3', gridRow: '9' },
            'CDM-2': { gridColumn: '5', gridRow: '9' },
            LAM: { gridColumn: '2', gridRow: '5' },
            CAM: { gridColumn: '4', gridRow: '5' },
            RAM: { gridColumn: '6', gridRow: '5' },
            ST: { gridColumn: '4', gridRow: '2' }
          };
        case '3-5-2':
          return {
            GK: { gridColumn: '4', gridRow: '15' },
            CB: { gridColumn: '2', gridRow: '11' },
            'CB-2': { gridColumn: '4', gridRow: '11' },
            'CB-3': { gridColumn: '6', gridRow: '11' },
            LWB: { gridColumn: '1', gridRow: '9' },
            CM: { gridColumn: '2', gridRow: '7' },
            'CM-2': { gridColumn: '4', gridRow: '7' },
            'CM-3': { gridColumn: '6', gridRow: '7' },
            RWB: { gridColumn: '7', gridRow: '9' },
            ST: { gridColumn: '3', gridRow: '3' },
            'ST-2': { gridColumn: '5', gridRow: '3' }
          };
        case '3-4-3':
          return {
            GK: { gridColumn: '4', gridRow: '15' },
            CB: { gridColumn: '2', gridRow: '11' },
            'CB-2': { gridColumn: '4', gridRow: '11' },
            'CB-3': { gridColumn: '6', gridRow: '11' },
            LM: { gridColumn: '1', gridRow: '7' },
            CM: { gridColumn: '3', gridRow: '7' },
            'CM-2': { gridColumn: '5', gridRow: '7' },
            RM: { gridColumn: '7', gridRow: '7' },
            LW: { gridColumn: '1', gridRow: '3' },
            ST: { gridColumn: '4', gridRow: '3' },
            RW: { gridColumn: '7', gridRow: '3' }
          };
        case '5-3-2':
          return {
            GK: { gridColumn: '4', gridRow: '15' },
            LWB: { gridColumn: '1', gridRow: '11' },
            CB: { gridColumn: '2', gridRow: '12' },
            'CB-2': { gridColumn: '4', gridRow: '13' },
            'CB-3': { gridColumn: '6', gridRow: '12' },
            RWB: { gridColumn: '7', gridRow: '11' },
            CM: { gridColumn: '2', gridRow: '7' },
            'CM-2': { gridColumn: '4', gridRow: '7' },
            'CM-3': { gridColumn: '6', gridRow: '7' },
            ST: { gridColumn: '3', gridRow: '3' },
            'ST-2': { gridColumn: '5', gridRow: '3' }
          };
        case '5-4-1':
          return {
            GK: { gridColumn: '4', gridRow: '15' },
            LWB: { gridColumn: '1', gridRow: '11' },
            CB: { gridColumn: '2', gridRow: '12' },
            'CB-2': { gridColumn: '4', gridRow: '13' },
            'CB-3': { gridColumn: '6', gridRow: '12' },
            RWB: { gridColumn: '7', gridRow: '11' },
            LM: { gridColumn: '2', gridRow: '7' },
            CM: { gridColumn: '3', gridRow: '7' },
            'CM-2': { gridColumn: '5', gridRow: '7' },
            RM: { gridColumn: '6', gridRow: '7' },
            ST: { gridColumn: '4', gridRow: '3' }
          };
        default:
          return {}; // Default to 4-3-3
      }
    };
    
    const layout = formationLayout();
    
    // Track which positions are already filled with players
    const filledPositions = {};
    selectedPlayers.forEach(player => {
      filledPositions[player.specific_position] = player;
    });
    
    // Render player positions based on formation
    return (
      <div className="pitch-container bg-gradient-to-b from-[#4b8a0b] to-[#195303] rounded-lg overflow-hidden relative">
        {/* Field markings */}
        <div className="center-circle"></div>
        <div className="goal-box-top"></div>
        <div className="goal-box-bottom"></div>
        <div className="halfway-line"></div>
        
        {/* Positions */}
        <div className="positions-grid">
          {requiredPositions.map((position, index) => {
            // Handle multiple players in same position (e.g. 2 CB's)
            const posKey = requiredPositions.filter(p => p === position).length > 1 && 
                          requiredPositions.indexOf(position) !== index 
                          ? `${position}-${index - requiredPositions.indexOf(position) + 1}`
                          : position;
            
            const style = layout[posKey] || {};
            const player = filledPositions[position];
            
            return (
              <div 
                key={`${position}-${index}`} 
                className="position-slot"
                style={style}
              >
                {player ? (
                  <div className="player-token filled">
                    <div className="number">{player.number || '?'}</div>
                    <div className="name">{player.name.split(' ').pop()}</div>
                    <button 
                      className="remove-player"
                      onClick={() => handleRemovePlayer(player.id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button 
                    className="player-token empty"
                    onClick={() => handleSelectPlayerForPosition(position)}
                  >
                    <div className="position-name">{positionNames[position]}</div>
                    <div className="add-icon"><UserPlus size={16} /></div>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="lineup-editor">
      <Card className="mb-6 shadow-md border-[1px] border-gray-200">
        <CardHeader className="card-header-metallic border-b">
          <CardTitle className="text-lg font-semibold text-black">
            {team.name} Lineup
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 bg-white">
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-md flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
          )}
          
          <div className="mb-4">
            <Label htmlFor="formation" className="text-black font-medium mb-1 block">Formation</Label>
            <select
              id="formation"
              className="w-full text-black bg-white border border-gray-300 rounded-md h-10 px-3 py-2 shadow-sm"
              value={formation}
              onChange={handleFormationChange}
            >
              {lineupService.getFormations().map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          
          <div className="lineup-display border rounded-lg p-1 shadow-inner bg-gray-50">
            {renderPitch()}
          </div>
          
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Selected Players: {selectedPlayers.length}/11</div>
            <div className="selected-player-list">
              {selectedPlayers.map(player => (
                <Badge 
                  key={player.id} 
                  variant="outline" 
                  className="mr-2 mb-2 flex items-center gap-1 bg-blue-100 text-blue-800 border border-blue-300"
                >
                  <span>{player.name}</span>
                  <span className="ml-1 text-xs">({positionNames[player.specific_position]})</span>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 border-t flex justify-end gap-2 bg-gray-50">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-gray-300 hover:bg-gray-100 text-gray-700"
          >
            Cancel
          </Button>
          <Button
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSaveLineup}
          >
            {saving ? 'Saving...' : 'Save Lineup'}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Player Selector Dialog */}
      <Dialog
        open={isPlayerSelectorOpen}
        onClose={() => setIsPlayerSelectorOpen(false)}
      >
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">Select Player for {positionNames[positionToFill]}</DialogTitle>
            <DialogDescription>
              Choose a player to fill the {positionNames[positionToFill]} position.
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    <AlertCircle size={16} />
                  </div>
                  <div>
                    Puedes seleccionar cualquier jugador para cualquier posición, independientemente de su posición natural.
                    Los jugadores están coloreados según su posición para ayudarte a identificarlos.
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="player-list-container max-h-[400px] overflow-y-auto py-4">
            {getFilteredPlayersForCurrentPosition().length === 0 ? (
              <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-700 font-medium mb-2">No hay jugadores disponibles</p>
                <p className="text-gray-500 text-sm">
                  No hay jugadores disponibles para este equipo. Debes agregar jugadores al equipo en la página de detalles del equipo antes de poder configurar la alineación.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {getFilteredPlayersForCurrentPosition().map(player => {
                  const isAlreadySelected = selectedPlayers.some(p => p.id === player.id);
                  
                  return (
                    <div 
                      key={player.id}
                      className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                        isAlreadySelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => handlePlayerSelect(player)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                        player.position === 'GK' ? 'bg-green-600' : 
                        player.position === 'DEF' ? 'bg-blue-600' : 
                        player.position === 'MID' ? 'bg-amber-600' : 
                        'bg-red-600'
                      }`}>
                        {player.number || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-black">{player.name}</div>
                        <div className="text-xs text-gray-600 flex items-center gap-1">
                          <Badge className={`
                            ${player.position === 'GK' ? 'bg-green-100 text-green-800 border-green-300' : 
                            player.position === 'DEF' ? 'bg-blue-100 text-blue-800 border-blue-300' : 
                            player.position === 'MID' ? 'bg-amber-100 text-amber-800 border-amber-300' : 
                            'bg-red-100 text-red-800 border-red-300'}
                          `}>
                            {player.position === 'GK' ? 'Portero' : 
                             player.position === 'DEF' ? 'Defensa' : 
                             player.position === 'MID' ? 'Mediocampista' : 
                             'Delantero'}
                          </Badge>
                          {player.club && <span className="text-gray-500">• {player.club}</span>}
                        </div>
                      </div>
                      {isAlreadySelected && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                          Ya seleccionado
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <DialogFooter className="border-t pt-3">
            <Button variant="outline" onClick={() => setIsPlayerSelectorOpen(false)} className="border-gray-300 text-gray-700">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <style jsx>{`
        .pitch-container {
          aspect-ratio: 68/105;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          border: 2px solid #fff;
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 10px;
        }
        
        .positions-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-template-rows: repeat(15, 1fr);
          width: 100%;
          height: 100%;
        }
        
        .player-token {
          width: 100%;
          aspect-ratio: 1;
          max-width: 60px;
          margin: 0 auto;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 0.75rem;
          position: relative;
          transition: all 0.2s;
        }
        
        .player-token.filled {
          background-color: white;
          color: black;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .player-token.empty {
          background-color: rgba(255, 255, 255, 0.3);
          color: white;
          border: 2px dashed rgba(255, 255, 255, 0.6);
          cursor: pointer;
          font-weight: bold;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(4px);
        }
        
        .player-token.empty:hover {
          background-color: rgba(255, 255, 255, 0.5);
          border-color: white;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }
        
        .player-token .number {
          font-weight: bold;
          font-size: 1rem;
        }
        
        .player-token .name {
          font-size: 0.65rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        
        .player-token .position-name {
          font-size: 0.6rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 90%;
        }
        
        .remove-player {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 18px;
          height: 18px;
          background: rgba(255, 0, 0, 0.7);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .player-token:hover .remove-player {
          opacity: 1;
        }
        
        .halfway-line {
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: rgba(255, 255, 255, 0.6);
        }
        
        .center-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.6);
          transform: translate(-50%, -50%);
        }
        
        .goal-box-bottom {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 120px;
          height: 50px;
          border: 2px solid rgba(255, 255, 255, 0.6);
          border-bottom: none;
          transform: translateX(-50%);
        }
        
        .goal-box-top {
          position: absolute;
          top: 0;
          left: 50%;
          width: 120px;
          height: 50px;
          border: 2px solid rgba(255, 255, 255, 0.6);
          border-top: none;
          transform: translateX(-50%);
        }
      `}</style>
    </div>
  );
}

export default LineupEditor; 