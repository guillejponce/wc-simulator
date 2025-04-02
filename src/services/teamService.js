import { supabase } from '../supabase';

export const teamService = {
  async getTeams() {
    const { data, error } = await supabase
      .from('team')
      .select('*')
      .order('fifa_ranking', { ascending: true });

    if (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }

    return data;
  },

  async getTeamsByConfederation(confederation) {
    const { data, error } = await supabase
      .from('team')
      .select('*')
      .eq('region', confederation)
      .order('fifa_ranking', { ascending: true });

    if (error) {
      console.error('Error fetching teams by confederation:', error);
      throw error;
    }

    return data;
  },

  async getGroups() {
    const { data, error } = await supabase
      .from('group')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }

    return data;
  },

  async getTeamsByGroup(groupId) {
    try {
      // Get the group to find which team positions are filled
      const { data: group, error: groupError } = await supabase
        .from('group')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) {
        console.error('Error fetching group:', groupError);
        throw groupError;
      }

      if (!group) {
        console.error('Group not found:', groupId);
        return [];
      }

      // Collect all team IDs from the group (non-null values)
      const teamIds = [
        group.team1_id,
        group.team2_id,
        group.team3_id,
        group.team4_id
      ].filter(id => id !== null);

      if (teamIds.length === 0) {
        return [];
      }

      // Fetch the team details for all teams in the group
      const { data: teams, error: teamsError } = await supabase
        .from('team')
        .select('*')
        .in('id', teamIds);

      if (teamsError) {
        console.error('Error fetching teams by group:', teamsError);
        throw teamsError;
      }

      return teams;
    } catch (err) {
      console.error('Error getting teams by group:', err);
      throw err;
    }
  },

  async updateTeamQualification(teamId, qualified) {
    const { data, error } = await supabase
      .from('team')
      .update({ qualified })
      .eq('id', teamId)
      .select()
      .single();

    if (error) {
      console.error('Error updating team qualification:', error);
      throw error;
    }

    return data;
  },

  async getGroupAssignments() {
    const { data, error } = await supabase
      .from('group_teams_view')
      .select('*')
      .order('group_name');

    if (error) {
      console.error('Error fetching group assignments:', error);
      throw error;
    }

    // Transform the data to match the expected format
    return data.map(group => {
      const assignments = [];
      
      // Add team1 if exists
      if (group.team1_id) {
        assignments.push({
          team_id: group.team1_id,
          group_id: group.group_id,
          position: 1,
          team: {
            id: group.team1_id,
            name: group.team1_name,
            code: group.team1_code,
            flag_url: group.team1_flag
          },
          group: {
            id: group.group_id,
            letter: group.group_name
          }
        });
      }

      // Add team2 if exists
      if (group.team2_id) {
        assignments.push({
          team_id: group.team2_id,
          group_id: group.group_id,
          position: 2,
          team: {
            id: group.team2_id,
            name: group.team2_name,
            code: group.team2_code,
            flag_url: group.team2_flag
          },
          group: {
            id: group.group_id,
            letter: group.group_name
          }
        });
      }

      // Add team3 if exists
      if (group.team3_id) {
        assignments.push({
          team_id: group.team3_id,
          group_id: group.group_id,
          position: 3,
          team: {
            id: group.team3_id,
            name: group.team3_name,
            code: group.team3_code,
            flag_url: group.team3_flag
          },
          group: {
            id: group.group_id,
            letter: group.group_name
          }
        });
      }

      // Add team4 if exists
      if (group.team4_id) {
        assignments.push({
          team_id: group.team4_id,
          group_id: group.group_id,
          position: 4,
          team: {
            id: group.team4_id,
            name: group.team4_name,
            code: group.team4_code,
            flag_url: group.team4_flag
          },
          group: {
            id: group.group_id,
            letter: group.group_name
          }
        });
      }

      return assignments;
    }).flat();
  },

  async saveGroupAssignment(teamId, groupLetter, position) {
    try {
      console.log('Saving group assignment:', { teamId, groupLetter, position });

      // First, get the group ID for the given letter
      const { data: groupData, error: groupError } = await supabase
        .from('group')
        .select('*')
        .eq('name', groupLetter)
        .single();

      if (groupError) {
        console.error('Error fetching group:', groupError);
        throw groupError;
      }

      if (!groupData) {
        console.error('Group not found:', groupLetter);
        throw new Error('Group not found');
      }

      console.log('Found group data:', groupData);

      // If position is null, remove the team from all positions
      if (position === null) {
        const updates = {};
        // Check each position and update if the team is there
        for (let i = 1; i <= 4; i++) {
          const columnName = `team${i}_id`;
          if (groupData[columnName] === teamId) {
            updates[columnName] = null;
            console.log(`Found team in position ${i}, will update ${columnName}`);
          }
        }

        // Only update if we found the team in a position
        if (Object.keys(updates).length > 0) {
          console.log('Updating group with:', updates);
          const { error: updateError } = await supabase
            .from('group')
            .update(updates)
            .eq('id', groupData.id);

          if (updateError) {
            console.error('Error updating group:', updateError);
            throw updateError;
          }
        } else {
          console.log('Team not found in any position, no update needed');
        }
        return null;
      }

      // Otherwise, update the group with the team in the specified position
      const columnName = `team${position}_id`;
      console.log('Updating group with:', { [columnName]: teamId });
      
      const { data, error } = await supabase
        .from('group')
        .update({
          [columnName]: teamId
        })
        .eq('id', groupData.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating group:', error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error saving group assignment:', err);
      throw err;
    }
  },

  async initializeGroups() {
    try {
      // First, check if groups already exist
      const { data: existingGroups, error: checkError } = await supabase
        .from('group')
        .select('*');

      if (checkError) {
        throw checkError;
      }

      // If groups don't exist, create them
      if (!existingGroups || existingGroups.length === 0) {
        const groups = Array.from({ length: 12 }, (_, i) => ({
          letter: String.fromCharCode(65 + i)
        }));

        const { error: insertError } = await supabase
          .from('group')
          .insert(groups);

        if (insertError) {
          throw insertError;
        }
      }

      return true;
    } catch (err) {
      console.error('Error initializing groups:', err);
      throw err;
    }
  },

  async getTeamGroupRecord(teamId, groupId) {
    const { data, error } = await supabase
      .from('team_group')
      .select('*')
      .eq('team_id', teamId)
      .eq('group_id', groupId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error fetching team group record:', error);
      throw error;
    }

    return data;
  },

  async createOrUpdateTeamGroupRecord(teamId, groupId, stats) {
    try {
      // First check if record exists
      const existingRecord = await this.getTeamGroupRecord(teamId, groupId);
      
      if (existingRecord) {
        // Update existing record
        const { data, error } = await supabase
          .from('team_group')
          .update(stats)
          .eq('team_id', teamId)
          .eq('group_id', groupId)
          .select()
          .single();

        if (error) {
          console.error('Error updating team group record:', error);
          throw error;
        }

        return data;
      } else {
        // Create new record
        const newRecord = {
          team_id: teamId,
          group_id: groupId,
          ...stats
        };

        const { data, error } = await supabase
          .from('team_group')
          .insert([newRecord])
          .select()
          .single();

        if (error) {
          console.error('Error creating team group record:', error);
          throw error;
        }

        return data;
      }
    } catch (err) {
      console.error('Error in createOrUpdateTeamGroupRecord:', err);
      throw err;
    }
  },

  async updateTeamStatsForMatch(match) {
    if (!match.group_id || !match.home_team_id || !match.away_team_id) {
      console.log('Match is not a group match or missing team information');
      return null;
    }

    try {
      // Get the match's current status to determine if this is a new match or an edit
      const { data: existingMatch, error: matchError } = await supabase
        .from('match')
        .select('status, home_score, away_score')
        .eq('id', match.id)
        .single();

      if (matchError && matchError.code !== 'PGRST116') { // PGRST116 means no row found
        console.error('Error checking existing match:', matchError);
        throw matchError;
      }

      // If this is a live match or score change, reset and recalculate all stats
      if (match.status === 'in_progress' || 
          (existingMatch && 
           (existingMatch.home_score !== match.home_score || 
            existingMatch.away_score !== match.away_score))) {
        console.log('Live match or score change detected - resetting and recalculating stats');
        // Reset stats for the group
        await this.resetTeamStatsForGroup(match.group_id);
        
        // Recalculate all stats for the group
        await this.recalculateGroupStats(match.group_id);
        return true;
      }

      // For completed matches, proceed with normal update
      // Get current records for both teams
      const homeTeamRecord = await this.getTeamGroupRecord(match.home_team_id, match.group_id) || {
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        position: 0
      };
      
      const awayTeamRecord = await this.getTeamGroupRecord(match.away_team_id, match.group_id) || {
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        position: 0
      };

      // Calculate new stats based on match result
      const homeScore = match.home_score || 0;
      const awayScore = match.away_score || 0;
      
      // Determine if this is a new result or an edit of an existing result
      const isNewCompletion = !existingMatch || existingMatch.status !== 'completed';

      // Calculate points and results
      let homePoints = 0;
      let awayPoints = 0;
      let homeWon = 0;
      let homeLost = 0;
      let homeDrawn = 0;
      let awayWon = 0;
      let awayLost = 0;
      let awayDrawn = 0;
      
      if (homeScore > awayScore) {
        homePoints = 3;
        homeWon = 1;
        awayLost = 1;
      } else if (homeScore < awayScore) {
        awayPoints = 3;
        awayWon = 1;
        homeLost = 1;
      } else {
        homePoints = 1;
        awayPoints = 1;
        homeDrawn = 1;
        awayDrawn = 1;
      }

      // Update home team record
      const updatedHomeTeam = {
        played: homeTeamRecord.played + (isNewCompletion ? 1 : 0),
        won: homeTeamRecord.won + homeWon,
        drawn: homeTeamRecord.drawn + homeDrawn,
        lost: homeTeamRecord.lost + homeLost,
        goals_for: homeTeamRecord.goals_for + homeScore,
        goals_against: homeTeamRecord.goals_against + awayScore,
        points: homeTeamRecord.points + homePoints
      };
      
      updatedHomeTeam.goal_difference = updatedHomeTeam.goals_for - updatedHomeTeam.goals_against;

      // Update away team record
      const updatedAwayTeam = {
        played: awayTeamRecord.played + (isNewCompletion ? 1 : 0),
        won: awayTeamRecord.won + awayWon,
        drawn: awayTeamRecord.drawn + awayDrawn,
        lost: awayTeamRecord.lost + awayLost,
        goals_for: awayTeamRecord.goals_for + awayScore,
        goals_against: awayTeamRecord.goals_against + homeScore,
        points: awayTeamRecord.points + awayPoints
      };
      
      updatedAwayTeam.goal_difference = updatedAwayTeam.goals_for - updatedAwayTeam.goals_against;

      // Save both team records
      await Promise.all([
        this.createOrUpdateTeamGroupRecord(match.home_team_id, match.group_id, updatedHomeTeam),
        this.createOrUpdateTeamGroupRecord(match.away_team_id, match.group_id, updatedAwayTeam)
      ]);

      // Update team positions within the group
      await this.updateGroupPositions(match.group_id);

      return true;
    } catch (err) {
      console.error('Error updating team stats for match:', err);
      throw err;
    }
  },

  async resetTeamStatsForGroup(groupId) {
    try {
      // Get all team records for this group
      const { data: teamRecords, error } = await supabase
        .from('team_group')
        .select('team_id')
        .eq('group_id', groupId);

      if (error) {
        console.error('Error fetching team records for reset:', error);
        throw error;
      }

      // Reset all team stats to zero
      const updates = teamRecords.map(record => {
        return supabase
          .from('team_group')
          .update({
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goals_for: 0,
            goals_against: 0,
            goal_difference: 0,
            points: 0,
            position: 0
          })
          .eq('team_id', record.team_id)
          .eq('group_id', groupId);
      });

      await Promise.all(updates);
      return true;
    } catch (err) {
      console.error('Error resetting team stats:', err);
      throw err;
    }
  },

  async resetAllGroupStats() {
    try {
      // Get all groups
      const { data: groups, error: groupsError } = await supabase
        .from('group')
        .select('id');

      if (groupsError) {
        console.error('Error fetching groups:', groupsError);
        throw groupsError;
      }

      // Reset stats for each group
      const resetPromises = groups.map(group => this.resetTeamStatsForGroup(group.id));
      await Promise.all(resetPromises);

      // Recalculate stats for each group
      const recalcPromises = groups.map(group => this.recalculateGroupStats(group.id));
      await Promise.all(recalcPromises);

      return true;
    } catch (err) {
      console.error('Error resetting all group stats:', err);
      throw err;
    }
  },

  async recalculateGroupStats(groupId) {
    try {
      // Fetch all completed matches for this group
      const { data: matches, error } = await supabase
        .from('match')
        .select('*')
        .eq('group_id', groupId)
        .eq('status', 'completed');

      if (error) {
        console.error('Error fetching completed matches:', error);
        throw error;
      }

      // Get all team IDs for this group to ensure we update all teams
      // This is important when a match is deleted and we need to update stats
      const { data: teamsInGroup, error: teamError } = await supabase
        .from('team_group')
        .select('team_id')
        .eq('group_id', groupId);
        
      if (teamError) {
        console.error('Error fetching teams in group:', teamError);
        throw teamError;
      }
      
      // Create a map to track team stats, initialized with all teams in the group
      const teamStats = {};
      
      // Initialize all teams with zero stats
      teamsInGroup?.forEach(record => {
        teamStats[record.team_id] = {
          team_id: record.team_id,
          group_id: groupId,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goals_for: 0,
          goals_against: 0,
          goal_difference: 0,
          points: 0,
          position: 0
        };
      });

      // If there are no matches to calculate, just update with zeros
      if (!matches || matches.length === 0) {
        console.log('No completed matches to recalculate for group:', groupId);
        
        // Update all teams with zeroed stats
        if (teamsInGroup && teamsInGroup.length > 0) {
          const updates = teamsInGroup.map(team => 
            this.createOrUpdateTeamGroupRecord(team.team_id, groupId, teamStats[team.team_id])
          );
          await Promise.all(updates);
          await this.updateGroupPositions(groupId);
        }
        
        return true;
      }

      // Process each match to calculate stats
      for (const match of matches) {
        // Skip invalid matches (missing team IDs)
        if (!match.home_team_id || !match.away_team_id) {
          console.warn('Skipping invalid match:', match.id);
          continue;
        }
        
        // Process home team
        if (!teamStats[match.home_team_id]) {
          teamStats[match.home_team_id] = {
            team_id: match.home_team_id,
            group_id: groupId,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goals_for: 0,
            goals_against: 0,
            goal_difference: 0,
            points: 0,
            position: 0
          };
        }

        // Process away team
        if (!teamStats[match.away_team_id]) {
          teamStats[match.away_team_id] = {
            team_id: match.away_team_id,
            group_id: groupId,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goals_for: 0,
            goals_against: 0,
            goal_difference: 0,
            points: 0,
            position: 0
          };
        }

        const homeScore = match.home_score || 0;
        const awayScore = match.away_score || 0;
        
        // Update played games
        teamStats[match.home_team_id].played += 1;
        teamStats[match.away_team_id].played += 1;
        
        // Update goals
        teamStats[match.home_team_id].goals_for += homeScore;
        teamStats[match.home_team_id].goals_against += awayScore;
        teamStats[match.away_team_id].goals_for += awayScore;
        teamStats[match.away_team_id].goals_against += homeScore;
        
        // Update result (win/draw/loss)
        if (homeScore > awayScore) {
          // Home team wins
          teamStats[match.home_team_id].won += 1;
          teamStats[match.home_team_id].points += 3;
          teamStats[match.away_team_id].lost += 1;
        } else if (homeScore < awayScore) {
          // Away team wins
          teamStats[match.away_team_id].won += 1;
          teamStats[match.away_team_id].points += 3;
          teamStats[match.home_team_id].lost += 1;
        } else {
          // Draw
          teamStats[match.home_team_id].drawn += 1;
          teamStats[match.home_team_id].points += 1;
          teamStats[match.away_team_id].drawn += 1;
          teamStats[match.away_team_id].points += 1;
        }
      }

      // Calculate goal differences and update team_group records
      const updates = Object.values(teamStats).map(stats => {
        stats.goal_difference = stats.goals_for - stats.goals_against;
        return this.createOrUpdateTeamGroupRecord(stats.team_id, groupId, stats);
      });

      await Promise.all(updates);
      
      // Update positions
      await this.updateGroupPositions(groupId);
      
      return true;
    } catch (err) {
      console.error('Error recalculating group stats:', err);
      throw err;
    }
  },

  async updateGroupPositions(groupId) {
    try {
      // Get all teams in the group with their stats
      const { data: teamRecords, error } = await supabase
        .from('team_group')
        .select('*, team:team_id(name, flag_url)')
        .eq('group_id', groupId)
        .order('points', { ascending: false })
        .order('goal_difference', { ascending: false })
        .order('goals_for', { ascending: false });

      if (error) {
        console.error('Error fetching team records for group:', error);
        throw error;
      }

      // Update positions
      const updates = teamRecords.map((record, index) => {
        return supabase
          .from('team_group')
          .update({ position: index + 1 })
          .eq('team_id', record.team_id)
          .eq('group_id', groupId);
      });

      await Promise.all(updates);
      return true;
    } catch (err) {
      console.error('Error updating group positions:', err);
      throw err;
    }
  }
}; 