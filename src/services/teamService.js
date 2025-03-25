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
  }
}; 