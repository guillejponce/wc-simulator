import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Progress, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui';
import { Trophy, Users, Calendar, Flag, Target, Award, Settings } from 'lucide-react';

function SimulationHub() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="px-4 py-6 md:py-8 space-y-6">
      {/* Tournament Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-600" />
                FIFA World Cup 2026
              </CardTitle>
              <Badge variant="success" className="w-fit">In Progress</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Tournament Progress</span>
                <span className="font-medium">0%</span>
              </div>
              <Progress value={0} />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Current Stage</div>
                  <div className="font-medium">Not Started</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Matches Played</div>
                  <div className="font-medium">0/0</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Teams Remaining</div>
                  <div className="font-medium">0</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Teams Eliminated</div>
                  <div className="font-medium">0</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            <Button variant="outline" className="w-full sm:w-auto">
              <Settings className="w-4 h-4 mr-2" />
              Tournament Settings
            </Button>
            <Button className="w-full sm:w-auto">
              <Target className="w-4 h-4 mr-2" />
              Start Tournament
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto -mx-4 px-4">
          <TabsList className="w-full sm:w-auto mb-2 sm:mb-0">
            <TabsTrigger value="overview" className="flex-1 sm:flex-initial">Overview</TabsTrigger>
            <TabsTrigger value="matches" className="flex-1 sm:flex-initial">Matches</TabsTrigger>
            <TabsTrigger value="teams" className="flex-1 sm:flex-initial">Teams</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          {/* Recent Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-6 sm:py-8">
                No matches have been played yet.
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-6 sm:py-8">
                No upcoming matches scheduled.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                All Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-6 sm:py-8">
                No matches have been scheduled yet.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Participating Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-6 sm:py-8">
                No teams have been added yet.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SimulationHub; 