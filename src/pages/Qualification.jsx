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

  const confederations = {
    uefa: { name: 'UEFA', code: 'UEFA', slots: 16 },
    conmebol: { name: 'CONMEBOL', code: 'CONMEBOL', slots: 6 },
    concacaf: { name: 'CONCACAF', code: 'CONCACAF', slots: 6 },
    caf: { name: 'CAF', code: 'CAF', slots: 9 },
    afc: { name: 'AFC', code: 'AFC', slots: 8 },
    ofc: { name: 'OFC', code: 'OFC', slots: 1 },
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
        await teamService.updateTeamQualification(selectedTeam.id, selectedTeam.qualified);
        // Refresh teams after update
        const updatedTeams = await teamService.getTeamsByConfederation(confederations[activeTab].code);
        setTeams(prev => ({ ...prev, [activeTab]: updatedTeams }));
      }
      setIsEditing(false);
      setSelectedTeam(null);
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
              <div className="text-sm text-gray-500">Remaining Spots</div>
              <div className="text-2xl font-bold">48</div>
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
                <CardTitle className="flex items-center gap-2">
                  <Flag className="w-5 h-5" />
                  {conf.name} Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTeam(team)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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