import { supabase } from '../supabase';

export const matchEventService = {
  // Get all events for a match (including goals)
  async getMatchEvents(matchId) {
    console.log(`Fetching events for match ID: ${matchId}`);
    
    if (!matchId) {
      console.error('Error: No match ID provided to getMatchEvents');
      return [];
    }
    
    try {
      // Fetch regular events
      const { data: events, error: eventsError } = await supabase
        .from('match_event')
        .select(`
          *,
          player:player_id(
            id,
            name,
            number,
            position
          ),
          secondary_player:secondary_player_id(
            id,
            name,
            number,
            position
          )
        `)
        .eq('match_id', matchId)
        .order('minute', { ascending: true })
        .order('added_time', { ascending: true });

      if (eventsError) {
        console.error('Error fetching match events:', eventsError);
        throw eventsError;
      }

      // Fetch goals
      const { data: goals, error: goalsError } = await supabase
        .from('goal')
        .select(`
          *,
          player:player_id(
            id,
            name,
            number,
            position
          ),
          assist_player:assist_player_id(
            id,
            name,
            number,
            position
          ),
          team:team_id(
            id,
            name
          )
        `)
        .eq('match_id', matchId)
        .order('minute', { ascending: true })
        .order('added_time', { ascending: true });

      if (goalsError) {
        console.error('Error fetching goals:', goalsError);
        throw goalsError;
      }

      // Convert goals to match event format
      const formattedGoals = (goals || []).map(goal => ({
        id: `goal_${goal.id}`, // Prefix to identify as a goal
        match_id: goal.match_id,
        player_id: goal.player_id,
        player: goal.player,
        event_type: 'goal',
        minute: goal.minute,
        added_time: goal.added_time || 0,
        details: `${goal.penalty ? 'Penalty' : ''} ${goal.own_goal ? 'Own Goal' : ''}`.trim(),
        secondary_player_id: goal.assist_player_id,
        secondary_player: goal.assist_player,
        team_id: goal.team_id,
        team: goal.team,
        penalty: goal.penalty,
        own_goal: goal.own_goal
      }));

      // Combine and sort all events by minute and added time
      const allEvents = [...(events || []), ...formattedGoals].sort((a, b) => {
        if (a.minute !== b.minute) {
          return a.minute - b.minute;
        }
        return (a.added_time || 0) - (b.added_time || 0);
      });

      return allEvents;
    } catch (error) {
      console.error('Error in getMatchEvents:', error);
      throw error;
    }
  },

  // Create a new match event or goal
  async createMatchEvent(eventData) {
    console.log('Creating match event with data:', JSON.stringify(eventData, null, 2));
    
    try {
      if (eventData.event_type === 'goal') {
        // Create a goal record
        const goalData = {
          match_id: eventData.match_id,
          player_id: eventData.player_id,
          team_id: eventData.team_id,
          minute: eventData.minute,
          added_time: eventData.added_time || 0,
          penalty: eventData.penalty || false,
          own_goal: eventData.own_goal || false,
          assist_player_id: eventData.secondary_player_id
        };

        const { data, error } = await supabase
          .from('goal')
          .insert([goalData])
          .select(`
            *,
            player:player_id(
              id,
              name,
              number,
              position
            ),
            assist_player:assist_player_id(
              id,
              name,
              number,
              position
            ),
            team:team_id(
              id,
              name
            )
          `)
          .single();

        if (error) {
          console.error('Error creating goal:', error);
          throw error;
        }

        // Convert to event format
        return {
          id: `goal_${data.id}`,
          match_id: data.match_id,
          player_id: data.player_id,
          player: data.player,
          event_type: 'goal',
          minute: data.minute,
          added_time: data.added_time || 0,
          details: `${data.penalty ? 'Penalty' : ''} ${data.own_goal ? 'Own Goal' : ''}`.trim(),
          secondary_player_id: data.assist_player_id,
          secondary_player: data.assist_player,
          team_id: data.team_id,
          team: data.team,
          penalty: data.penalty,
          own_goal: data.own_goal
        };
      } else {
        // Create regular match event
        const validEventTypes = ['yellow_card', 'red_card', 'substitution', 'injury', 'var_review'];
        if (!validEventTypes.includes(eventData.event_type)) {
          throw new Error(`Invalid event type: ${eventData.event_type}. Must be one of: ${validEventTypes.join(', ')}`);
        }

        const { data, error } = await supabase
          .from('match_event')
          .insert([{
            match_id: eventData.match_id,
            player_id: eventData.player_id,
            event_type: eventData.event_type,
            minute: eventData.minute,
            added_time: eventData.added_time || 0,
            details: eventData.details,
            secondary_player_id: eventData.secondary_player_id
          }])
          .select(`
            *,
            player:player_id(
              id,
              name,
              number,
              position
            ),
            secondary_player:secondary_player_id(
              id,
              name,
              number,
              position
            )
          `)
          .single();

        if (error) {
          console.error('Error creating match event:', error);
          throw error;
        }

        return data;
      }
    } catch (error) {
      console.error('Error in createMatchEvent:', error);
      throw error;
    }
  },

  // Update an existing match event or goal
  async updateMatchEvent(eventId, eventData) {
    console.log('Updating match event with ID:', eventId, 'Data:', eventData);
    
    try {
      // Check if this is a goal by looking at the ID prefix
      const isGoal = eventId.toString().startsWith('goal_');
      const actualId = isGoal ? eventId.replace('goal_', '') : eventId;

      if (isGoal) {
        // Update goal record
        const goalData = {
          match_id: eventData.match_id,
          player_id: eventData.player_id,
          team_id: eventData.team_id,
          minute: eventData.minute,
          added_time: eventData.added_time || 0,
          penalty: eventData.penalty || false,
          own_goal: eventData.own_goal || false,
          assist_player_id: eventData.secondary_player_id
        };

        const { data, error } = await supabase
          .from('goal')
          .update(goalData)
          .eq('id', actualId)
          .select(`
            *,
            player:player_id(
              id,
              name,
              number,
              position
            ),
            assist_player:assist_player_id(
              id,
              name,
              number,
              position
            ),
            team:team_id(
              id,
              name
            )
          `)
          .single();

        if (error) {
          console.error('Error updating goal:', error);
          throw error;
        }

        // Convert to event format
        return {
          id: `goal_${data.id}`,
          match_id: data.match_id,
          player_id: data.player_id,
          player: data.player,
          event_type: 'goal',
          minute: data.minute,
          added_time: data.added_time || 0,
          details: `${data.penalty ? 'Penalty' : ''} ${data.own_goal ? 'Own Goal' : ''}`.trim(),
          secondary_player_id: data.assist_player_id,
          secondary_player: data.assist_player,
          team_id: data.team_id,
          team: data.team,
          penalty: data.penalty,
          own_goal: data.own_goal
        };
      } else {
        // Update regular match event
        const { data, error } = await supabase
          .from('match_event')
          .update({
            match_id: eventData.match_id,
            player_id: eventData.player_id,
            event_type: eventData.event_type,
            minute: eventData.minute,
            added_time: eventData.added_time || 0,
            details: eventData.details,
            secondary_player_id: eventData.secondary_player_id
          })
          .eq('id', actualId)
          .select(`
            *,
            player:player_id(
              id,
              name,
              number,
              position
            ),
            secondary_player:secondary_player_id(
              id,
              name,
              number,
              position
            )
          `)
          .single();

        if (error) {
          console.error('Error updating match event:', error);
          throw error;
        }

        return data;
      }
    } catch (error) {
      console.error('Error in updateMatchEvent:', error);
      throw error;
    }
  },

  // Delete a match event or goal
  async deleteMatchEvent(eventId) {
    // Check if this is a goal by looking at the ID prefix
    const isGoal = eventId.toString().startsWith('goal_');
    const actualId = isGoal ? eventId.replace('goal_', '') : eventId;
    
    console.log('Deleting match event with ID:', actualId, 'Is goal:', isGoal);
    
    try {
      const { error } = await supabase
        .from(isGoal ? 'goal' : 'match_event')
        .delete()
        .eq('id', actualId);

      if (error) {
        console.error('Error deleting match event:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteMatchEvent:', error);
      throw error;
    }
  },

  // Get list of event types
  getEventTypes() {
    return [
      { value: 'goal', label: 'Goal' },
      { value: 'yellow_card', label: 'Yellow Card' },
      { value: 'red_card', label: 'Red Card' },
      { value: 'substitution', label: 'Substitution' },
      { value: 'injury', label: 'Injury' },
      { value: 'var_review', label: 'VAR Review' }
    ];
  }
}; 