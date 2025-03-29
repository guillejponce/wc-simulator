import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SimulationHub from '../pages/SimulationHub';
import Qualification from '../pages/Qualification';
import Draw from '../pages/Draw';
import Groups from '../pages/Groups';
import Matches from '../pages/Matches';
import MatchDetail from '../pages/MatchDetail';
import Knockout from '../pages/Knockout';
import Teams from '../pages/Teams';
import TeamDetail from '../pages/TeamDetail';
import Stats from '../pages/Stats';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SimulationHub />} />
      <Route path="/qualification" element={<Qualification />} />
      <Route path="/draw" element={<Draw />} />
      <Route path="/groups" element={<Groups />} />
      <Route path="/matches" element={<Matches />} />
      <Route path="/matches/:id" element={<MatchDetail />} />
      <Route path="/knockout" element={<Knockout />} />
      <Route path="/teams" element={<Teams />} />
      <Route path="/teams/:id" element={<TeamDetail />} />
      <Route path="/stats" element={<Stats />} />
    </Routes>
  );
}

export default AppRoutes; 