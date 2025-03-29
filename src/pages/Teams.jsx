import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button,
} from '../components/ui';
import { teamService } from '../services/teamService';
import { Flag, Users, Search } from 'lucide-react';
import '../assets/styles/theme.css';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const navigate = useNavigate();
  
  // Define confederation options
  const confederations = [
    { code: 'ALL', name: 'All Regions' },
    { code: 'UEFA', name: 'UEFA (Europe)' },
    { code: 'CONMEBOL', name: 'CONMEBOL (South America)' },
    { code: 'CONCACAF', name: 'CONCACAF (North/Central America)' },
    { code: 'CAF', name: 'CAF (Africa)' },
    { code: 'AFC', name: 'AFC (Asia)' },
    { code: 'OFC', name: 'OFC (Oceania)' }
  ];

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true);
        const teamsData = await teamService.getTeams();
        
        // Only include qualified teams
        const qualifiedTeams = teamsData.filter(team => team.qualified);
        
        setTeams(qualifiedTeams);
        setFilteredTeams(qualifiedTeams);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading teams:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // Update filtered teams when search or region filter changes
  useEffect(() => {
    let result = teams;
    
    // Apply region filter
    if (regionFilter !== 'ALL') {
      result = result.filter(team => team.region === regionFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        team => team.name.toLowerCase().includes(query) || 
               team.code.toLowerCase().includes(query)
      );
    }
    
    setFilteredTeams(result);
  }, [searchQuery, regionFilter, teams]);

  const handleTeamClick = (teamId) => {
    navigate(`/teams/${teamId}`);
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
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="header-gradient mb-6 md:mb-8 p-4 md:p-6">
        <h1 className="text-2xl md:text-4xl font-bold flex flex-col md:flex-row items-center gap-2 md:gap-3">
          <Users className="w-6 h-6 md:w-8 md:h-8" />
          <span>Qualified Teams</span>
        </h1>
        <p className="text-lg md:text-xl opacity-90 mt-2 text-center md:text-left">
          {filteredTeams.length} teams qualified for the FIFA World Cup 2026™
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-1/2">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border-gray-300 pl-10 p-2.5 bg-white border shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="block w-full md:w-1/2 p-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
        >
          {confederations.map(conf => (
            <option key={conf.code} value={conf.code}>
              {conf.name}
            </option>
          ))}
        </select>
      </div>

      {filteredTeams.length === 0 ? (
        <div className="text-center py-10 md:py-12 bg-neutral-50 rounded-lg border border-neutral-200 border-dashed">
          <Flag className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-4 text-lg font-medium text-neutral-900">No teams found</h3>
          <p className="mt-2 text-sm text-neutral-500">
            Try changing your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTeams.map((team) => (
            <Card 
              key={team.id} 
              className="team-card cursor-pointer transform transition-transform hover:scale-105 hover:shadow-lg"
              onClick={() => handleTeamClick(team.id)}
            >
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  {team.flag_url ? (
                    <img
                      src={team.flag_url}
                      alt={`${team.name} flag`}
                      className="w-10 h-6 object-cover rounded shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-6 bg-gray-200 rounded"></div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg text-[var(--text-heading)]">{team.name}</h3>
                    <span className="text-sm text-[var(--text-secondary)]">{team.code}</span>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-secondary)]">{team.region}</span>
                    <span className="text-sm font-medium text-white bg-[var(--wc-blue)] px-2 py-1 rounded-full">
                      Qualified
                    </span>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] mt-2">
                    FIFA Ranking: #{team.fifa_ranking || 'N/A'}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Teams; 