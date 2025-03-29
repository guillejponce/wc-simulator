import { supabase } from '../supabase';

export const playerService = {
  // Get all players
  async getPlayers() {
    const { data, error } = await supabase
      .from('player')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching players:', error);
      throw error;
    }

    return data;
  },

  // Get player by ID
  async getPlayerById(id) {
    const { data, error } = await supabase
      .from('player')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching player by ID:', error);
      throw error;
    }

    return data;
  },

  // Get players by team ID (squad)
  async getPlayersByTeam(teamId) {
    const { data, error } = await supabase
      .from('player')
      .select('*')
      .eq('team_id', teamId)
      .order('number');

    if (error) {
      console.error('Error fetching players by team:', error);
      throw error;
    }

    return data;
  },

  // Create a new player
  async createPlayer(playerData) {
    const { data, error } = await supabase
      .from('player')
      .insert([playerData])
      .select()
      .single();

    if (error) {
      console.error('Error creating player:', error);
      throw error;
    }

    return data;
  },

  // Update an existing player
  async updatePlayer(id, playerData) {
    const { data, error } = await supabase
      .from('player')
      .update(playerData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating player:', error);
      throw error;
    }

    return data;
  },

  // Delete a player
  async deletePlayer(id) {
    const { error } = await supabase
      .from('player')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting player:', error);
      throw error;
    }

    return true;
  },

  // Get players group by position
  async getPlayersByPosition(teamId) {
    const { data, error } = await supabase
      .from('player')
      .select('*')
      .eq('team_id', teamId)
      .order('position');

    if (error) {
      console.error('Error fetching players by position:', error);
      throw error;
    }

    // Group players by position
    const grouped = {
      GK: [],
      DEF: [],
      MID: [],
      FWD: []
    };

    data?.forEach(player => {
      if (grouped[player.position]) {
        grouped[player.position].push(player);
      } else {
        // Handle any players with unknown positions
        console.warn(`Player with unknown position: ${player.position}`);
      }
    });

    return grouped;
  }
}; 