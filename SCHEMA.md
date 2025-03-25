erDiagram
    %% Core Tournament Entities
    TEAM ||--o{ SQUAD : has
    TEAM ||--o{ TEAM_GROUP : "assigned to"
    TEAM ||--o{ MATCH : "plays as home"
    TEAM ||--o{ MATCH : "plays as away"
    TEAM {
        uuid id PK
        string name
        string code
        string flag_url
        string region "UEFA|CONMEBOL|CONCACAF|CAF|AFC|OFC"
        int fifa_ranking
        int pot
        boolean qualified
    }
    
    PLAYER ||--o{ LINEUP_PLAYER : listed_in
    PLAYER ||--o{ GOAL : scores
    PLAYER ||--o{ MATCH_EVENT : involved_in
    PLAYER {
        uuid id PK
        uuid team_id FK
        string name
        string position "GK|DEF|MID|FWD"
        int number
        date birth_date
        string club
        string image_url
    }
    
    CONFEDERATION {
        uuid id PK
        string name
        string code "UEFA|CONMEBOL|CONCACAF|CAF|AFC|OFC"
        int slots "Qualification slots"
    }
    
    %% Tournament Structure
    GROUP ||--o{ TEAM_GROUP : contains
    GROUP {
        uuid id PK
        string name "A through P for 2026 format"
        string region "For region-specific groups if applicable"
    }
    
    TEAM_GROUP {
        uuid id PK
        uuid team_id FK
        uuid group_id FK
        int points
        int played
        int won
        int drawn
        int lost
        int goals_for
        int goals_against
        int goal_difference
        int position
    }
    
    STAGE {
        uuid id PK
        string name
        int order
        string type "group|round_of_32|round_of_16|quarter_final|semi_final|third_place|final"
    }
    
    VENUE {
        uuid id PK
        string name
        string city
        string country
        int capacity
        string image_url
    }
    
    %% Match Data
    MATCH ||--o{ GOAL : has
    MATCH ||--o{ MATCH_EVENT : has
    MATCH ||--o{ MATCH_STAT : has
    MATCH ||--o{ LINEUP : has
    MATCH {
        uuid id PK
        uuid home_team_id FK
        uuid away_team_id FK
        uuid stage_id FK
        uuid venue_id FK
        uuid group_id FK "Only for group stage matches"
        timestamp datetime
        int home_score
        int away_score
        string status "scheduled|in_progress|completed|cancelled"
        boolean penalties
        int home_penalties
        int away_penalties
        uuid winner_id FK
    }
    
    GOAL {
        uuid id PK
        uuid match_id FK
        uuid player_id FK
        uuid team_id FK
        int minute
        int added_time "Injury time minutes"
        boolean penalty
        boolean own_goal
        uuid assist_player_id FK
        string video_url
    }
    
    MATCH_EVENT {
        uuid id PK
        uuid match_id FK
        uuid player_id FK
        string event_type "yellow_card|red_card|substitution|injury|var_review"
        int minute
        int added_time
        string details
        uuid secondary_player_id FK "For substitutions (player coming on)"
    }
    
    MATCH_STAT {
        uuid id PK
        uuid match_id FK
        uuid team_id FK
        int possession
        int shots
        int shots_on_target
        int corners
        int fouls
        int offsides
        int passes
        int pass_accuracy
        int tackles
        int clearances
        int saves
        int yellow_cards
        int red_cards
    }
    
    %% Lineups
    LINEUP ||--o{ LINEUP_PLAYER : includes
    LINEUP {
        uuid id PK
        uuid match_id FK
        uuid team_id FK
        string formation "e.g. 4-3-3, 4-4-2"
        boolean is_starting "Starting XI vs substitutes"
    }
    
    LINEUP_PLAYER {
        uuid id PK
        uuid lineup_id FK
        uuid player_id FK
        int shirt_number
        string position "Specific position: CB, LB, CM, etc."
        boolean is_captain
        int start_minute "When player entered the match"
        int end_minute "When player left the match (if subbed)"
    }
    
    %% User Simulations
    USER ||--o{ SIMULATION : creates
    USER {
        uuid id PK
        string email
        string username
        timestamp created_at
        string avatar_url
    }
    
    SIMULATION ||--o{ SIM_GROUP : has
    SIMULATION ||--o{ SIM_MATCH : has
    SIMULATION {
        uuid id PK
        uuid user_id FK
        string name
        timestamp created_at
        boolean is_active
        string status "setup|group_stage|knockout_stage|completed"
        string description
    }
    
    SIM_GROUP ||--o{ SIM_TEAM_GROUP : contains
    SIM_GROUP {
        uuid id PK
        uuid simulation_id FK
        uuid group_id FK
        string custom_name
    }
    
    SIM_TEAM_GROUP {
        uuid id PK
        uuid sim_group_id FK
        uuid team_id FK
        int points
        int played
        int won
        int drawn
        int lost
        int goals_for
        int goals_against
        int goal_difference
        int position
        boolean advanced
    }
    
    %% Simulation Match Details
    SIM_MATCH ||--o{ SIM_GOAL : has
    SIM_MATCH ||--o{ SIM_MATCH_EVENT : has
    SIM_MATCH ||--o{ SIM_MATCH_STAT : has
    SIM_MATCH ||--o{ SIM_LINEUP : has
    SIM_MATCH {
        uuid id PK
        uuid simulation_id FK
        uuid match_id FK "Reference to template match structure"
        uuid home_team_id FK
        uuid away_team_id FK
        uuid stage_id FK
        uuid venue_id FK
        uuid group_id FK "For group matches"
        uuid next_match_id FK "For progression in knockout stages"
        timestamp datetime
        int home_score
        int away_score
        string status "scheduled|in_progress|completed|cancelled"
        boolean penalties
        int home_penalties
        int away_penalties
        uuid winner_id FK
        boolean edited "Has been manually edited"
    }
    
    SIM_GOAL {
        uuid id PK
        uuid sim_match_id FK
        uuid player_id FK
        uuid team_id FK
        int minute
        int added_time
        boolean penalty
        boolean own_goal
        uuid assist_player_id FK
    }
    
    SIM_MATCH_EVENT {
        uuid id PK
        uuid sim_match_id FK
        uuid player_id FK
        string event_type "yellow_card|red_card|substitution|injury|var_review"
        int minute
        int added_time
        string details
        uuid secondary_player_id FK
    }
    
    SIM_MATCH_STAT {
        uuid id PK
        uuid sim_match_id FK
        uuid team_id FK
        int possession
        int shots
        int shots_on_target
        int corners
        int fouls
        int offsides
        int passes
        int pass_accuracy
        int tackles
        int clearances
        int saves
        int yellow_cards
        int red_cards
    }
    
    SIM_LINEUP ||--o{ SIM_LINEUP_PLAYER : includes
    SIM_LINEUP {
        uuid id PK
        uuid sim_match_id FK
        uuid team_id FK
        string formation
        boolean is_starting
    }
    
    SIM_LINEUP_PLAYER {
        uuid id PK
        uuid sim_lineup_id FK
        uuid player_id FK
        int shirt_number
        string position
        boolean is_captain
        int start_minute
        int end_minute
    }
    
    %% Stats Aggregation
    PLAYER_TOURNAMENT_STAT {
        uuid id PK
        uuid simulation_id FK
        uuid player_id FK
        int matches_played
        int goals
        int assists
        int yellow_cards
        int red_cards
        int minutes_played
        int clean_sheets "For goalkeepers"
        int saves "For goalkeepers"
        float average_rating
    }
    
    TEAM_TOURNAMENT_STAT {
        uuid id PK
        uuid simulation_id FK
        uuid team_id FK
        int matches_played
        int wins
        int draws
        int losses
        int goals_for
        int goals_against
        int goal_difference
        int clean_sheets
        string furthest_round
        int points
        float possession_avg
        float pass_accuracy_avg
    }