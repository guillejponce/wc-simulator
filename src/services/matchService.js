import { supabase } from '../supabase';

// Utility functions for date and time formatting
export const matchDateHelpers = {
  formatDate: (datetime) => {
    if (!datetime) return 'Not scheduled';
    // Create date object from the ISO string
    const date = new Date(datetime);
    // Format using toLocaleDateString to respect local timezone
    return date.toLocaleDateString();
  },
  
  formatTime: (datetime) => {
    if (!datetime) return '';
    // Create date object from the ISO string
    const date = new Date(datetime);
    // Format time respecting local timezone
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  },
  
  formatDatetime: (datetime) => {
    if (!datetime) return 'Not scheduled';
    // Create date object from the ISO string
    const date = new Date(datetime);
    // Format full datetime respecting local timezone
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  }
};

export const matchService = {
  async getMatches() {
    const { data, error } = await supabase
      .from('match')
      .select(`
        *,
        home_team:home_team_id(id, name, code, flag_url),
        away_team:away_team_id(id, name, code, flag_url),
        group:group_id(id, name),
        venue:venue_id(id, name, city, country)
      `)
      .order('datetime', { ascending: true });

    if (error) {
      console.error('Error fetching matches:', error);
      throw error;
    }

    return data;
  },

  async getMatchById(id) {
    const { data, error } = await supabase
      .from('match')
      .select(`
        *,
        home_team:home_team_id(id, name, code, flag_url),
        away_team:away_team_id(id, name, code, flag_url),
        group:group_id(id, name),
        venue:venue_id(id, name, city, country)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching match:', error);
      throw error;
    }

    return data;
  },

  async createMatch(matchData) {
    console.log('Creating match with data:', matchData);
    
    // Make sure only valid fields are included
    const validData = {
      home_team_id: matchData.home_team_id,
      away_team_id: matchData.away_team_id,
      home_score: matchData.home_score,
      away_score: matchData.away_score,
      datetime: matchData.datetime,
      group_id: matchData.group_id,
      stage_id: matchData.stage_id,
      status: matchData.status,
      venue_id: matchData.venue_id
    };
    
    const { data, error } = await supabase
      .from('match')
      .insert([validData])
      .select(`
        *,
        home_team:home_team_id(id, name, code, flag_url),
        away_team:away_team_id(id, name, code, flag_url),
        group:group_id(id, name),
        venue:venue_id(id, name, city, country)
      `)
      .single();

    if (error) {
      console.error('Error creating match:', error);
      throw error;
    }

    return data;
  },

  async updateMatch(id, matchData) {
    console.log('Updating match with ID:', id, 'Data:', matchData);
    
    // Make sure only valid fields are included
    const validData = {
      home_team_id: matchData.home_team_id,
      away_team_id: matchData.away_team_id,
      home_score: matchData.home_score,
      away_score: matchData.away_score,
      datetime: matchData.datetime,
      group_id: matchData.group_id,
      stage_id: matchData.stage_id,
      status: matchData.status,
      venue_id: matchData.venue_id
    };
    
    const { data, error } = await supabase
      .from('match')
      .update(validData)
      .eq('id', id)
      .select(`
        *,
        home_team:home_team_id(id, name, code, flag_url),
        away_team:away_team_id(id, name, code, flag_url),
        group:group_id(id, name),
        venue:venue_id(id, name, city, country)
      `)
      .single();

    if (error) {
      console.error('Error updating match:', error);
      throw error;
    }

    return data;
  },

  async deleteMatch(id) {
    const { error } = await supabase
      .from('match')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting match:', error);
      throw error;
    }

    return true;
  },

  async getMatchesByGroup(groupId) {
    const { data, error } = await supabase
      .from('match')
      .select(`
        *,
        home_team:home_team_id(id, name, code, flag_url),
        away_team:away_team_id(id, name, code, flag_url),
        group:group_id(id, name),
        venue:venue_id(id, name, city, country)
      `)
      .eq('group_id', groupId)
      .order('datetime', { ascending: true });

    if (error) {
      console.error('Error fetching matches by group:', error);
      throw error;
    }

    return data;
  },

  async getVenues() {
    const { data, error } = await supabase
      .from('venue')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching venues:', error);
      throw error;
    }

    return data;
  }
};
