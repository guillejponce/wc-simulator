import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../components/ui';
import { Plus, Calendar } from 'lucide-react';
import { matchService, matchDateHelpers } from '../services/matchService';
import '../assets/styles/theme.css';

function Matches() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load matches
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        const matchesData = await matchService.getMatches();
        setMatches(matchesData || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading matches:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleCreateMatch = () => {
    navigate('/matches/new');
  };

  const renderMatchRow = (match) => {
    const homeTeamName = match.home_team?.name || 'TBD';
    const awayTeamName = match.away_team?.name || 'TBD';
    const formattedDate = matchDateHelpers.formatDate(match.datetime);
    const formattedTime = matchDateHelpers.formatTime(match.datetime);
    const groupName = match.group?.name ? `Group ${match.group.name}` : '';
    
    return (
      <TableRow 
        key={match.id} 
        className="hover:bg-neutral-50 cursor-pointer border-b border-neutral-200" 
        onClick={() => navigate(`/matches/${match.id}`)}
      >
        <TableCell>
          <div className="flex items-center gap-2">
            {match.home_team?.flag_url ? (
              <img 
                src={match.home_team.flag_url} 
                alt={homeTeamName} 
                className="w-8 h-6 object-cover shadow-sm border border-neutral-200 rounded"
              />
            ) : (
              <div className="w-8 h-6 bg-neutral-100 rounded flex items-center justify-center text-neutral-400">
                <span className="text-xs">TBD</span>
              </div>
            )}
            <span className="font-medium">{homeTeamName}</span>
          </div>
        </TableCell>
        <TableCell className="text-center">
          {match.status === 'completed' ? (
            <span className="font-bold text-lg">{match.home_score || 0} - {match.away_score || 0}</span>
          ) : match.status === 'in_progress' ? (
            <span className="font-medium text-emerald-600 animate-pulse">{match.home_score || 0} - {match.away_score || 0}</span>
          ) : (
            <span className="font-medium text-neutral-400">vs</span>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {match.away_team?.flag_url ? (
              <img 
                src={match.away_team.flag_url} 
                alt={awayTeamName} 
                className="w-8 h-6 object-cover shadow-sm border border-neutral-200 rounded"
              />
            ) : (
              <div className="w-8 h-6 bg-neutral-100 rounded flex items-center justify-center text-neutral-400">
                <span className="text-xs">TBD</span>
              </div>
            )}
            <span className="font-medium">{awayTeamName}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <div className="font-medium text-neutral-700">{formattedDate}</div>
            <div className="text-sm text-neutral-500">{formattedTime}</div>
          </div>
        </TableCell>
        <TableCell>
          {groupName ? (
            <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium text-sm">
              {groupName}
            </span>
          ) : (
            <span className="text-neutral-400">-</span>
          )}
        </TableCell>
        <TableCell>
          {match.status === 'scheduled' ? (
            <span className="status-indicator status-scheduled">Scheduled</span>
          ) : match.status === 'in_progress' ? (
            <span className="status-indicator status-live">Live</span>
          ) : (
            <span className="status-indicator status-completed">Completed</span>
          )}
        </TableCell>
      </TableRow>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="header-gradient flex flex-col md:flex-row items-center justify-between mb-6 p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <Calendar className="h-5 md:h-6 w-5 md:w-6" />
          <h1 className="text-xl md:text-2xl font-bold">Match Schedule</h1>
        </div>
        <Button 
          onClick={handleCreateMatch} 
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white shadow-md border-0 backdrop-blur-sm w-full md:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Match
        </Button>
      </div>

      <Card className="match-card">
        <CardHeader className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-b p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl font-semibold text-neutral-800">
            All Matches
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="p-4">
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded">
                <div className="font-medium">Error loading matches</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          )}
          
          {matches.length === 0 ? (
            <div className="text-center py-10 md:py-12 m-4 bg-neutral-50 rounded-lg border border-neutral-200 border-dashed">
              <div className="w-12 h-12 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="text-neutral-600 mb-4 text-base md:text-lg">No matches found</p>
              <Button 
                onClick={handleCreateMatch} 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create your first match
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-neutral-50">
                    <TableRow>
                      <TableHead className="font-bold text-neutral-700">Home Team</TableHead>
                      <TableHead className="font-bold text-neutral-700 text-center">Score</TableHead>
                      <TableHead className="font-bold text-neutral-700">Away Team</TableHead>
                      <TableHead className="font-bold text-neutral-700">Date</TableHead>
                      <TableHead className="font-bold text-neutral-700">Group</TableHead>
                      <TableHead className="font-bold text-neutral-700">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches.map(renderMatchRow)}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile view of matches */}
              <div className="md:hidden space-y-4 p-4">
                {matches.map((match) => {
                  const homeTeamName = match.home_team?.name || 'TBD';
                  const awayTeamName = match.away_team?.name || 'TBD';
                  const formattedDate = matchDateHelpers.formatDate(match.datetime);
                  const formattedTime = matchDateHelpers.formatTime(match.datetime);
                  const groupName = match.group?.name ? `Group ${match.group.name}` : '';
                  
                  return (
                    <div 
                      key={match.id}
                      className="border border-neutral-200 rounded-lg p-4 bg-white shadow-sm hover:shadow cursor-pointer"
                      onClick={() => navigate(`/matches/${match.id}`)}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-sm font-medium text-neutral-500">{formattedDate} • {formattedTime}</div>
                        {match.status === 'scheduled' ? (
                          <span className="status-indicator status-scheduled text-xs">Scheduled</span>
                        ) : match.status === 'in_progress' ? (
                          <span className="status-indicator status-live text-xs">Live</span>
                        ) : (
                          <span className="status-indicator status-completed text-xs">Completed</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          {match.home_team?.flag_url ? (
                            <img 
                              src={match.home_team.flag_url} 
                              alt={homeTeamName} 
                              className="w-7 h-5 object-cover shadow-sm border border-neutral-200 rounded"
                            />
                          ) : (
                            <div className="w-7 h-5 bg-neutral-100 rounded flex items-center justify-center text-neutral-400">
                              <span className="text-xs">TBD</span>
                            </div>
                          )}
                          <span className="font-medium truncate">{homeTeamName}</span>
                        </div>
                        
                        <div className="text-center min-w-[60px]">
                          {match.status === 'completed' ? (
                            <span className="font-bold text-lg">{match.home_score || 0} - {match.away_score || 0}</span>
                          ) : match.status === 'in_progress' ? (
                            <span className="font-medium text-emerald-600 animate-pulse">{match.home_score || 0} - {match.away_score || 0}</span>
                          ) : (
                            <span className="font-medium text-neutral-400">vs</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 justify-end flex-1">
                          <span className="font-medium truncate">{awayTeamName}</span>
                          {match.away_team?.flag_url ? (
                            <img 
                              src={match.away_team.flag_url} 
                              alt={awayTeamName} 
                              className="w-7 h-5 object-cover shadow-sm border border-neutral-200 rounded"
                            />
                          ) : (
                            <div className="w-7 h-5 bg-neutral-100 rounded flex items-center justify-center text-neutral-400">
                              <span className="text-xs">TBD</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {groupName && (
                        <div className="text-right">
                          <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                            {groupName}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Matches; 