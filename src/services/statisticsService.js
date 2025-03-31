import { supabase } from '../supabase';

export const statisticsService = {
  async getPlayerStatistics() {
    try {
      // Get all completed matches
      const { data: matches, error: matchesError } = await supabase
        .from('match')
        .select('id')
        .eq('status', 'completed');

      if (matchesError) {
        console.error('Error fetching completed matches:', matchesError);
        throw matchesError;
      }

      const matchIds = matches.map(match => match.id);

      // Get all goals from completed matches
      const { data: goals, error: goalsError } = await supabase
        .from('goal')
        .select(`
          *,
          player:player_id(
            *,
            team:team_id(
              id,
              name,
              code,
              flag_url
            )
          ),
          team:team_id(
            id,
            name,
            code,
            flag_url
          )
        `)
        .in('match_id', matchIds);

      if (goalsError) {
        console.error('Error fetching goals:', goalsError);
        throw goalsError;
      }

      // Get all match events (for cards, etc.)
      const { data: events, error: eventsError } = await supabase
        .from('match_event')
        .select(`
          *,
          match:match_id(
            id,
            status,
            home_team_id,
            away_team_id
          )
        `)
        .eq('match.status', 'completed');

      if (eventsError) {
        console.error('Error fetching match events:', eventsError);
        throw eventsError;
      }

      // Get all players with their team information
      const { data: players, error: playersError } = await supabase
        .from('player')
        .select(`
          *,
          team:team_id(
            id,
            name,
            code,
            flag_url
          )
        `);

      if (playersError) {
        console.error('Error fetching players:', playersError);
        throw playersError;
      }

      // Initialize player stats
      const playerStats = {};
      players.forEach(player => {
        playerStats[player.id] = {
          player: {
            ...player,
            team: player.team // Include team information in player object
          },
          goals: 0,
          assists: 0,
          yellow_cards: 0,
          red_cards: 0,
          matches_played: new Set(),
          minutes_played: 0
        };
      });

      // Process goals to calculate statistics
      goals.forEach(goal => {
        // Update scorer stats
        const scorerStats = playerStats[goal.player_id];
        if (scorerStats) {
          scorerStats.goals++;
          scorerStats.matches_played.add(goal.match_id);
          if (goal.minute > scorerStats.minutes_played) {
            scorerStats.minutes_played = goal.minute;
          }
        }

        // Update assist stats
        if (goal.assist_player_id) {
          const assistStats = playerStats[goal.assist_player_id];
          if (assistStats) {
            assistStats.assists++;
            assistStats.matches_played.add(goal.match_id);
            if (goal.minute > assistStats.minutes_played) {
              assistStats.minutes_played = goal.minute;
            }
          }
        }
      });

      // Process events to calculate cards and other stats
      events.forEach(event => {
        const stats = playerStats[event.player_id];
        if (!stats) return;

        // Add match to played matches
        stats.matches_played.add(event.match_id);

        // Count cards
        if (event.event_type === 'yellow_card') {
          stats.yellow_cards++;
        }
        if (event.event_type === 'red_card') {
          stats.red_cards++;
        }

        // Update minutes played
        if (event.minute > stats.minutes_played) {
          stats.minutes_played = event.minute;
        }
      });

      // Convert Set to number for matches_played
      Object.values(playerStats).forEach(stats => {
        stats.matches_played = stats.matches_played.size;
      });

      // Convert to array and sort by goals
      const sortedStats = Object.values(playerStats)
        .filter(stats => stats.goals > 0 || stats.assists > 0 || stats.yellow_cards > 0 || stats.red_cards > 0)
        .sort((a, b) => {
          // Primary sort by goals
          if (b.goals !== a.goals) {
            return b.goals - a.goals;
          }
          // Secondary sort by assists
          if (b.assists !== a.assists) {
            return b.assists - a.assists;
          }
          // Tertiary sort by matches played
          return b.matches_played - a.matches_played;
        });

      return sortedStats;
    } catch (error) {
      console.error('Error calculating player statistics:', error);
      throw error;
    }
  }
}; 