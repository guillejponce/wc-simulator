import { supabase } from '../supabase';

export const lineupService = {
  // Get lineup by match and team
  async getLineupByMatchTeam(matchId, teamId) {
    console.log(`Fetching lineup for match ID: ${matchId}, team ID: ${teamId}`);
    
    if (!matchId || !teamId) {
      console.error('Error: Missing matchId or teamId in getLineupByMatchTeam');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('lineup')
        .select(`
          *,
          lineup_players:lineup_player(
            id,
            player_id,
            shirt_number,
            position,
            is_captain,
            start_minute,
            end_minute,
            player:player_id(
              id,
              name,
              position,
              number,
              club
            )
          )
        `)
        .eq('match_id', matchId)
        .eq('team_id', teamId)
        .single();

      if (error) {
        // Si el error es "not found", simplemente regresamos null
        if (error.code === 'PGSQL_RELATION_DOES_NOT_EXIST' || error.code === 'PGRST116') {
          console.log(`No lineup found for match ID: ${matchId}, team ID: ${teamId}`);
          return null;
        }
        
        console.error('Error fetching lineup:', error);
        throw error;
      }

      console.log(`Lineup data found:`, data ? 'Yes' : 'No');
      return data || null;
    } catch (error) {
      console.error('Error in getLineupByMatchTeam:', error);
      // Para errores específicos de Supabase, retornamos null en lugar de lanzar la excepción
      if (error.code === 'PGSQL_RELATION_DOES_NOT_EXIST' || error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
  },

  // Create a new lineup
  async createLineup(lineupData) {
    try {
      console.log('Creating lineup with data:', lineupData);
      
      // First create the lineup
      const { data: lineup, error: lineupError } = await supabase
        .from('lineup')
        .insert([{
          match_id: lineupData.match_id,
          team_id: lineupData.team_id,
          formation: lineupData.formation,
          is_starting: lineupData.is_starting || true
        }])
        .select()
        .single();

      if (lineupError) {
        console.error('Error creating lineup:', lineupError);
        throw lineupError;
      }

      // If there are players to add to the lineup
      if (lineupData.players && lineupData.players.length > 0) {
        // Asegúrate de que todos los campos obligatorios estén presentes
        const playerData = lineupData.players.map(player => ({
          lineup_id: lineup.id,
          player_id: player.player_id,
          shirt_number: parseInt(player.shirt_number || player.number || 0),
          position: player.specific_position || player.position,
          is_captain: player.is_captain || false,
          start_minute: player.start_minute || 0,
          end_minute: player.end_minute || null
        }));

        console.log('Adding players to lineup:', playerData);

        const { error: playersError } = await supabase
          .from('lineup_player')
          .insert(playerData);

        if (playersError) {
          console.error('Error adding players to lineup:', playersError);
          // Eliminamos el lineup creado para evitar lineup sin jugadores
          await this.deleteLineup(lineup.id);
          throw playersError;
        }
      }

      return await this.getLineupByMatchTeam(lineupData.match_id, lineupData.team_id);
    } catch (error) {
      console.error('Error in createLineup:', error);
      throw error;
    }
  },

  // Update an existing lineup
  async updateLineup(lineupId, lineupData) {
    try {
      console.log('Updating lineup with data:', lineupData);
      
      // First update the lineup itself
      const { error: lineupError } = await supabase
        .from('lineup')
        .update({
          formation: lineupData.formation,
          is_starting: lineupData.is_starting || true
        })
        .eq('id', lineupId);

      if (lineupError) {
        console.error('Error updating lineup:', lineupError);
        throw lineupError;
      }

      // If there are players, delete existing lineup players and add new ones
      if (lineupData.players && lineupData.players.length > 0) {
        // First delete existing lineup players
        const { error: deleteError } = await supabase
          .from('lineup_player')
          .delete()
          .eq('lineup_id', lineupId);

        if (deleteError) {
          console.error('Error deleting existing lineup players:', deleteError);
          throw deleteError;
        }

        // Then add new lineup players
        // Asegúrate de que todos los campos obligatorios estén presentes
        const playerData = lineupData.players.map(player => ({
          lineup_id: lineupId,
          player_id: player.player_id,
          shirt_number: parseInt(player.shirt_number || player.number || 0),
          position: player.specific_position || player.position,
          is_captain: player.is_captain || false,
          start_minute: player.start_minute || 0,
          end_minute: player.end_minute || null
        }));

        console.log('Adding updated players to lineup:', playerData);

        const { error: playersError } = await supabase
          .from('lineup_player')
          .insert(playerData);

        if (playersError) {
          console.error('Error adding players to lineup:', playersError);
          throw playersError;
        }
      }

      return await this.getLineupById(lineupId);
    } catch (error) {
      console.error('Error in updateLineup:', error);
      throw error;
    }
  },

  // Get a lineup by ID
  async getLineupById(lineupId) {
    console.log(`Fetching lineup by ID: ${lineupId}`);
    
    if (!lineupId) {
      console.error('Error: No lineup ID provided to getLineupById');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('lineup')
        .select(`
          *,
          lineup_players:lineup_player(
            id,
            player_id,
            shirt_number,
            position,
            is_captain,
            start_minute,
            end_minute,
            player:player_id(
              id,
              name,
              position,
              number,
              club
            )
          )
        `)
        .eq('id', lineupId)
        .single();

      if (error) {
        // Si el error es "not found", simplemente regresamos null
        if (error.code === 'PGSQL_RELATION_DOES_NOT_EXIST' || error.code === 'PGRST116') {
          console.log(`No lineup found for ID: ${lineupId}`);
          return null;
        }
        
        console.error('Error fetching lineup by ID:', error);
        throw error;
      }

      console.log(`Lineup found by ID: ${lineupId}`);
      return data;
    } catch (error) {
      console.error('Error in getLineupById:', error);
      // Para errores específicos de Supabase, retornamos null en lugar de lanzar la excepción
      if (error.code === 'PGSQL_RELATION_DOES_NOT_EXIST' || error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
  },

  // Delete a lineup
  async deleteLineup(lineupId) {
    // Delete the lineup players first (due to foreign key constraints)
    const { error: playersError } = await supabase
      .from('lineup_player')
      .delete()
      .eq('lineup_id', lineupId);

    if (playersError) {
      console.error('Error deleting lineup players:', playersError);
      throw playersError;
    }

    // Then delete the lineup itself
    const { error } = await supabase
      .from('lineup')
      .delete()
      .eq('id', lineupId);

    if (error) {
      console.error('Error deleting lineup:', error);
      throw error;
    }

    return true;
  },
  
  // Get common formations
  getFormations() {
    return [
      { value: '4-4-2', label: '4-4-2' },
      { value: '4-3-3', label: '4-3-3' },
      { value: '4-2-3-1', label: '4-2-3-1' },
      { value: '3-5-2', label: '3-5-2' },
      { value: '3-4-3', label: '3-4-3' },
      { value: '5-3-2', label: '5-3-2' },
      { value: '5-4-1', label: '5-4-1' }
    ];
  }
}; 