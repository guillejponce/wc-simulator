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
import { Plus } from 'lucide-react';
import { matchService, matchDateHelpers } from '../services/matchService';

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
      <TableRow key={match.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/matches/${match.id}`)}>
        <TableCell>
          <div className="flex items-center gap-2">
            {match.home_team?.flag_url && (
              <img 
                src={match.home_team.flag_url} 
                alt={homeTeamName} 
                className="w-6 h-4 object-cover"
              />
            )}
            {homeTeamName}
          </div>
        </TableCell>
        <TableCell>
          {match.status === 'completed' 
            ? `${match.home_score || 0} - ${match.away_score || 0}` 
            : 'vs'}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {match.away_team?.flag_url && (
              <img 
                src={match.away_team.flag_url} 
                alt={awayTeamName} 
                className="w-6 h-4 object-cover"
              />
            )}
            {awayTeamName}
          </div>
        </TableCell>
        <TableCell>
          <div>
            <div>{formattedDate}</div>
            <div className="text-xs text-gray-500">{formattedTime}</div>
          </div>
        </TableCell>
        <TableCell>{groupName}</TableCell>
        <TableCell>
          <span className={`px-2 py-1 rounded text-xs font-medium
            ${match.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
              match.status === 'in_progress' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'}`}
          >
            {match.status === 'scheduled' ? 'Scheduled' :
             match.status === 'in_progress' ? 'Live' :
             'Completed'}
          </span>
        </TableCell>
      </TableRow>
    );
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading matches...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Matches</h1>
        <Button onClick={handleCreateMatch}>Create Match</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Matches</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Error: {error}
            </div>
          )}
          
          {matches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No matches found</p>
              <Button onClick={handleCreateMatch}>Create your first match</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Home Team</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Away Team</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map(renderMatchRow)}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Matches; 