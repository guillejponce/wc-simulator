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
  }
}; 