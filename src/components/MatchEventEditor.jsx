import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Form,
  FormField,
  Input,
  Select,
  Label,
  Textarea
} from './ui';
import { matchEventService } from '../services/matchEventService';
import { playerService } from '../services/playerService';
import { Plus, Edit2, Trash2, Clock, User, ArrowRight } from 'lucide-react';

function MatchEventEditor({ match, onSave, onCancel }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    event_type: '',
    player_id: '',
    secondary_player_id: '',
    minute: '',
    added_time: '',
    details: '',
    penalty: false,
    own_goal: false,
    team_id: ''
  });
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);

  // Load events and players
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load match events
        const eventsData = await matchEventService.getMatchEvents(match.id);
        setEvents(eventsData);
        
        // Load players for both teams
        const [homePlayersData, awayPlayersData] = await Promise.all([
          playerService.getPlayersByTeam(match.home_team_id),
          playerService.getPlayersByTeam(match.away_team_id)
        ]);
        
        setHomePlayers(homePlayersData);
        setAwayPlayers(awayPlayersData);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadData();
  }, [match.id, match.home_team_id, match.away_team_id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // When selecting a player for a goal, automatically set the team_id
    if (name === 'player_id' && formData.event_type === 'goal' && value) {
      const player = [...homePlayers, ...awayPlayers].find(p => p.id === value);
      if (player) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          team_id: player.team_id
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Ensure all required fields are present and properly formatted
      const eventData = {
        match_id: match.id,
        player_id: formData.player_id,
        event_type: formData.event_type,
        minute: parseInt(formData.minute),
        added_time: parseInt(formData.added_time) || 0,
        details: formData.details || null,
        secondary_player_id: formData.secondary_player_id || null,
        team_id: formData.team_id,
        penalty: formData.penalty,
        own_goal: formData.own_goal
      };

      // Log the data being sent
      console.log('Submitting event data:', JSON.stringify(eventData, null, 2));
      
      let savedEvent;
      if (editingEvent) {
        savedEvent = await matchEventService.updateMatchEvent(editingEvent.id, eventData);
        
        // If updating a goal, we need to adjust the score
        if (editingEvent.event_type === 'goal' && savedEvent.event_type === 'goal') {
          // If the team changed, we need to adjust both scores
          if (editingEvent.team_id !== savedEvent.team_id) {
            // Decrease score for the old team
            if (editingEvent.team_id === match.home_team_id) {
              match.home_score = Math.max(0, (match.home_score || 0) - 1);
            } else {
              match.away_score = Math.max(0, (match.away_score || 0) - 1);
            }
            // Increase score for the new team
            if (savedEvent.team_id === match.home_team_id) {
              match.home_score = (match.home_score || 0) + 1;
            } else {
              match.away_score = (match.away_score || 0) + 1;
            }
          }
        }
      } else {
        savedEvent = await matchEventService.createMatchEvent(eventData);
        
        // If creating a goal, update the score
        if (savedEvent.event_type === 'goal') {
          if (savedEvent.team_id === match.home_team_id) {
            match.home_score = (match.home_score || 0) + 1;
          } else {
            match.away_score = (match.away_score || 0) + 1;
          }
        }
      }
      
      // Refresh events list
      const eventsData = await matchEventService.getMatchEvents(match.id);
      setEvents(eventsData);
      
      // Reset form
      setFormData({
        event_type: '',
        player_id: '',
        secondary_player_id: '',
        minute: '',
        added_time: '',
        details: '',
        penalty: false,
        own_goal: false,
        team_id: ''
      });
      setShowForm(false);
      setEditingEvent(null);
      
      // Notify parent with both the saved event and updated match
      if (onSave) {
        onSave(savedEvent, match);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      event_type: event.event_type,
      player_id: event.player_id,
      secondary_player_id: event.secondary_player_id || '',
      minute: event.minute.toString(),
      added_time: event.added_time?.toString() || '',
      details: event.details || '',
      penalty: event.penalty || false,
      own_goal: event.own_goal || false,
      team_id: event.team_id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        // Get the event before deleting it to check if it's a goal
        const eventToDelete = events.find(e => e.id === eventId);
        
        await matchEventService.deleteMatchEvent(eventId);
        
        // If deleting a goal, update the score
        if (eventToDelete?.event_type === 'goal') {
          if (eventToDelete.team_id === match.home_team_id) {
            match.home_score = Math.max(0, (match.home_score || 0) - 1);
          } else {
            match.away_score = Math.max(0, (match.away_score || 0) - 1);
          }
        }
        
        // Update local state
        setEvents(prev => prev.filter(event => event.id !== eventId));
        
        // Notify parent with both null (for deletion) and updated match
        onSave(null, match);
      } catch (err) {
        console.error('Error deleting event:', err);
        setError(err.message);
      }
    }
  };

  const handleAddNew = () => {
    setEditingEvent(null);
    setFormData({
      event_type: '',
      player_id: '',
      secondary_player_id: '',
      minute: '',
      added_time: '',
      details: '',
      penalty: false,
      own_goal: false,
      team_id: ''
    });
    setShowForm(true);
  };

  const getPlayerName = (playerId) => {
    const allPlayers = [...homePlayers, ...awayPlayers];
    const player = allPlayers.find(p => p.id === playerId);
    return player ? player.name : 'Unknown Player';
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'goal':
        return '⚽';
      case 'yellow_card':
        return '🟨';
      case 'red_card':
        return '🟥';
      case 'substitution':
        return '🔄';
      case 'injury':
        return '🏥';
      case 'var_review':
        return '📺';
      default:
        return '⚪';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded">
          <div className="font-medium">Error</div>
          <div className="text-sm">{error}</div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Match Timeline</h3>
        <Button
          onClick={handleAddNew}
          className="bg-[var(--wc-blue)] hover:bg-[var(--wc-light-blue)] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form onSubmit={handleSubmit} className="space-y-4">
              <FormField className="form-field">
                <Label htmlFor="event_type" className="text-[var(--text-primary)]">Event Type</Label>
                <select 
                  id="event_type" 
                  name="event_type" 
                  value={formData.event_type}
                  onChange={handleInputChange}
                  required
                  className="w-full text-[var(--text-primary)] bg-white"
                >
                  <option value="">Select Event Type</option>
                  {matchEventService.getEventTypes().map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField className="form-field">
                <Label htmlFor="player_id" className="text-[var(--text-primary)]">Player</Label>
                <select 
                  id="player_id" 
                  name="player_id" 
                  value={formData.player_id}
                  onChange={handleInputChange}
                  required
                  className="w-full text-[var(--text-primary)] bg-white"
                >
                  <option value="">Select Player</option>
                  <optgroup label="Home Team">
                    {homePlayers.map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name} ({player.number})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Away Team">
                    {awayPlayers.map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name} ({player.number})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </FormField>

              {(formData.event_type === 'substitution' || formData.event_type === 'goal') && (
                <FormField className="form-field">
                  <Label htmlFor="secondary_player_id" className="text-[var(--text-primary)]">
                    {formData.event_type === 'substitution' ? 'Substitute' : 'Assist'}
                  </Label>
                  <select 
                    id="secondary_player_id" 
                    name="secondary_player_id" 
                    value={formData.secondary_player_id}
                    onChange={handleInputChange}
                    required={formData.event_type === 'substitution'}
                    className="w-full text-[var(--text-primary)] bg-white"
                  >
                    <option value="">Select Player</option>
                    <optgroup label="Home Team">
                      {homePlayers.map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name} ({player.number})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Away Team">
                      {awayPlayers.map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name} ({player.number})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </FormField>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField className="form-field">
                  <Label htmlFor="minute" className="text-[var(--text-primary)]">Minute</Label>
                  <Input
                    id="minute"
                    name="minute"
                    type="number"
                    min="0"
                    max="120"
                    value={formData.minute}
                    onChange={handleInputChange}
                    required
                    className="w-full text-[var(--text-primary)] bg-white"
                  />
                </FormField>

                <FormField className="form-field">
                  <Label htmlFor="added_time" className="text-[var(--text-primary)]">Added Time</Label>
                  <Input
                    id="added_time"
                    name="added_time"
                    type="number"
                    min="0"
                    max="15"
                    value={formData.added_time}
                    onChange={handleInputChange}
                    className="w-full text-[var(--text-primary)] bg-white"
                  />
                </FormField>
              </div>

              <FormField className="form-field">
                <Label htmlFor="details" className="text-[var(--text-primary)]">Details</Label>
                <Textarea
                  id="details"
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full text-[var(--text-primary)] bg-white"
                />
              </FormField>

              {(formData.event_type === 'goal') && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <FormField className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="penalty"
                        name="penalty"
                        checked={formData.penalty}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="penalty" className="text-[var(--text-primary)]">
                        Penalty
                      </Label>
                    </FormField>

                    <FormField className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="own_goal"
                        name="own_goal"
                        checked={formData.own_goal}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="own_goal" className="text-[var(--text-primary)]">
                        Own Goal
                      </Label>
                    </FormField>
                  </div>

                  <FormField className="form-field">
                    <Label htmlFor="secondary_player_id" className="text-[var(--text-primary)]">
                      Assist
                    </Label>
                    <select 
                      id="secondary_player_id" 
                      name="secondary_player_id" 
                      value={formData.secondary_player_id}
                      onChange={handleInputChange}
                      className="w-full text-[var(--text-primary)] bg-white"
                    >
                      <option value="">Select Player</option>
                      <optgroup label="Home Team">
                        {homePlayers.map(player => (
                          <option key={player.id} value={player.id}>
                            {player.name} ({player.number})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Away Team">
                        {awayPlayers.map(player => (
                          <option key={player.id} value={player.id}>
                            {player.name} ({player.number})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </FormField>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEvent(null);
                  }}
                  className="text-[var(--text-primary)]"
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingEvent ? 'Update' : 'Add'} Event
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-8 bg-neutral-50 rounded-lg border border-neutral-200 border-dashed">
            <Clock className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <p className="text-neutral-600">No events recorded yet</p>
          </div>
        ) : (
          <div className="relative">
            {/* Team headers */}
            <div className="grid grid-cols-2 mb-4 sm:mb-6 text-xs sm:text-sm font-medium">
              <div className="pr-4 sm:pr-8 text-right">
                <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                  <span className="text-neutral-600">{match.home_team?.name || 'Home Team'}</span>
                  {match.home_team?.flag_url && (
                    <img 
                      src={match.home_team.flag_url} 
                      alt={match.home_team?.name} 
                      className="w-4 h-3 sm:w-6 sm:h-4 object-cover rounded-sm shadow-sm"
                    />
                  )}
                </div>
              </div>
              <div className="pl-4 sm:pl-8">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {match.away_team?.flag_url && (
                    <img 
                      src={match.away_team.flag_url} 
                      alt={match.away_team?.name} 
                      className="w-4 h-3 sm:w-6 sm:h-4 object-cover rounded-sm shadow-sm"
                    />
                  )}
                  <span className="text-neutral-600">{match.away_team?.name || 'Away Team'}</span>
                </div>
              </div>
            </div>

            {/* Score display */}
            <div className="flex justify-center mb-4 sm:mb-6 relative z-20">
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 px-4 sm:px-6 py-1.5 sm:py-2">
                <div className="text-xl sm:text-2xl font-bold text-neutral-900">
                  {match.home_score || 0} - {match.away_score || 0}
                </div>
                <div className="text-[10px] sm:text-xs text-neutral-500 text-center mt-0.5 sm:mt-1">
                  {match.status === 'in_progress' ? 'LIVE' : match.status === 'completed' ? 'FULL TIME' : 'MATCH NOT STARTED'}
                </div>
              </div>
            </div>

            {/* Central timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-neutral-200 via-neutral-200 to-transparent z-10"></div>

            {events.map((event, index) => {
              // Determine if event belongs to home or away team
              const isHomeTeam = event.team_id === match.home_team_id || 
                (event.player_id && homePlayers.some(p => p.id === event.player_id));

              return (
                <div key={event.id} className="relative flex items-center group">
                  {/* Time indicator in the middle */}
                  <div className="absolute left-1/2 -ml-2.5 sm:-ml-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center z-10 shadow-sm">
                    <div className="text-[8px] sm:text-[10px] font-medium text-neutral-600">
                      {event.minute}'
                      {event.added_time > 0 && <span>+{event.added_time}</span>}
                    </div>
                  </div>

                  {/* Event content */}
                  <div className={`grid grid-cols-2 w-full gap-1 sm:gap-4 py-1 sm:py-4 ${isHomeTeam ? 'home-event' : 'away-event'}`}>
                    {/* Home team side */}
                    <div className={`${isHomeTeam ? 'pr-1 sm:pr-8' : 'opacity-0'}`}>
                      {isHomeTeam && (
                        <div className="flex items-start justify-end">
                          <div className="bg-white rounded-sm shadow-sm border border-neutral-200 p-1.5 sm:p-3 max-w-[200px] sm:max-w-md w-full transition-all duration-200 hover:shadow-md hover:border-neutral-300">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div className="flex-grow text-right">
                                <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                                  <span className="font-medium text-xs sm:text-base text-neutral-900">{getPlayerName(event.player_id)}</span>
                                  {event.secondary_player_id && (
                                    <>
                                      <span className="text-neutral-400 text-[10px] sm:text-sm mx-0.5 sm:mx-1">•</span>
                                      <span className="text-[10px] sm:text-sm text-neutral-600">
                                        {getPlayerName(event.secondary_player_id)}
                                      </span>
                                    </>
                                  )}
                                  {(event.penalty || event.own_goal || event.details) && (
                                    <span className="text-neutral-400 text-[10px] sm:text-sm mx-0.5 sm:mx-1">•</span>
                                  )}
                                  {event.penalty && <span className="text-amber-600 text-[10px] sm:text-sm">(P)</span>}
                                  {event.own_goal && <span className="text-red-600 text-[10px] sm:text-sm">(OG)</span>}
                                  {event.details && <span className="text-neutral-500 text-[10px] sm:text-sm">({event.details})</span>}
                                </div>
                              </div>
                              <div className="text-base sm:text-xl w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center bg-neutral-50 rounded-sm border border-neutral-200">{getEventIcon(event.event_type)}</div>
                              <div className="flex space-x-0.5 sm:space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(event)}
                                  className="h-5 w-5 sm:h-7 sm:w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-sm"
                                >
                                  <Edit2 className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(event.id)}
                                  className="h-5 w-5 sm:h-7 sm:w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-sm"
                                >
                                  <Trash2 className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Away team side */}
                    <div className={`${!isHomeTeam ? 'pl-1 sm:pl-8' : 'opacity-0'}`}>
                      {!isHomeTeam && (
                        <div className="flex items-start">
                          <div className="bg-white rounded-sm shadow-sm border border-neutral-200 p-1.5 sm:p-3 max-w-[200px] sm:max-w-md w-full transition-all duration-200 hover:shadow-md hover:border-neutral-300">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div className="flex space-x-0.5 sm:space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(event)}
                                  className="h-5 w-5 sm:h-7 sm:w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-sm"
                                >
                                  <Edit2 className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(event.id)}
                                  className="h-5 w-5 sm:h-7 sm:w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-sm"
                                >
                                  <Trash2 className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                              <div className="text-base sm:text-xl w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center bg-neutral-50 rounded-sm border border-neutral-200">{getEventIcon(event.event_type)}</div>
                              <div className="flex-grow">
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                  <span className="font-medium text-xs sm:text-base text-neutral-900">{getPlayerName(event.player_id)}</span>
                                  {event.secondary_player_id && (
                                    <>
                                      <span className="text-neutral-400 text-[10px] sm:text-sm mx-0.5 sm:mx-1">•</span>
                                      <span className="text-[10px] sm:text-sm text-neutral-600">
                                        {getPlayerName(event.secondary_player_id)}
                                      </span>
                                    </>
                                  )}
                                  {(event.penalty || event.own_goal || event.details) && (
                                    <span className="text-neutral-400 text-[10px] sm:text-sm mx-0.5 sm:mx-1">•</span>
                                  )}
                                  {event.penalty && <span className="text-amber-600 text-[10px] sm:text-sm">(P)</span>}
                                  {event.own_goal && <span className="text-red-600 text-[10px] sm:text-sm">(OG)</span>}
                                  {event.details && <span className="text-neutral-500 text-[10px] sm:text-sm">({event.details})</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MatchEventEditor; 