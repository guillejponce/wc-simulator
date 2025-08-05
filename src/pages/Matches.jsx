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
import { Plus, Calendar, MapPin, Clock, AlertCircle } from 'lucide-react';
import { matchService, matchDateHelpers } from '../services/matchService';
import '../assets/styles/theme.css';

function Matches() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Group matches by date
  const groupedMatches = matches.reduce((acc, match) => {
    const date = matchDateHelpers.formatDate(match.datetime);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(match);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedMatches).sort((a, b) => {
    return new Date(a) - new Date(b);
  });

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
    const stageLabel = match.group?.name ? `Group ${match.group.name}` : (match.stage?.name || match.stage?.type || 'Knockout');
    const venueName = match.venue?.name || 'TBD';
    
    return (
      <TableRow 
        key={match.id} 
        className="hover:bg-[rgba(91,138,182,0.05)] cursor-pointer border-b border-neutral-200" 
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
              <div className="w-8 h-6 black rounded flex items-center justify-center text-neutral-400">
                <span className="text-xs">TBD</span>
              </div>
            )}
            <span className="font-medium text-[var(--text-primary)]">{homeTeamName}</span>
          </div>
        </TableCell>
        <TableCell className="text-center text-[var(--text-primary)]">
          {match.status === 'completed' ? (
            <span className="font-bold text-lg">{match.home_score || 0} - {match.away_score || 0}</span>
          ) : match.status === 'in_progress' ? (
            <span className="font-medium text-emerald-600 animate-pulse">{match.home_score || 0} - {match.away_score || 0}</span>
          ) : (
            <span className="font-medium text-[var(--text-muted)]">vs</span>
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
              <div className="w-8 h-6 bg-neutral-100 rounded flex items-center justify-center text-[var(--text-muted)]">
                <span className="text-xs">TBD</span>
              </div>
            )}
            <span className="font-medium text-[var(--text-primary)]">{awayTeamName}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <div className="font-medium text-[var(--text-primary)]">{formattedDate}</div>
            <div className="text-sm text-[var(--text-secondary)]">{formattedTime}</div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1 text-[var(--text-secondary)]">
            <MapPin className="w-3 h-3 text-[var(--text-muted)]" />
            <span className="text-sm">{venueName}</span>
          </div>
        </TableCell>
        <TableCell>
          {stageLabel ? (
            <span className="inline-block bg-[var(--wc-silver-blue)] bg-opacity-20 text-[var(--wc-blue)] px-3 py-1 rounded-full font-medium text-sm">
              {stageLabel}
            </span>
          ) : (
            <span className="text-[var(--text-muted)]">-</span>
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
      <div className="header-gradient flex flex-col md:flex-row items-center justify-between mb-6 p-4 md:p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <Calendar className="h-5 md:h-6 w-5 md:w-6 text-[var(--text-on-dark)]" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text-on-dark)]">Match Schedule</h1>
        </div>
        <Button 
          onClick={handleCreateMatch} 
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-[var(--text-on-dark)] shadow-md border-0 backdrop-blur-sm w-full md:w-auto transition-all duration-200 hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Match
        </Button>
      </div>

      <Card className="match-card shadow-lg border border-neutral-100">
        <CardHeader className="card-header-metallic p-4 md:p-6 border-b border-neutral-100">
          <CardTitle className="text-lg md:text-xl font-semibold text-[var(--text-heading)] flex items-center gap-2">
            <div className="w-1 h-6 bg-[var(--wc-blue)] rounded-full"></div>
            All Matches
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="p-4">
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <div className="font-medium">Error loading matches</div>
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            </div>
          )}
          
          {matches.length === 0 ? (
            <div className="text-center py-10 md:py-12 m-4 bg-neutral-50 rounded-lg border border-neutral-200 border-dashed">
              <div className="w-12 h-12 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="text-[var(--text-primary)] mb-4 text-base md:text-lg">No matches found</p>
              <Button 
                onClick={handleCreateMatch} 
                className="bg-gradient-to-r from-[var(--wc-blue)] to-[var(--wc-light-blue)] hover:from-[var(--wc-light-blue)] hover:to-[var(--wc-blue)] text-[var(--text-on-color)] shadow-md border-0 transition-all duration-200 hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create your first match
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="hidden md:block">
                {sortedDates.map((date, dateIndex) => (
                  <div key={date} className="mb-6 last:mb-0">
                    <div className="bg-[var(--wc-silver-blue)] bg-opacity-10 px-6 py-3 border-y border-[var(--wc-silver-blue)] border-opacity-20">
                      <div className="text-sm font-semibold text-[var(--wc-blue)] flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {date}
                      </div>
                    </div>
                    <Table>
                      <TableHeader className="bg-[#f7f9fc]">
                        <TableRow>
                          <TableHead className="font-bold text-[var(--text-primary)]">Home Team</TableHead>
                          <TableHead className="font-bold text-[var(--text-primary)] text-center">Score</TableHead>
                          <TableHead className="font-bold text-[var(--text-primary)]">Away Team</TableHead>
                          <TableHead className="font-bold text-[var(--text-primary)]">Time</TableHead>
                          <TableHead className="font-bold text-[var(--text-primary)]">Venue</TableHead>
                          <TableHead className="font-bold text-[var(--text-primary)]">Group</TableHead>
                          <TableHead className="font-bold text-[var(--text-primary)]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedMatches[date].map(renderMatchRow)}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>

              {/* Mobile view of matches */}
              <div className="md:hidden space-y-6 p-4">
                {sortedDates.map((date, dateIndex) => (
                  <div key={date} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-[var(--wc-silver-blue)] bg-opacity-10 px-4 py-3 border-b border-[var(--wc-silver-blue)] border-opacity-20">
                      <div className="text-sm font-semibold text-[var(--wc-blue)] flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {date}
                      </div>
                    </div>
                    <div className="space-y-3 p-4">
                      {groupedMatches[date].map((match) => {
                        const homeTeamName = match.home_team?.name || 'TBD';
                        const awayTeamName = match.away_team?.name || 'TBD';
                        const formattedTime = matchDateHelpers.formatTime(match.datetime);
                        const stageLabel = match.group?.name ? `Group ${match.group.name}` : (match.stage?.name || match.stage?.type || 'Knockout');
                        const venueName = match.venue?.name || 'TBD';
                        
                        return (
                          <div 
                            key={match.id}
                            className="border border-neutral-200 rounded-lg p-3 bg-white shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 hover:border-[var(--wc-silver-blue)]"
                            onClick={() => navigate(`/matches/${match.id}`)}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                                <Clock className="h-4 w-4 text-[var(--text-muted)]" />
                                {formattedTime}
                              </div>
                              {match.status === 'scheduled' ? (
                                <span className="status-indicator status-scheduled text-xs">Scheduled</span>
                              ) : match.status === 'in_progress' ? (
                                <span className="status-indicator status-live text-xs">Live</span>
                              ) : (
                                <span className="status-indicator status-completed text-xs">Completed</span>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-1.5 flex-1">
                                {match.home_team?.flag_url ? (
                                  <img 
                                    src={match.home_team.flag_url} 
                                    alt={match.home_team.code} 
                                    className="w-6 h-4 object-cover shadow-sm border border-neutral-200 rounded"
                                  />
                                ) : (
                                  <div className="w-6 h-4 bg-neutral-100 rounded flex items-center justify-center text-[var(--text-muted)]">
                                    <span className="text-[10px]">TBD</span>
                                  </div>
                                )}
                                <span className="font-medium truncate text-[var(--text-primary)] text-xs">{match.home_team?.code || 'TBD'}</span>
                              </div>
                              
                              <div className="text-center min-w-[50px]">
                                {match.status === 'completed' ? (
                                  <span className="font-bold text-base text-[var(--text-primary)]">{match.home_score || 0} - {match.away_score || 0}</span>
                                ) : match.status === 'in_progress' ? (
                                  <span className="font-medium text-emerald-600 animate-pulse">{match.home_score || 0} - {match.away_score || 0}</span>
                                ) : (
                                  <span className="font-medium text-[var(--text-muted)]">vs</span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-1.5 justify-end flex-1">
                                <span className="font-medium truncate text-[var(--text-primary)] text-xs">{match.away_team?.code || 'TBD'}</span>
                                {match.away_team?.flag_url ? (
                                  <img 
                                    src={match.away_team.flag_url} 
                                    alt={match.away_team.code} 
                                    className="w-6 h-4 object-cover shadow-sm border border-neutral-200 rounded"
                                  />
                                ) : (
                                  <div className="w-6 h-4 bg-neutral-100 rounded flex items-center justify-center text-[var(--text-muted)]">
                                    <span className="text-[10px]">TBD</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2 text-[10px]">
                              <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{venueName}</span>
                              </div>
                              
                              {stageLabel && (
                                <span className="inline-block bg-[var(--wc-silver-blue)] bg-opacity-20 text-[var(--wc-blue)] px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                                  {stageLabel}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Matches; 