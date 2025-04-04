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
import { lineupService } from '../services/lineupService';
import { Calendar, Flag, Clock, Timer, Play, Square, ArrowLeft, MapPin, UserSquare, Edit as EditIcon, X, UserPlus } from 'lucide-react';
import LineupEditor from '../components/LineupEditor';
import LineupViewer from '../components/LineupViewer';
import MatchEventEditor from '../components/MatchEventEditor';
import { matchEventService } from '../services/matchEventService';
import '../assets/styles/theme.css';
import '../assets/styles/LineupEditor.css';

function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [teams, setTeams] = useState([]);
  const [groups, setGroups] = useState([]);
  const [venues, setVenues] = useState([]);
  const [groupTeams, setGroupTeams] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Lineup related state
  const [activeTab, setActiveTab] = useState('details');
  const [homeLineup, setHomeLineup] = useState(null);
  const [awayLineup, setAwayLineup] = useState(null);
  const [editingLineupTeamId, setEditingLineupTeamId] = useState(null);
  const [loadingLineups, setLoadingLineups] = useState(false);
  
  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch teams, groups, and venues data
        const [teamsData, groupsData, venuesData] = await Promise.all([
          teamService.getTeams(),
          teamService.getGroups(),
          matchService.getVenues()
        ]);
        
        setTeams(teamsData || []);
        setGroups(groupsData || []);
        setVenues(venuesData || []);
        
        // Build a mapping of group to team IDs
        const groupTeamsData = {};
        if (groupsData) {
          for (const group of groupsData) {
            const teamsInGroup = await teamService.getTeamsByGroup(group.id);
            groupTeamsData[group.id] = teamsInGroup.map(t => t.id);
          }
          setGroupTeams(groupTeamsData);
        }
        
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
            status: 'scheduled',
            venue_id: ''
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

  // Load lineup data when id changes or tab changes to lineups
  useEffect(() => {
    if (id && id !== 'new' && activeTab === 'lineups' && match) {
      const fetchLineups = async () => {
        try {
          setLoadingLineups(true);
          
          // Get home team lineup
          if (match.home_team_id) {
            const homeLineupData = await lineupService.getLineupByMatchTeam(match.id, match.home_team_id);
            setHomeLineup(homeLineupData);
          }
          
          // Get away team lineup
          if (match.away_team_id) {
            const awayLineupData = await lineupService.getLineupByMatchTeam(match.id, match.away_team_id);
            setAwayLineup(awayLineupData);
          }
          
          setLoadingLineups(false);
        } catch (err) {
          console.error('Error loading lineups:', err);
          setLoadingLineups(false);
        }
      };
      
      fetchLineups();
    }
  }, [id, activeTab, match]);

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
        status: match.status || 'scheduled',
        venue_id: match.venue_id || null
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
      
      // If the match is marked as completed and is a group match, update group standings
      if (savedMatch && savedMatch.status === 'completed' && savedMatch.group_id) {
        try {
          await teamService.updateTeamStatsForMatch(savedMatch);
          console.log('Group standings updated successfully');
        } catch (statsErr) {
          console.error('Error updating group standings:', statsErr);
          // Don't fail the whole operation if standings update fails
        }
      }
      
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
      setSuccessMessage(id === 'new' ? 'Match created successfully!' : 'Match updated successfully!');
      
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
        // Store group ID before deleting the match
        const groupId = match.group_id;
        
        // Delete the match
        await matchService.deleteMatch(id);
        
        // If this was a group match and completed, recalculate the group standings
        if (groupId && (match.status === 'completed' || match.status === 'in_progress')) {
          try {
            // Reset all team stats in the group
            await teamService.resetTeamStatsForGroup(groupId);
            
            // Recalculate standings without the deleted match
            await teamService.recalculateGroupStats(groupId);
            console.log('Group standings recalculated after match deletion');
          } catch (statsErr) {
            console.error('Error updating group standings after match deletion:', statsErr);
          }
        }
        
        // Navigate back to matches list
        navigate('/matches');
      } catch (err) {
        console.error('Error deleting match:', err);
        setError(err.message);
      }
    }
  };

  const handleStartMatch = async () => {
    try {
      // Update the match status to in_progress
      const updatedMatch = await matchService.updateMatch(id, {
        ...match,
        status: 'in_progress',
        home_score: 0,
        away_score: 0
      });
      
      // Update local state
      if (updatedMatch) {
        setMatch({
          ...updatedMatch,
          date: match.date,
          time: match.time
        });
        
        // If this is a group match, ensure team_group records exist
        if (updatedMatch.group_id) {
          try {
            // This will create team_group records if they don't exist or update them if they do
            await teamService.updateTeamStatsForMatch(updatedMatch);
            console.log('Group team records initialized');
          } catch (statsErr) {
            console.error('Error initializing group team records:', statsErr);
          }
        }
      }
    } catch (err) {
      console.error('Error starting match:', err);
      setError(err.message);
    }
  };

  const handleEndMatch = async () => {
    try {
      // Update the match status to completed
      const updatedMatch = await matchService.updateMatch(id, {
        ...match,
        status: 'completed'
      });
      
      // Update local state
      if (updatedMatch) {
        setMatch({
          ...updatedMatch,
          date: match.date,
          time: match.time
        });
        
        // Only update group stats if this is a group match
        if (updatedMatch.group_id) {
          try {
            // Update team standings in the group
            await teamService.updateTeamStatsForMatch(updatedMatch);
            console.log('Group standings updated successfully');
          } catch (statsErr) {
            console.error('Error updating group standings:', statsErr);
            // Don't fail the whole operation if standings update fails
          }
        }
      }
    } catch (err) {
      console.error('Error ending match:', err);
      setError(err.message);
    }
  };

  const handleScoreChange = async (team, value) => {
    try {
      // Ensure value is not negative
      const newValue = Math.max(0, value);
      
      // Create updated match object
      const updatedData = {
        ...match,
        [team === 'home' ? 'home_score' : 'away_score']: newValue
      };
      
      // Update in the database
      const updatedMatch = await matchService.updateMatch(id, updatedData);
      
      // Update local state
      if (updatedMatch) {
        setMatch({
          ...updatedMatch,
          date: match.date,
          time: match.time
        });
        
        // If this is a group match and it's in progress, update the group standings
        if (updatedMatch.status === 'in_progress' && updatedMatch.group_id) {
          try {
            await teamService.updateTeamStatsForMatch(updatedMatch);
            console.log('Live group standings updated');
          } catch (statsErr) {
            console.error('Error updating live group standings:', statsErr);
          }
        }
      }
    } catch (err) {
      console.error('Error updating score:', err);
      setError(err.message);
    }
  };

  // Handle editing lineup for a team
  const handleEditLineup = (teamId) => {
    setEditingLineupTeamId(teamId);
  };

  // Handle lineup save
  const handleLineupSave = async (savedLineup) => {
    // Update the appropriate lineup state
    if (savedLineup.team_id === match.home_team_id) {
      setHomeLineup(savedLineup);
    } else if (savedLineup.team_id === match.away_team_id) {
      setAwayLineup(savedLineup);
    }
    
    // Exit edit mode
    setEditingLineupTeamId(null);
    
    // Show success message
    setSuccessMessage('Team lineup has been saved successfully!');
    
    // Clear message after a few seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Handle cancel lineup edit
  const handleCancelLineupEdit = () => {
    setEditingLineupTeamId(null);
  };

  // Handle delete lineup
  const handleDeleteLineup = async (lineupId) => {
    if (window.confirm('Are you sure you want to delete this lineup?')) {
      try {
        await lineupService.deleteLineup(lineupId);
        
        // Update the relevant lineup state
        const lineup = homeLineup?.id === lineupId ? 'home' : 'away';
        if (lineup === 'home') {
          setHomeLineup(null);
        } else {
          setAwayLineup(null);
        }
        
        // Show success message
        setSuccessMessage('Team lineup has been deleted successfully!');
        
        // Clear message after a few seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        console.error('Error deleting lineup:', err);
        setError('Failed to delete lineup. Please try again.');
      }
    }
  };

  // Add handler for event save
  const handleEventSave = async (savedEvent, updatedMatch) => {
    try {
      // Always refresh the match data to get the latest state
      const refreshedMatch = await matchService.getMatchById(id);
      if (refreshedMatch) {
        // Update the entire match state with fresh data
        setMatch(refreshedMatch);
      }
    } catch (err) {
      console.error('Error refreshing match data:', err);
    }
    
    if (savedEvent) {
      setSuccessMessage('Match event has been saved successfully!');
    } else {
      setSuccessMessage('Match event has been deleted successfully!');
    }
    
    // Clear message after a few seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
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

  // Prepare display data
  const venueInfo = match?.venue ? `${match.venue.name}, ${match.venue.city}, ${match.venue.country}` : 'TBD';

  // Prepare team data for the lineup editor/viewer
  const homeTeam = match?.home_team || teams.find(t => t.id === match?.home_team_id) || null;
  const awayTeam = match?.away_team || teams.find(t => t.id === match?.away_team_id) || null;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
      <div className="header-gradient flex flex-col md:flex-row items-center justify-between mb-4 sm:mb-6 p-3 sm:p-4 md:p-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-0 text-center md:text-left">
          {id === 'new' ? 'Create New Match' : `${homeName} vs ${awayName}`}
        </h1>
        <Button 
          onClick={() => navigate('/matches')} 
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0 backdrop-blur-sm w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Matches
        </Button>
      </div>

      {successMessage && (
        <div className="mb-4 sm:mb-6">
          <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm">
            <div className="font-medium">Success</div>
            <div className="text-xs sm:text-sm">{successMessage}</div>
          </div>
        </div>
      )}

      {/* Tab navigation for match details and lineups */}
      {id !== 'new' && !isEditing && (
        <div className="mb-4 sm:mb-6">
          <div className="flex space-x-1 sm:space-x-2 md:space-x-4 border-b overflow-x-auto">
            <button
              className={`px-2 sm:px-4 py-1.5 sm:py-2 font-medium text-xs sm:text-sm md:text-base whitespace-nowrap ${
                activeTab === 'details' 
                  ? 'text-[var(--wc-blue)] border-b-2 border-[var(--wc-blue)]' 
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Match Details
            </button>
            <button
              className={`px-2 sm:px-4 py-1.5 sm:py-2 font-medium text-xs sm:text-sm md:text-base whitespace-nowrap ${
                activeTab === 'lineups' 
                  ? 'text-[var(--wc-blue)] border-b-2 border-[var(--wc-blue)]' 
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
              onClick={() => setActiveTab('lineups')}
            >
              Team Lineups
            </button>
            {(match.status === 'in_progress' || match.status === 'completed') && (
              <button
                className={`px-2 sm:px-4 py-1.5 sm:py-2 font-medium text-xs sm:text-sm md:text-base whitespace-nowrap ${
                  activeTab === 'events' 
                    ? 'text-[var(--wc-blue)] border-b-2 border-[var(--wc-blue)]' 
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
                onClick={() => setActiveTab('events')}
              >
                Match Events
              </button>
            )}
          </div>
        </div>
      )}

      {(activeTab === 'details' || isEditing || id === 'new') && (
        <Card className="match-card">
          <CardHeader className="card-header-metallic p-3 sm:p-4 md:p-6">
            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-[var(--text-heading)]">
              {isEditing ? 'Edit Match Details' : 'Match Details'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-3 sm:p-4 md:p-6">
            {isEditing ? (
              <Form className="space-y-4 sm:space-y-6">
                <FormField className="form-field">
                  <Label htmlFor="group_id">Group</Label>
                  <select 
                    id="group_id" 
                    name="group_id" 
                    value={match.group_id || ''}
                    onChange={handleChange}
                    className="w-full text-black bg-white"
                  >
                    <option value="">Select Group</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        Group {group.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField className="form-field">
                  <Label htmlFor="home_team_id">Home Team</Label>
                  <select 
                    id="home_team_id" 
                    name="home_team_id" 
                    value={match.home_team_id || ''}
                    onChange={handleChange}
                    disabled={!match.group_id}
                    className="w-full text-black bg-white"
                  >
                    <option value="">Select Home Team</option>
                    {filteredTeams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  {!match.group_id && 
                    <p className="text-sm text-amber-600 mt-1">Please select a group first</p>
                  }
                </FormField>

                <FormField className="form-field">
                  <Label htmlFor="away_team_id">Away Team</Label>
                  <select 
                    id="away_team_id" 
                    name="away_team_id" 
                    value={match.away_team_id || ''}
                    onChange={handleChange}
                    disabled={!match.group_id}
                    className="w-full text-black bg-white"
                  >
                    <option value="">Select Away Team</option>
                    {filteredTeams
                      .filter(team => team.id !== match.home_team_id) // Prevent selecting same team for both home and away
                      .map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  {!match.group_id && 
                    <p className="text-sm text-amber-600 mt-1">Please select a group first</p>
                  }
                </FormField>

                <FormField className="form-field">
                  <Label htmlFor="venue_id">Venue</Label>
                  <select 
                    id="venue_id" 
                    name="venue_id" 
                    value={match.venue_id || ''}
                    onChange={handleChange}
                    className="w-full text-black bg-white"
                  >
                    <option value="">Select Venue</option>
                    {venues.map(venue => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name} - {venue.city}, {venue.country}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField className="form-field">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date" 
                    name="date" 
                    type="date" 
                    value={match.date || ''}
                    onChange={handleChange}
                    className="w-full text-black bg-white"
                  />
                </FormField>

                <FormField className="form-field">
                  <Label htmlFor="time">Time</Label>
                  <Input 
                    id="time" 
                    name="time" 
                    type="time" 
                    value={match.time || ''}
                    onChange={handleChange}
                    className="w-full text-black bg-white"
                  />
                </FormField>

                <FormField className="form-field">
                  <Label htmlFor="status">Status</Label>
                  <select 
                    id="status" 
                    name="status" 
                    value={match.status || 'scheduled'}
                    onChange={handleChange}
                    className="w-full text-black bg-white"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </FormField>

                {match.status === 'completed' && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField className="col-span-1 form-field">
                      <Label htmlFor="home_score">Home Score</Label>
                      <Input 
                        id="home_score" 
                        name="home_score" 
                        type="number" 
                        min="0"
                        value={match.home_score || 0}
                        onChange={handleChange}
                        className="w-full text-black bg-white"
                      />
                    </FormField>
                    
                    <FormField className="col-span-1 form-field">
                      <Label htmlFor="away_score">Away Score</Label>
                      <Input 
                        id="away_score" 
                        name="away_score" 
                        type="number" 
                        min="0"
                        value={match.away_score || 0}
                        onChange={handleChange}
                        className="w-full text-black bg-white"
                      />
                    </FormField>
                  </div>
                )}
              </Form>
            ) : (
              <div className="space-y-4 sm:space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
                  {/* Home Team */}
                  <div className="p-3 sm:p-4 bg-[#f7f9fc] rounded-lg shadow-sm border border-[var(--border-color)]">
                    <div className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1 sm:mb-2">Home Team</div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {match.home_team?.flag_url ? (
                        <img 
                          src={match.home_team.flag_url} 
                          alt={homeName} 
                          className="w-6 sm:w-8 h-4 sm:h-6 object-cover shadow-sm border border-gray-200 rounded"
                        />
                      ) : (
                        <div className="w-6 sm:w-8 h-4 sm:h-6 bg-gray-200 rounded"></div>
                      )}
                      <div className="font-medium text-sm sm:text-base text-[var(--text-heading)]">{homeName}</div>
                    </div>
                  </div>
                  
                  {/* Score Display */}
                  <div className="p-3 sm:p-4 bg-[#e6edf5] rounded-lg shadow-sm border border-[var(--wc-silver-blue)] text-center">
                    <div className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1 sm:mb-2">Score</div>
                    <div className="text-xl sm:text-2xl font-bold text-[var(--text-heading)]">
                      {match.status === 'completed' || match.status === 'in_progress' ? (
                        <>
                          {canEditScores ? (
                            <div className="flex items-center justify-center gap-1 sm:gap-2">
                              <div className="flex items-center">
                                <Button
                                  variant="outline"
                                  className="h-6 sm:h-8 w-6 sm:w-8 p-0 rounded-full"
                                  onClick={() => handleScoreChange('home', (match.home_score || 0) - 1)}
                                >
                                  -
                                </Button>
                                <span className="mx-1 sm:mx-2">{match.home_score || 0}</span>
                                <Button
                                  variant="outline"
                                  className="h-6 sm:h-8 w-6 sm:w-8 p-0 rounded-full"
                                  onClick={() => handleScoreChange('home', (match.home_score || 0) + 1)}
                                >
                                  +
                                </Button>
                              </div>
                              <span className="mx-1 sm:mx-2">-</span>
                              <div className="flex items-center">
                                <Button
                                  variant="outline"
                                  className="h-6 sm:h-8 w-6 sm:w-8 p-0 rounded-full"
                                  onClick={() => handleScoreChange('away', (match.away_score || 0) - 1)}
                                >
                                  -
                                </Button>
                                <span className="mx-1 sm:mx-2">{match.away_score || 0}</span>
                                <Button
                                  variant="outline"
                                  className="h-6 sm:h-8 w-6 sm:w-8 p-0 rounded-full"
                                  onClick={() => handleScoreChange('away', (match.away_score || 0) + 1)}
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <span>{match.home_score || 0} - {match.away_score || 0}</span>
                          )}
                          
                          <div className="mt-1 sm:mt-2 text-xs sm:text-sm font-normal text-[var(--wc-blue)]">
                            {match.status === 'in_progress' ? 'LIVE' : 'COMPLETED'}
                          </div>
                        </>
                      ) : (
                        <span className="text-neutral-400">vs</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Away Team */}
                  <div className="p-3 sm:p-4 bg-[#f7f9fc] rounded-lg shadow-sm border border-[var(--border-color)]">
                    <div className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1 sm:mb-2">Away Team</div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {match.away_team?.flag_url ? (
                        <img 
                          src={match.away_team.flag_url} 
                          alt={awayName} 
                          className="w-6 sm:w-8 h-4 sm:h-6 object-cover shadow-sm border border-gray-200 rounded"
                        />
                      ) : (
                        <div className="w-6 sm:w-8 h-4 sm:h-6 bg-gray-200 rounded"></div>
                      )}
                      <div className="font-medium text-sm sm:text-base text-[var(--text-heading)]">{awayName}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    {/* Date & Time */}
                    <div className="p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-[var(--border-color)]">
                      <div className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1">Date & Time</div>
                      <div className="font-medium text-sm sm:text-base text-[var(--text-primary)]">{formattedDate}, {formattedTime}</div>
                    </div>
                    
                    {/* Group */}
                    <div className="p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-[var(--border-color)]">
                      <div className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1">Group</div>
                      <div className="font-medium text-sm sm:text-base text-[var(--text-primary)]">
                        {match.group ? `Group ${match.group.name}` : 'Not Assigned'}
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-[var(--border-color)]">
                      <div className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1">Venue</div>
                      <div className="font-medium text-sm sm:text-base text-[var(--text-primary)]">{venueInfo}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-0 sm:space-x-2 border-t border-[var(--border-color)] justify-end flex-col sm:flex-row">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (id === 'new') {
                      navigate('/matches');
                    } else {
                      setIsEditing(false);
                    }
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  className="w-full sm:w-auto bg-[var(--wc-blue)] hover:bg-[var(--wc-light-blue)] text-white"
                >
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleEdit}
                  className="w-full sm:w-auto"
                >
                  Edit
                </Button>
                
                {id !== 'new' && match.status === 'scheduled' && (
                  <Button 
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleStartMatch}
                  >
                    Start Match
                  </Button>
                )}
                
                {id !== 'new' && match.status === 'in_progress' && (
                  <Button 
                    className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={handleEndMatch}
                  >
                    End Match
                  </Button>
                )}
                
                {id !== 'new' && (
                  <Button 
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                )}
              </>
            )}
          </CardFooter>
        </Card>
      )}

      {activeTab === 'lineups' && id !== 'new' && !isEditing && (
        <div className="space-y-6">
          {loadingLineups ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="loader"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Home Team Lineup */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                    <img 
                      src={homeTeam?.flag_url} 
                      alt={homeTeam?.name} 
                      className="w-6 h-4 object-cover shadow-sm rounded-sm border border-gray-200"
                    />
                    {homeTeam?.name || 'Home Team'} Lineup
                  </h3>
                  
                  {match?.status === 'scheduled' && (
                    <>
                      {homeLineup ? (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleEditLineup(homeTeam?.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 shadow-sm"
                          >
                            <EditIcon className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteLineup(homeLineup.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-1 shadow-sm"
                          >
                            <X className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleEditLineup(homeTeam?.id)}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 shadow-sm"
                        >
                          <UserPlus className="h-4 w-4" />
                          Set Lineup
                        </Button>
                      )}
                    </>
                  )}
                </div>
                
                {editingLineupTeamId === homeTeam?.id ? (
                  <LineupEditor 
                    match={match} 
                    team={homeTeam} 
                    onSave={handleLineupSave} 
                    onCancel={handleCancelLineupEdit}
                  />
                ) : (
                  <LineupViewer lineup={homeLineup} team={homeTeam} />
                )}
              </div>

              {/* Away Team Lineup */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                    <img 
                      src={awayTeam?.flag_url} 
                      alt={awayTeam?.name} 
                      className="w-6 h-4 object-cover shadow-sm rounded-sm border border-gray-200"
                    />
                    {awayTeam?.name || 'Away Team'} Lineup
                  </h3>
                  
                  {match?.status === 'scheduled' && (
                    <>
                      {awayLineup ? (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleEditLineup(awayTeam?.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 shadow-sm"
                          >
                            <EditIcon className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteLineup(awayLineup.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-1 shadow-sm"
                          >
                            <X className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleEditLineup(awayTeam?.id)}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 shadow-sm"
                        >
                          <UserPlus className="h-4 w-4" />
                          Set Lineup
                        </Button>
                      )}
                    </>
                  )}
                </div>
                
                {editingLineupTeamId === awayTeam?.id ? (
                  <LineupEditor 
                    match={match} 
                    team={awayTeam} 
                    onSave={handleLineupSave} 
                    onCancel={handleCancelLineupEdit}
                  />
                ) : (
                  <LineupViewer lineup={awayLineup} team={awayTeam} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'events' && id !== 'new' && !isEditing && (
        <Card className="match-card">
          <CardHeader className="card-header-metallic p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl font-semibold text-[var(--text-heading)]">
              Match Events
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <MatchEventEditor 
              match={match} 
              onSave={handleEventSave}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MatchDetail; 