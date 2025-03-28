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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {id === 'new' ? 'Create New Match' : `${homeName} vs ${awayName}`}
        </h1>
        <Button onClick={() => navigate('/matches')}>
          Back to Matches
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Edit Match Details' : 'Match Details'}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {isEditing ? (
            <Form className="space-y-4">
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
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 text-center">
                  <div className="font-semibold">{homeName}</div>
                  {match.home_team?.flag_url && (
                    <img 
                      src={match.home_team.flag_url} 
                      alt={homeName}
                      className="h-16 mx-auto my-2"
                    />
                  )}
                  {match.status === 'completed' && (
                    <div className="text-2xl font-bold">{match.home_score}</div>
                  )}
                </div>
                
                <div className="col-span-1 flex flex-col items-center justify-center">
                  <div className="text-sm text-gray-500 mb-2">
                    <div>{formattedDate}</div>
                    <div>{formattedTime}</div>
                  </div>
                  {match.status === 'completed' ? (
                    <div className="text-xl">FT</div>
                  ) : match.status === 'in_progress' ? (
                    <div className="text-xl text-green-600">LIVE</div>
                  ) : (
                    <div className="text-xl">vs</div>
                  )}
                  {groupName && <div className="mt-2 text-sm">Group {groupName}</div>}
                </div>
                
                <div className="col-span-1 text-center">
                  <div className="font-semibold">{awayName}</div>
                  {match.away_team?.flag_url && (
                    <img 
                      src={match.away_team.flag_url} 
                      alt={awayName}
                      className="h-16 mx-auto my-2"
                    />
                  )}
                  {match.status === 'completed' && (
                    <div className="text-2xl font-bold">{match.away_score}</div>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Status</p>
                    <p>{match.status === 'scheduled' ? 'Scheduled' : 
                        match.status === 'in_progress' ? 'In Progress' : 
                        'Completed'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Date & Time</p>
                    <p>{formattedDate} {formattedTime}</p>
                  </div>
                  {match.group_id && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500">Group</p>
                      <p>Group {groupName}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Match
              </Button>
              <Button onClick={handleEdit}>
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