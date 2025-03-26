import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Input, Select, Label, Form, FormField, FormItem, FormLabel, FormDescription } from '../components/ui';
import { Globe, Users, Target, Award, Flag, Loader2 } from 'lucide-react';
import { teamService } from '../services/teamService';

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
        const conf = confederations[activeTab];
        const currentQualifiedCount = teams[activeTab].filter(t => t.qualified).length;
        
        // Check if we're trying to qualify a team when all slots are filled
        if (selectedTeam.qualified && !teams[activeTab].find(t => t.id === selectedTeam.id)?.qualified) {
          if (currentQualifiedCount >= conf.slots) {
            setError(`Cannot qualify more teams. ${conf.name} has reached its maximum of ${conf.slots} slots.`);
            return;
          }
        }

        await teamService.updateTeamQualification(selectedTeam.id, selectedTeam.qualified);
        // Refresh teams after update
        const updatedTeams = await teamService.getTeamsByConfederation(conf.code);
        setTeams(prev => ({ ...prev, [activeTab]: updatedTeams }));
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
    const conf = confederations[activeTab];
    const currentQualifiedCount = teams[activeTab]?.filter(t => t.qualified).length || 0;
    
    if (currentQualifiedCount >= conf.slots) {
      setError(`Cannot qualify more teams. ${conf.name} has reached its maximum of ${conf.slots} slots.`);
      return;
    }

    // Update local state immediately
    if (activeTab === 'playoff') {
      // For playoff, update the team in its original confederation
      const originalConf = Object.entries(teams).find(([_, confTeams]) => 
        confTeams.some(t => t.id === team.id)
      )?.[0];
      
      if (originalConf) {
        setTeams(prev => ({
          ...prev,
          [originalConf]: prev[originalConf].map(t => 
            t.id === team.id ? { ...t, qualified: true } : t
          )
        }));
      }
    } else {
      setTeams(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].map(t => 
          t.id === team.id ? { ...t, qualified: true } : t
        )
      }));
    }

    // Add to pending changes for current confederation
    setPendingChanges(prev => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || {}),
        [team.id]: true
      }
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const conf = confederations[activeTab];
      const currentConfChanges = pendingChanges[activeTab] || {};
      
      // Save all pending changes for current confederation
      await Promise.all(
        Object.entries(currentConfChanges).map(([teamId, qualified]) =>
          teamService.updateTeamQualification(teamId, qualified)
        )
      );

      // Refresh teams after update
      const updatedTeams = await teamService.getTeamsByConfederation(conf.code);
      setTeams(prev => ({ ...prev, [activeTab]: updatedTeams }));
      
      // Clear pending changes for current confederation
      setPendingChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[activeTab];
        return newChanges;
      });
      
      setError(null);
    } catch (err) {
      console.error('Error saving changes:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasPendingChanges = (confKey) => {
    return Object.keys(pendingChanges[confKey] || {}).length > 0;
  };

  const handleUnqualifyTeam = (team) => {
    // Update local state immediately
    setTeams(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(t => 
        t.id === team.id ? { ...t, qualified: false } : t
      )
    }));

    // Add to pending changes for current confederation
    setPendingChanges(prev => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || {}),
        [team.id]: false
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Team Qualification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Total Teams</div>
              <div className="text-2xl font-bold">
                {Object.values(teams).reduce((total, confTeams) => total + confTeams.length, 0)}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Qualified Teams</div>
              <div className="text-2xl font-bold">{getQualifiedCount()}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Total Spots</div>
              <div className="text-2xl font-bold">
                {Object.values(confederations).reduce((total, conf) => total + conf.slots, 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confederation Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab} className="space-y-4">
        <TabsList>
          {Object.entries(confederations).map(([key, conf]) => (
            <TabsTrigger key={key} value={key}>
              {conf.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(confederations).map(([key, conf]) => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="w-5 h-5" />
                    {conf.name} Teams
                  </CardTitle>
                  <Button 
                    onClick={handleSaveChanges}
                    disabled={loading || !hasPendingChanges(key)}
                    className={`flex items-center gap-2 ${hasPendingChanges(key) ? 'bg-green-600 hover:bg-green-700' : 'opacity-50'}`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {hasPendingChanges(key) && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm text-yellow-800">
                      You have {Object.keys(pendingChanges[key] || {}).length} unsaved changes. Click "Save Changes" to apply them.
                    </div>
                  </div>
                )}

                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Qualification Status</div>
                  <div className="text-lg font-semibold">
                    {teams[key]?.filter(team => team.qualified).length || 0} / {conf.slots} spots filled
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {getRemainingSpots(key)} spots remaining
                  </div>
                </div>

                {/* Empty Slots Section */}
                {getRemainingSpots(key) > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Available Slots</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: Math.min(getRemainingSpots(key), 12) }).map((_, index) => (
                        <div key={index} className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                          <div className="text-sm text-gray-500 mb-2">Group {String.fromCharCode(65 + index)}</div>
                          <Select
                            onChange={(e) => {
                              const team = getUnqualifiedTeams(key).find(t => t.id === e.target.value);
                              if (team) {
                                handleQualifyTeam(team);
                              }
                            }}
                          >
                            <option value="">Select a team</option>
                            {getUnqualifiedTeams(key).map(team => (
                              <option key={team.id} value={team.id}>
                                {team.name} (Rank: {team.fifa_ranking})
                              </option>
                            ))}
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 py-8">
                    {error}
                  </div>
                ) : teams[key]?.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No teams found for this confederation.
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">All Teams</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Team</TableHead>
                          <TableHead>FIFA Ranking</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teams[key]?.map((team) => (
                          <TableRow key={team.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <img
                                  src={team.flag_url || `https://flagcdn.com/w20/${team.code.toLowerCase()}.png`}
                                  alt={`${team.name} flag`}
                                  className="w-6 h-4 object-cover rounded"
                                />
                                {team.name}
                              </div>
                            </TableCell>
                            <TableCell>{team.fifa_ranking}</TableCell>
                            <TableCell>
                              <Badge variant={team.qualified ? "success" : "secondary"}>
                                {team.qualified ? "Qualified" : "Not Qualified"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {team.qualified ? (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleUnqualifyTeam(team)}
                                  >
                                    Remove
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditTeam(team)}
                                  >
                                    Edit
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

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