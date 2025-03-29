import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Input,
  Select,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  Label
} from '../components/ui';
import { teamService } from '../services/teamService';
import { playerService } from '../services/playerService';
import { Flag, ArrowLeft, Users, Award, User, Calendar, MapPin, Briefcase, Plus, Edit, Trash, Pencil, AlertTriangle } from 'lucide-react';
import '../assets/styles/theme.css';

function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('squad');
  
  // Player CRUD state
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [playerToDelete, setPlayerToDelete] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [playerForm, setPlayerForm] = useState({
    name: '',
    position: 'GK',
    number: '',
    birth_date: '',
    club: '',
    team_id: id
  });

  // Position display names
  const positionNames = {
    GK: 'Goalkeepers',
    DEF: 'Defenders',
    MID: 'Midfielders',
    FWD: 'Forwards'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch team data
        const teamData = await teamService.getTeams();
        const teamInfo = teamData.find(t => t.id === id);
        
        if (!teamInfo) {
          setError('Team not found');
          setIsLoading(false);
          return;
        }
        
        setTeam(teamInfo);
        
        // Fetch players grouped by position
        const playersData = await playerService.getPlayersByPosition(id);
        setPlayers(playersData);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading team data:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle player form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlayerForm({
      ...playerForm,
      [name]: value
    });
  };

  // Open the add player modal
  const handleAddPlayer = () => {
    setEditingPlayer(null);
    setPlayerForm({
      name: '',
      position: 'GK',
      number: '',
      birth_date: '',
      club: '',
      team_id: id
    });
    setIsPlayerModalOpen(true);
  };

  // Open the edit player modal
  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    
    // Convert date format from ISO to YYYY-MM-DD for the input
    let formattedDate = '';
    if (player.birth_date) {
      const date = new Date(player.birth_date);
      formattedDate = date.toISOString().split('T')[0];
    }
    
    setPlayerForm({
      name: player.name || '',
      position: player.position || 'GK',
      number: player.number || '',
      birth_date: formattedDate,
      club: player.club || '',
      team_id: id
    });
    
    setIsPlayerModalOpen(true);
  };

  // Confirm player deletion
  const confirmDeletePlayer = (player) => {
    setPlayerToDelete(player);
    setIsDeleteDialogOpen(true);
  };

  // Handle player form submission (create or update)
  const handleSubmitPlayer = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    try {
      if (editingPlayer) {
        // Update existing player
        await playerService.updatePlayer(editingPlayer.id, playerForm);
      } else {
        // Create new player
        await playerService.createPlayer(playerForm);
      }
      
      // Refresh the players list
      const refreshedPlayers = await playerService.getPlayersByPosition(id);
      setPlayers(refreshedPlayers);
      
      // Close the modal
      setIsPlayerModalOpen(false);
      
    } catch (err) {
      console.error('Error saving player:', err);
      alert('Failed to save player: ' + err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle player deletion
  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;
    
    try {
      await playerService.deletePlayer(playerToDelete.id);
      
      // Refresh the players list
      const refreshedPlayers = await playerService.getPlayersByPosition(id);
      setPlayers(refreshedPlayers);
      
      // Close the dialog
      setIsDeleteDialogOpen(false);
      setPlayerToDelete(null);
      
    } catch (err) {
      console.error('Error deleting player:', err);
      alert('Failed to delete player: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
        <Button className="mt-4" onClick={() => navigate('/teams')}>
          Back to Teams
        </Button>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Team not found
        </div>
        <Button className="mt-4" onClick={() => navigate('/teams')}>
          Back to Teams
        </Button>
      </div>
    );
  }

  // Calculate squad stats
  const squadCount = Object.values(players).flat().length;
  const positionCounts = {
    GK: players.GK?.length || 0,
    DEF: players.DEF?.length || 0,
    MID: players.MID?.length || 0,
    FWD: players.FWD?.length || 0
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="header-gradient flex flex-col md:flex-row items-center justify-between mb-6 p-4 md:p-6">
        <div className="flex items-center justify-center md:justify-start w-full md:w-auto mb-4 md:mb-0">
          <div className="flex items-center gap-4">
            {team.flag_url ? (
              <img 
                src={team.flag_url} 
                alt={`${team.name} flag`} 
                className="w-16 h-10 object-cover shadow-md border border-gray-200 rounded"
              />
            ) : (
              <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center">
                <Flag className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{team.name}</h1>
              <div className="text-white text-opacity-80 mt-1 flex items-center gap-2">
                <span className="font-semibold">{team.code}</span>
                <span>•</span>
                <span>{team.region}</span>
              </div>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => navigate('/teams')} 
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teams
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Team Info Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-white shadow-md text-black">
            <CardHeader className="card-header-metallic border-b">
              <CardTitle className="text-lg font-semibold text-black">Team Information</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-black">
              {team.qualified ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span className="font-medium">Qualified for World Cup</span>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-md flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span className="font-medium">Not Qualified</span>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-[var(--text-secondary)]" />
                <div>
                  <div className="text-sm text-black">FIFA Ranking</div>
                  <div className="font-medium text-black">#{team.fifa_ranking || 'N/A'}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[var(--text-secondary)]" />
                <div>
                  <div className="text-sm text-black">Region</div>
                  <div className="font-medium text-black">{team.region}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-[var(--text-secondary)]" />
                <div>
                  <div className="text-sm text-black">Squad Size</div>
                  <div className="font-medium text-black">{squadCount} Players</div>
                </div>
              </div>
              
              {/* Position Distribution */}
              <div className="mt-4">
                <div className="text-sm font-medium text-black mb-2">Squad Composition</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-black">Goalkeepers</span>
                    <Badge variant="outline" className="bg-[var(--wc-blue)] bg-opacity-10 text-[var(--wc-blue)]">
                      {positionCounts.GK}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-black">Defenders</span>
                    <Badge variant="outline" className="bg-[var(--wc-blue)] bg-opacity-10 text-[var(--wc-blue)]">
                      {positionCounts.DEF}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-black">Midfielders</span>
                    <Badge variant="outline" className="bg-[var(--wc-blue)] bg-opacity-10 text-[var(--wc-blue)]">
                      {positionCounts.MID}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-black">Forwards</span>
                    <Badge variant="outline" className="bg-[var(--wc-blue)] bg-opacity-10 text-[var(--wc-blue)]">
                      {positionCounts.FWD}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="bg-white shadow-md">
            <CardHeader className="card-header-metallic border-b">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                <CardTitle className="text-lg font-semibold">Squad Members</CardTitle>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handleAddPlayer}
                    className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Player
                  </Button>
                  <div className="flex space-x-1 w-full md:w-auto">
                    <Button 
                      variant={activeTab === 'squad' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setActiveTab('squad')}
                      className={activeTab === 'squad' ? 'bg-[var(--wc-blue)]' : ''}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Squad
                    </Button>
                    <Button 
                      variant={activeTab === 'stats' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setActiveTab('stats')}
                      className={activeTab === 'stats' ? 'bg-[var(--wc-blue)]' : ''}
                    >
                      <Award className="h-4 w-4 mr-1" />
                      Stats
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {activeTab === 'squad' ? (
                <div className="space-y-6">
                  {Object.keys(positionNames).map(position => (
                    <div key={position}>
                      <h3 className="text-lg font-semibold text-[var(--wc-blue)] mb-3 border-b pb-2">
                        {positionNames[position]} ({players[position]?.length || 0})
                      </h3>
                      
                      {players[position] && players[position].length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {players[position].map(player => (
                            <Card key={player.id} className="border overflow-hidden hover:shadow-md transition-shadow">
                              <div className="flex p-3">
                                <div className="w-12 h-12 bg-[var(--wc-blue)] rounded-full flex items-center justify-center text-white font-bold mr-3">
                                  {player.number || '?'}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <h4 className="font-medium">{player.name}</h4>
                                    <div className="flex items-center space-x-1">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleEditPlayer(player)}
                                        className="h-7 w-7 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => confirmDeletePlayer(player)}
                                        className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                    <div className="flex items-center">
                                      <User className="h-3 w-3 mr-1" />
                                      <span>{position}</span>
                                    </div>
                                    {player.birth_date ? (
                                      <div className="flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        <span>{new Date(player.birth_date).getFullYear()}</span>
                                      </div>
                                    ) : null}
                                    {player.club && (
                                      <div className="flex items-center">
                                        <Briefcase className="h-3 w-3 mr-1" />
                                        <span>{player.club}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 bg-gray-50 rounded-lg">
                          <p className="text-[var(--text-secondary)]">No {positionNames[position].toLowerCase()} in the squad yet.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600">Team Statistics</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Team statistics will be available here after matches have been played.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Player Add/Edit Modal */}
      <Dialog 
        open={isPlayerModalOpen} 
        onClose={() => setIsPlayerModalOpen(false)}
      >
        <DialogContent className="sm:max-w-[500px] text-black">
          <DialogHeader>
            <DialogTitle>{editingPlayer ? 'Edit Player' : 'Add New Player'}</DialogTitle>
            <DialogDescription>
              {editingPlayer 
                ? 'Update the player information in the form below.' 
                : 'Enter the player information in the form below.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPlayer}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={playerForm.name}
                  onChange={handleInputChange}
                  className="col-span-3 text-black"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="position" className="text-right">Position</Label>
                <select 
                  id="position"
                  name="position"
                  value={playerForm.position}
                  onChange={handleInputChange}
                  className="col-span-3 border rounded-md h-10 px-3 py-2 text-black"
                  required
                >
                  <option value="GK">Goalkeeper (GK)</option>
                  <option value="DEF">Defender (DEF)</option>
                  <option value="MID">Midfielder (MID)</option>
                  <option value="FWD">Forward (FWD)</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="number" className="text-right">Jersey Number</Label>
                <Input
                  id="number"
                  name="number"
                  type="number"
                  min="1"
                  max="99"
                  value={playerForm.number}
                  onChange={handleInputChange}
                  className="col-span-3 text-black"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="birth_date" className="text-right">Birth Date <span className="text-gray-400 text-xs">(optional)</span></Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={playerForm.birth_date}
                  onChange={handleInputChange}
                  className="col-span-3 text-black"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="club" className="text-right">Club</Label>
                <Input
                  id="club"
                  name="club"
                  value={playerForm.club}
                  onChange={handleInputChange}
                  className="col-span-3 text-black"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPlayerModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={formSubmitting}
                className="bg-[var(--wc-blue)]"
              >
                {formSubmitting ? 'Saving...' : 'Save Player'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogContent className="sm:max-w-[425px] text-black">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              This will permanently delete {playerToDelete?.name} from the team squad.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this player?
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeletePlayer}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TeamDetail; 