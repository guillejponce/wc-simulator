import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Input, Select, Label, Form, FormField, FormItem, FormLabel, FormDescription } from '../components/ui';
import { Globe, Users, Target, Award, Flag, Loader2 } from 'lucide-react';
import { teamService } from '../services/teamService';
import '../assets/styles/theme.css';

function Qualification() {
  const [activeTab, setActiveTab] = useState('uefa');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});

  const confederations = {
    uefa: { name: 'UEFA', code: 'UEFA', slots: 16 },
    conmebol: { name: 'CONMEBOL', code: 'CONMEBOL', slots: 6 },
    concacaf: { name: 'CONCACAF', code: 'CONCACAF', slots: 6 },
    caf: { name: 'CAF', code: 'CAF', slots: 9 },
    afc: { name: 'AFC', code: 'AFC', slots: 8 },
    ofc: { name: 'OFC', code: 'OFC', slots: 1 },
    playoff: { name: 'Play-off', code: 'PLAYOFF', slots: 2 }
  };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const teamsData = {};
        for (const [key, conf] of Object.entries(confederations)) {
          const confTeams = await teamService.getTeamsByConfederation(conf.code);
          teamsData[key] = confTeams;
        }
        setTeams(teamsData);
      } catch (err) {
        setError('Failed to fetch teams. Please try again later.');
        console.error('Error fetching teams:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setIsEditing(true);
  };

  const handleSaveTeam = async () => {
    try {
      if (selectedTeam) {
        // Find the team's original confederation
        const originalConf = Object.entries(teams).find(([_, confTeams]) => 
          confTeams.some(t => t.id === selectedTeam.id)
        )?.[0];

        if (!originalConf) {
          setError('Team not found in any confederation');
          return;
        }

        const conf = confederations[originalConf];
        if (!conf) {
          setError('Invalid confederation selected');
          return;
        }

        await teamService.updateTeamQualification(selectedTeam.id, selectedTeam.qualified);
        // Refresh teams after update
        const updatedTeams = await teamService.getTeamsByConfederation(conf.code);
        setTeams(prev => ({ ...prev, [originalConf]: updatedTeams }));
      }
      setIsEditing(false);
      setSelectedTeam(null);
      setError(null);
    } catch (err) {
      console.error('Error updating team:', err);
      setError('Failed to update team. Please try again.');
    }
  };

  const getQualifiedCount = () => {
    return Object.values(teams).reduce((total, confTeams) => {
      return total + confTeams.filter(team => team.qualified).length;
    }, 0);
  };

  const getRemainingSpots = (confKey) => {
    const conf = confederations[confKey];
    const qualifiedCount = teams[confKey]?.filter(team => team.qualified).length || 0;
    return conf.slots - qualifiedCount;
  };

  const getUnqualifiedTeams = (confKey) => {
    if (confKey === 'playoff') {
      // For playoff, return all unqualified teams from all confederations
      return Object.values(teams).flatMap(confTeams => 
        confTeams.filter(team => !team.qualified)
      );
    }
    // For other confederations, return only their unqualified teams
    return teams[confKey]?.filter(team => !team.qualified) || [];
  };

  const handleQualifyTeam = (team) => {
    // Find the team's original confederation
    const originalConf = Object.entries(teams).find(([_, confTeams]) => 
      confTeams.some(t => t.id === team.id)
    )?.[0];

    if (!originalConf) {
      setError('Team not found in any confederation');
      return;
    }

    const conf = confederations[originalConf];
    if (!conf) {
      setError('Invalid confederation selected');
      return;
    }

    // Update local state immediately
    setTeams(prev => {
      const updatedTeams = { ...prev };
      if (!updatedTeams[originalConf]) {
        updatedTeams[originalConf] = [];
      }
      updatedTeams[originalConf] = updatedTeams[originalConf].map(t => 
        t.id === team.id ? { ...t, qualified: true } : t
      );
      return updatedTeams;
    });

    // Add to pending changes for the team's original confederation
    setPendingChanges(prev => ({
      ...prev,
      [originalConf]: {
        ...(prev[originalConf] || {}),
        [team.id]: true
      }
    }));
  };

  const handleUnqualifyTeam = (team) => {
    // Find the team's original confederation
    const originalConf = Object.entries(teams).find(([_, confTeams]) => 
      confTeams.some(t => t.id === team.id)
    )?.[0];

    if (!originalConf) {
      setError('Team not found in any confederation');
      return;
    }

    // Update local state immediately
    setTeams(prev => {
      const updatedTeams = { ...prev };
      if (!updatedTeams[originalConf]) {
        updatedTeams[originalConf] = [];
      }
      updatedTeams[originalConf] = updatedTeams[originalConf].map(t => 
        t.id === team.id ? { ...t, qualified: false } : t
      );
      return updatedTeams;
    });

    // Add to pending changes for the team's original confederation
    setPendingChanges(prev => ({
      ...prev,
      [originalConf]: {
        ...(prev[originalConf] || {}),
        [team.id]: false
      }
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      
      // Save all pending changes for all confederations
      await Promise.all(
        Object.entries(pendingChanges).map(async ([confKey, changes]) => {
          const conf = confederations[confKey];
          if (!conf) return;

          // Save changes for this confederation
          await Promise.all(
            Object.entries(changes).map(([teamId, qualified]) =>
              teamService.updateTeamQualification(teamId, qualified)
            )
          );

          // Refresh teams for this confederation
          const updatedTeams = await teamService.getTeamsByConfederation(conf.code);
          setTeams(prev => ({
            ...prev,
            [confKey]: updatedTeams
          }));
        })
      );
      
      // Clear all pending changes
      setPendingChanges({});
      setError(null);
    } catch (err) {
      console.error('Error saving changes:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasPendingChanges = (confKey) => {
    // For playoff tab, check if there are any pending changes in any confederation
    if (confKey === 'playoff') {
      return Object.values(pendingChanges).some(changes => 
        Object.keys(changes).length > 0
      );
    }
    // For other tabs, check only their own pending changes
    return pendingChanges[confKey] && Object.keys(pendingChanges[confKey]).length > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="header-gradient">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Globe className="w-8 h-8" />
          Team Qualification
        </h1>
        <p className="text-xl opacity-90 mt-2">Qualify teams for the FIFA World Cup 2026™</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="text-sm text-[var(--text-primary)]">Total Teams</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-[var(--wc-red)] to-[var(--wc-blue)] text-transparent bg-clip-text">
            {Object.values(teams).reduce((total, confTeams) => total + confTeams.length, 0)}
          </div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-[var(--text-primary)]">Qualified Teams</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-[var(--wc-purple)] to-[var(--wc-blue)] text-transparent bg-clip-text">
            {getQualifiedCount()}
          </div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-[var(--text-primary)]">Total Spots</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-[var(--wc-blue)] to-[var(--wc-mint)] text-transparent bg-clip-text">
            {Object.values(confederations).reduce((total, conf) => total + conf.slots, 0)}
          </div>
        </div>
      </div>

      {/* Confederation Tabs */}
      <div className="card">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full p-0 bg-[var(--background-secondary)] rounded-t-[var(--card-radius)]">
            {Object.entries(confederations).map(([key, conf]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="flex-1 py-4 border-b-2 border-transparent data-[state=active]:border-[var(--wc-blue)] data-[state=active]:bg-white data-[state=active]:text-[var(--text-primary)] transition-colors"
              >
                {conf.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(confederations).map(([key, conf]) => (
            <TabsContent key={key} value={key} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">{conf.name} Teams</h2>
                <Button
                  onClick={handleSaveChanges}
                  disabled={loading || !hasPendingChanges(key)}
                  className="button-primary"
                >
                  {loading ? (
                    <div className="loader w-4 h-4" />
                  ) : (
                    <>
                      <Award className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>

              {/* Qualification Status */}
              <div className="card p-6 mb-6 bg-[var(--background-secondary)]">
                <div className="text-lg font-semibold text-[var(--text-primary)]">
                  {teams[key]?.filter(team => team.qualified).length || 0} / {conf.slots} spots filled
                </div>
                <div className="text-sm text-[var(--text-primary)] opacity-80 mt-1">
                  {getRemainingSpots(key)} spots remaining
                </div>
              </div>

              {/* Teams Table */}
              <Table>
                <TableHeader>
                  <TableRow className="table-header">
                    <TableHead className="text-[var(--text-primary)]">Team</TableHead>
                    <TableHead className="text-[var(--text-primary)]">FIFA Ranking</TableHead>
                    <TableHead className="text-[var(--text-primary)]">Status</TableHead>
                    <TableHead className="text-[var(--text-primary)]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams[key]?.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={team.flag_url || `https://flagcdn.com/w20/${team.code.toLowerCase()}.png`}
                            alt={`${team.name} flag`}
                            className="w-6 h-4 object-cover rounded shadow-sm"
                          />
                          <span className="font-medium text-[var(--text-primary)]">{team.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[var(--text-primary)]">{team.fifa_ranking}</TableCell>
                      <TableCell>
                        <Badge
                          className={team.qualified ? 'bg-[var(--wc-blue)] text-white' : 'bg-[var(--text-secondary)] text-white'}
                        >
                          {team.qualified ? "Qualified" : "Not Qualified"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {team.qualified ? (
                            <Button
                              onClick={() => handleUnqualifyTeam(team)}
                              className="bg-[var(--wc-red)] text-white hover:opacity-90"
                            >
                              Remove
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleQualifyTeam(team)}
                              className="bg-[var(--wc-blue)] text-white hover:opacity-90"
                            >
                              Qualify
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Edit Team Dialog */}
      {isEditing && selectedTeam && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Team</CardTitle>
          </CardHeader>
          <CardContent>
            <Form>
              <FormField>
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <Input value={selectedTeam.name} disabled />
                </FormItem>
              </FormField>
              <FormField>
                <FormItem>
                  <FormLabel>FIFA Ranking</FormLabel>
                  <Input value={selectedTeam.fifa_ranking} disabled />
                </FormItem>
              </FormField>
              <FormField>
                <FormItem>
                  <FormLabel>Qualification Status</FormLabel>
                  <Select
                    value={selectedTeam.qualified ? "qualified" : "not_qualified"}
                    onValueChange={(value) => {
                      setSelectedTeam({
                        ...selectedTeam,
                        qualified: value === "qualified"
                      });
                    }}
                  >
                    <option value="qualified">Qualified</option>
                    <option value="not_qualified">Not Qualified</option>
                  </Select>
                </FormItem>
              </FormField>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTeam}>Save Changes</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

export default Qualification; 