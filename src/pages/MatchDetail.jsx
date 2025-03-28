import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardFooter,
  Button,
  Form,
  FormField,
  Input,
  Select,
  Label
} from '../components/ui';
import { matchService, matchDateHelpers } from '../services/matchService';
import { teamService } from '../services/teamService';

function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [teams, setTeams] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupTeams, setGroupTeams] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  
  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get teams and groups first
        const teamsData = await teamService.getTeams();
        setTeams(teamsData || []);
        
        // Get group assignments to know which teams belong to which groups
        const groupAssignments = await teamService.getGroupAssignments();
        
        // Create a map of group ID to team IDs
        const teamsInGroups = {};
        groupAssignments.forEach(assignment => {
          const groupId = assignment.group.id;
          const teamId = assignment.team_id;
          
          if (!teamsInGroups[groupId]) {
            teamsInGroups[groupId] = [];
          }
          
          teamsInGroups[groupId].push(teamId);
        });
        
        setGroupTeams(teamsInGroups);
        
        // Create a list of unique groups
        const uniqueGroups = Array.from(
          new Set(groupAssignments.map(g => g.group.id))
        ).map(id => {
          const assignment = groupAssignments.find(g => g.group.id === id);
          return {
            id: id,
            name: assignment?.group.letter || ''
          };
        });
        setGroups(uniqueGroups);
        
        // If we have an ID, get the match details
        if (id && id !== 'new') {
          const matchData = await matchService.getMatchById(id);
          
          // Format the datetime properly for the input fields
          if (matchData && matchData.datetime) {
            const date = new Date(matchData.datetime);
            
            // Split into date and time components - use local date methods to respect timezone
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
            const day = date.getDate().toString().padStart(2, '0');
            matchData.date = `${year}-${month}-${day}`;
            
            // Format time as HH:MM - use local time methods to respect timezone
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            matchData.time = `${hours}:${minutes}`;
          } else {
            // Set defaults if no datetime
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            matchData.date = `${year}-${month}-${day}`;
            matchData.time = '12:00';
          }
          
          setMatch(matchData);
        } else {
          // Create a new empty match
          const now = new Date();
          const year = now.getFullYear();
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          const day = now.getDate().toString().padStart(2, '0');
          const hours = now.getHours().toString().padStart(2, '0');
          const minutes = now.getMinutes().toString().padStart(2, '0');
          
          const newMatchData = {
            home_team_id: '',
            away_team_id: '',
            home_score: null,
            away_score: null,
            datetime: now.toISOString(),
            date: `${year}-${month}-${day}`,
            time: `${hours}:${minutes}`,
            group_id: '',
            stage_id: null,
            status: 'scheduled'
          };
          
          // For new matches, automatically enter edit mode
          setIsEditing(true);
          setMatch(newMatchData);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Filter teams based on the selected group
  const filteredTeams = useMemo(() => {
    if (!match?.group_id || !groupTeams[match.group_id]) {
      return teams; // If no group selected or no teams in that group, show all teams
    }
    
    const teamIdsInGroup = groupTeams[match.group_id];
    return teams.filter(team => teamIdsInGroup.includes(team.id));
  }, [match?.group_id, teams, groupTeams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If changing groups, clear the team selections
    if (name === 'group_id' && value !== match.group_id) {
      setMatch({ 
        ...match, 
        [name]: value,
        home_team_id: '',
        away_team_id: '' 
      });
    } else {
      setMatch({ ...match, [name]: value });
    }
  };

  const handleEdit = () => {
    // Make sure the date is properly formatted for the input field before entering edit mode
    if (match && match.datetime) {
      try {
        const date = new Date(match.datetime);
        
        // Format date components using local timezone methods
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        // Format time components using local timezone methods
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;
        
        setMatch({
          ...match,
          date: dateStr,
          time: timeStr
        });
      } catch (err) {
        console.error('Error formatting date:', err);
      }
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Combine date and time into a single datetime value with timezone handling
      let datetime = null;
      if (match.date) {
        const dateStr = match.date;
        const timeStr = match.time || '12:00';
        
        // Create a Date object
        const dateParts = dateStr.split('-');
        const timeParts = timeStr.split(':');
        
        // Create date with local timezone (year, month-1, day, hour, minute)
        const localDate = new Date(
          parseInt(dateParts[0]),
          parseInt(dateParts[1]) - 1, // Month is 0-indexed
          parseInt(dateParts[2]),
          parseInt(timeParts[0]),
          parseInt(timeParts[1])
        );
        
        // Format as ISO string and keep only the date and time parts
        datetime = localDate.toISOString();
      }

      // Make sure we're only sending fields that exist in the database schema
      const matchData = {
        home_team_id: match.home_team_id || null,
        away_team_id: match.away_team_id || null,
        home_score: match.home_score !== '' ? parseInt(match.home_score) : null,
        away_score: match.away_score !== '' ? parseInt(match.away_score) : null,
        datetime: datetime,
        group_id: match.group_id || null,
        stage_id: match.stage_id || null,
        status: match.status || 'scheduled'
      };
      
      console.log('Saving match data:', matchData);
      
      let savedMatch;
      if (id === 'new') {
        // Create new match
        savedMatch = await matchService.createMatch(matchData);
      } else {
        // Update existing match - make sure ID is included for the update call
        savedMatch = await matchService.updateMatch(id, matchData);
      }
      
      console.log('Saved match:', savedMatch);
      
      // Make sure the UI shows the updated data with the proper format for editing
      if (savedMatch && savedMatch.datetime) {
        const date = new Date(savedMatch.datetime);
        
        // Format date using local methods
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        savedMatch.date = `${year}-${month}-${day}`;
        
        // Format time using local methods
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        savedMatch.time = `${hours}:${minutes}`;
        
        console.log('Formatted saved match time:', {
          original: savedMatch.datetime,
          formatted: `${savedMatch.date} ${savedMatch.time}`
        });
      }
      
      setMatch(savedMatch);
      setIsEditing(false);
      
      // If this was a new match, redirect to the match detail page with the new ID
      if (id === 'new') {
        navigate(`/matches/${savedMatch.id}`);
      }
    } catch (err) {
      console.error('Error saving match:', err);
      
      // More detailed error logging
      if (err.error) {
        console.error('Error details:', {
          code: err.code,
          message: err.message,
          details: err.details,
          hint: err.hint
        });
      }
      
      setError(err.message || 'Error saving match');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        await matchService.deleteMatch(id);
        navigate('/matches');
      } catch (err) {
        console.error('Error deleting match:', err);
        setError(err.message);
      }
    }
  };

  const handleStartMatch = async () => {
    try {
      // Set match status to in_progress and initialize scores
      const updatedMatch = {
        ...match,
        status: 'in_progress',
        home_score: 0,
        away_score: 0
      };
      
      // Save to database
      const savedMatch = await matchService.updateMatch(id, {
        status: 'in_progress',
        home_score: 0,
        away_score: 0
      });
      
      // Update local state
      setMatch(savedMatch);
    } catch (err) {
      console.error('Error starting match:', err);
      setError(err.message || 'Failed to start match');
    }
  };

  const handleEndMatch = async () => {
    if (window.confirm('Are you sure you want to end this match? The final score will be recorded.')) {
      try {
        // Set match status to completed
        const updatedMatch = {
          ...match,
          status: 'completed'
        };
        
        // Save to database
        const savedMatch = await matchService.updateMatch(id, {
          status: 'completed'
        });
        
        // Update local state
        setMatch(savedMatch);
      } catch (err) {
        console.error('Error ending match:', err);
        setError(err.message || 'Failed to end match');
      }
    }
  };

  const handleScoreChange = async (team, value) => {
    // Don't allow negative scores
    if (value < 0) return;
    
    try {
      // Update the score in the local state
      const updatedMatch = {
        ...match,
        [team === 'home' ? 'home_score' : 'away_score']: value
      };
      
      // Save to database
      const savedMatch = await matchService.updateMatch(id, {
        [team === 'home' ? 'home_score' : 'away_score']: value
      });
      
      // Update local state
      setMatch(savedMatch);
    } catch (err) {
      console.error('Error updating score:', err);
      setError(err.message || 'Failed to update score');
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading match details...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
        <Button className="mt-4" onClick={() => navigate('/matches')}>
          Back to Matches
        </Button>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Match not found
        </div>
        <Button className="mt-4" onClick={() => navigate('/matches')}>
          Back to Matches
        </Button>
      </div>
    );
  }

  const homeName = match.home_team?.name || 
    teams.find(t => t.id === match.home_team_id)?.name || 
    'TBD';
  
  const awayName = match.away_team?.name || 
    teams.find(t => t.id === match.away_team_id)?.name || 
    'TBD';

  const groupName = match.group?.name || 
    groups.find(g => g.id === match.group_id)?.name || 
    '';

  const formattedDate = matchDateHelpers.formatDate(match.datetime);
  const formattedTime = matchDateHelpers.formatTime(match.datetime);

  // Determine if the match can be started (has both teams and is scheduled)
  const canStartMatch = !isEditing && 
    match.status === 'scheduled' && 
    match.home_team_id && 
    match.away_team_id;

  // Determine if the match can be ended (is in progress)
  const canEndMatch = !isEditing && match.status === 'in_progress';

  // Determine if scores can be edited (match is in progress)
  const canEditScores = !isEditing && match.status === 'in_progress';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="header-gradient flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {id === 'new' ? 'Create New Match' : `${homeName} vs ${awayName}`}
        </h1>
        <Button 
          onClick={() => navigate('/matches')} 
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0 backdrop-blur-sm"
        >
          Back to Matches
        </Button>
      </div>

      <Card className="match-card">
        <CardHeader className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-b">
          <CardTitle className="text-xl font-semibold text-neutral-800">
            {isEditing ? 'Edit Match Details' : 'Match Details'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {isEditing ? (
            <Form className="space-y-6">
              <FormField>
                <Label htmlFor="group_id">Group</Label>
                <Select 
                  id="group_id" 
                  name="group_id" 
                  value={match.group_id || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      Group {group.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField>
                <Label htmlFor="home_team_id">Home Team</Label>
                <Select 
                  id="home_team_id" 
                  name="home_team_id" 
                  value={match.home_team_id || ''}
                  onChange={handleChange}
                  disabled={!match.group_id}
                >
                  <option value="">Select Home Team</option>
                  {filteredTeams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </Select>
                {!match.group_id && 
                  <p className="text-sm text-amber-600 mt-1">Please select a group first</p>
                }
              </FormField>

              <FormField>
                <Label htmlFor="away_team_id">Away Team</Label>
                <Select 
                  id="away_team_id" 
                  name="away_team_id" 
                  value={match.away_team_id || ''}
                  onChange={handleChange}
                  disabled={!match.group_id}
                >
                  <option value="">Select Away Team</option>
                  {filteredTeams
                    .filter(team => team.id !== match.home_team_id) // Prevent selecting same team for both home and away
                    .map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </Select>
                {!match.group_id && 
                  <p className="text-sm text-amber-600 mt-1">Please select a group first</p>
                }
              </FormField>

              <FormField>
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  name="date" 
                  type="date" 
                  value={match.date || ''}
                  onChange={handleChange}
                />
              </FormField>

              <FormField>
                <Label htmlFor="time">Time</Label>
                <Input 
                  id="time" 
                  name="time" 
                  type="time" 
                  value={match.time || ''}
                  onChange={handleChange}
                />
              </FormField>

              <FormField>
                <Label htmlFor="status">Status</Label>
                <Select 
                  id="status" 
                  name="status" 
                  value={match.status || 'scheduled'}
                  onChange={handleChange}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </Select>
              </FormField>

              {match.status === 'completed' && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField className="col-span-1">
                    <Label htmlFor="home_score">Home Score</Label>
                    <Input 
                      id="home_score" 
                      name="home_score" 
                      type="number" 
                      min="0"
                      value={match.home_score || 0}
                      onChange={handleChange}
                    />
                  </FormField>
                  
                  <FormField className="col-span-1">
                    <Label htmlFor="away_score">Away Score</Label>
                    <Input 
                      id="away_score" 
                      name="away_score" 
                      type="number" 
                      min="0"
                      value={match.away_score || 0}
                      onChange={handleChange}
                    />
                  </FormField>
                </div>
              )}
            </Form>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-8">
                <div className="col-span-1 text-center p-4 rounded-lg border border-neutral-200 bg-white shadow-sm hover:shadow transition-all">
                  <div className="font-semibold text-lg mb-2">{homeName}</div>
                  {match.home_team?.flag_url && (
                    <img 
                      src={match.home_team.flag_url} 
                      alt={homeName}
                      className="h-20 mx-auto my-3 rounded-md shadow-sm border border-neutral-200"
                    />
                  )}
                  {match.status !== 'scheduled' && (
                    <div className="flex items-center justify-center mt-5">
                      {canEditScores ? (
                        <div className="match-score-controls">
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleScoreChange('home', (match.home_score || 0) - 1)}
                            disabled={match.home_score <= 0}
                            className="px-4 py-2 h-12 bg-rose-500 hover:bg-rose-600 text-white text-lg font-bold border-0"
                          >
                            -
                          </Button>
                          <div className="match-score-display">{match.home_score || 0}</div>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleScoreChange('home', (match.home_score || 0) + 1)}
                            className="px-4 py-2 h-12 bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-bold border-0"
                          >
                            +
                          </Button>
                        </div>
                      ) : (
                        <div className="text-4xl font-bold p-3 bg-neutral-100 rounded-md shadow-inner">{match.home_score || 0}</div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="col-span-1 flex flex-col items-center justify-center rounded-lg border border-neutral-200 p-4 bg-gradient-to-b from-white to-neutral-50">
                  <div className="text-sm font-medium text-neutral-600 mb-3">
                    <div className="text-center">{formattedDate}</div>
                    <div className="text-center">{formattedTime}</div>
                  </div>
                  {match.status === 'completed' ? (
                    <div className="status-indicator status-completed">FULL TIME</div>
                  ) : match.status === 'in_progress' ? (
                    <div className="status-indicator status-live">LIVE</div>
                  ) : (
                    <div className="status-indicator status-scheduled">UPCOMING</div>
                  )}
                  {groupName && <div className="mt-3 text-sm font-medium bg-blue-50 text-blue-700 py-1 px-3 rounded-full">Group {groupName}</div>}
                  
                  {/* Match Timeline Visualization */}
                  <div className="w-full mt-5 pt-5 border-t border-neutral-200">
                    <div className="flex justify-between items-center text-sm text-neutral-500">
                      <div>1'</div>
                      <div>45'</div>
                      <div>90'</div>
                    </div>
                    <div className="mt-1 h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                      {match.status === 'in_progress' && (
                        <div className="h-full bg-emerald-500" style={{ width: '50%' }}></div>
                      )}
                      {match.status === 'completed' && (
                        <div className="h-full bg-neutral-400" style={{ width: '100%' }}></div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-span-1 text-center p-4 rounded-lg border border-neutral-200 bg-white shadow-sm hover:shadow transition-all">
                  <div className="font-semibold text-lg mb-2">{awayName}</div>
                  {match.away_team?.flag_url && (
                    <img 
                      src={match.away_team.flag_url} 
                      alt={awayName}
                      className="h-20 mx-auto my-3 rounded-md shadow-sm border border-neutral-200"
                    />
                  )}
                  {match.status !== 'scheduled' && (
                    <div className="flex items-center justify-center mt-5">
                      {canEditScores ? (
                        <div className="match-score-controls">
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleScoreChange('away', (match.away_score || 0) - 1)}
                            disabled={match.away_score <= 0}
                            className="px-4 py-2 h-12 bg-rose-500 hover:bg-rose-600 text-white text-lg font-bold border-0"
                          >
                            -
                          </Button>
                          <div className="match-score-display">{match.away_score || 0}</div>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleScoreChange('away', (match.away_score || 0) + 1)}
                            className="px-4 py-2 h-12 bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-bold border-0"
                          >
                            +
                          </Button>
                        </div>
                      ) : (
                        <div className="text-4xl font-bold p-3 bg-neutral-100 rounded-md shadow-inner">{match.away_score || 0}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="col-span-1 p-5 bg-white rounded-lg border border-neutral-200 shadow-sm">
                  <p className="text-sm font-semibold text-neutral-600 mb-2">Status</p>
                  {match.status === 'scheduled' ? (
                    <div className="status-indicator status-scheduled">Scheduled</div>
                  ) : match.status === 'in_progress' ? (
                    <div className="status-indicator status-live">In Progress</div>
                  ) : (
                    <div className="status-indicator status-completed">Completed</div>
                  )}
                </div>
                <div className="col-span-1 p-5 bg-white rounded-lg border border-neutral-200 shadow-sm">
                  <p className="text-sm font-semibold text-neutral-600 mb-2">Date & Time</p>
                  <p className="font-medium">
                    <span className="inline-block bg-neutral-100 px-2 py-1 rounded mr-2">{formattedDate}</span>
                    <span className="inline-block bg-neutral-100 px-2 py-1 rounded">{formattedTime}</span>
                  </p>
                </div>
                {match.group_id && (
                  <div className="col-span-1 p-5 bg-white rounded-lg border border-neutral-200 shadow-sm">
                    <p className="text-sm font-semibold text-neutral-600 mb-2">Group</p>
                    <p className="font-medium">
                      <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full">Group {groupName}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between bg-gradient-to-r from-neutral-50 to-neutral-100 border-t p-6">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)} 
                className="border-2"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-md"
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <div className="space-x-3">
                <Button 
                  variant="destructive" 
                  onClick={handleDelete} 
                  className="bg-rose-600 hover:bg-rose-700 text-white border-0 shadow-md"
                >
                  Delete Match
                </Button>
                {canStartMatch && (
                  <Button 
                    variant="success"
                    onClick={handleStartMatch}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium border-0 shadow-md"
                  >
                    Start Match
                  </Button>
                )}
                {canEndMatch && (
                  <Button 
                    variant="warning"
                    onClick={handleEndMatch}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium border-0 shadow-md"
                  >
                    End Match
                  </Button>
                )}
              </div>
              <Button 
                onClick={handleEdit} 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-md"
              >
                Edit Match
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default MatchDetail; 