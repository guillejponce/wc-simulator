# 2026 World Cup Simulation - Project Structure

## File Structure

```
world-cup-simulator/
├── package.json
├── vite.config.js
├── .env
├── index.html
├── public/
│   ├── flags/
│   ├── team-logos/
│   ├── player-images/
│   └── favicon.ico
└── src/
    ├── main.jsx                   # Entry point
    ├── App.jsx                    # Root component
    ├── supabase.js                # Supabase client configuration
    ├── components/                # Reusable components
    │   ├── common/                # General UI components
    │   │   ├── Layout.jsx         # Layout wrapper
    │   │   ├── Navbar.jsx         # Navigation bar
    │   │   ├── Footer.jsx         # Footer component
    │   │   ├── Loader.jsx         # Loading indicator
    │   │   ├── ErrorBoundary.jsx  # Error handler
    │   │   ├── Card.jsx           # Card container
    │   │   ├── Button.jsx         # Custom button
    │   │   └── Modal.jsx          # Modal dialog
    │   ├── teams/                 # Team-related components
    │   │   ├── TeamCard.jsx       # Team display card
    │   │   ├── TeamSelector.jsx   # Team selection component
    │   │   ├── TeamList.jsx       # List of teams
    │   │   ├── TeamStats.jsx      # Team statistics
    │   │   ├── TeamForm.jsx       # Form to edit team details
    │   │   └── TeamBadge.jsx      # Small team badge with flag
    │   ├── players/               # Player-related components
    │   │   ├── PlayerCard.jsx     # Player display card
    │   │   ├── PlayerList.jsx     # List of players
    │   │   ├── PlayerStats.jsx    # Player statistics
    │   │   ├── PlayerSelector.jsx # Player selection dropdown
    │   │   └── PlayerForm.jsx     # Form to edit player details
    │   ├── groups/                # Group-related components
    │   │   ├── GroupCard.jsx      # Group display card
    │   │   ├── GroupList.jsx      # List of groups
    │   │   ├── GroupStandings.jsx # Group standings table
    │   │   └── GroupForm.jsx      # Form to edit group details
    │   ├── matches/               # Match-related components
    │   │   ├── MatchCard.jsx      # Match display card
    │   │   ├── MatchList.jsx      # List of matches
    │   │   ├── MatchDetail.jsx    # Detailed match view
    │   │   ├── MatchForm.jsx      # Form to edit match details
    │   │   ├── MatchEvents.jsx    # Match events manager (goals, cards)
    │   │   ├── MatchTimeline.jsx  # Visual timeline of match events
    │   │   ├── MatchStats.jsx     # Match statistics component
    │   │   ├── ScoreInput.jsx     # Component to input scores
    │   │   └── PenaltyShootout.jsx# Penalty shootout manager
    │   ├── lineups/               # Lineup-related components
    │   │   ├── LineupEditor.jsx   # Lineup editor component
    │   │   ├── Formation.jsx      # Visual formation display
    │   │   ├── PlayerPosition.jsx # Player in position component
    │   │   └── SubstitutionManager.jsx # Sub management
    │   ├── draw/                  # Draw-related components
    │   │   ├── DrawSimulator.jsx  # Group draw simulator
    │   │   ├── PotSelector.jsx    # Pot selection component
    │   │   ├── DrawRules.jsx      # Draw rules display
    │   │   └── DrawResult.jsx     # Draw results display
    │   ├── knockout/              # Knockout stage components
    │   │   ├── KnockoutBracket.jsx# Knockout bracket display
    │   │   ├── BracketMatch.jsx   # Match in bracket component
    │   │   └── BracketLine.jsx    # Connecting line in bracket
    │   ├── stats/                 # Statistics components
    │   │   ├── TopScorers.jsx     # Top scorers table
    │   │   ├── TeamStats.jsx      # Team statistics table
    │   │   ├── PlayerStats.jsx    # Player statistics table
    │   │   └── StatCard.jsx       # Statistic display card
    │   └── simulation/            # Simulation components
    │       ├── SimulationCard.jsx # Simulation display card
    │       ├── SimulationList.jsx # List of simulations
    │       └── SimulationForm.jsx # Form to create/edit simulation
    ├── hooks/                     # Custom React hooks
    │   ├── useSimulation.js       # Simulation management
    │   ├── useTeams.js            # Teams data and operations
    │   ├── usePlayers.js          # Players data and operations
    │   ├── useMatches.js          # Matches data and operations
    │   ├── useGroups.js           # Groups data and operations
    │   ├── useStats.js            # Statistics calculations
    │   └── useAuth.js             # Authentication state
    ├── contexts/                  # React contexts
    │   ├── SimulationContext.jsx  # Simulation state context
    │   ├── AuthContext.jsx        # Authentication context
    │   └── ThemeContext.jsx       # Theme/styling context
    ├── pages/                     # Route pages
    │   ├── Home.jsx               # Landing page
    │   ├── SimulationHub.jsx      # Manage simulations
    │   ├── Qualification.jsx      # Team qualification management
    │   ├── Draw.jsx               # Group draw page
    │   ├── Groups.jsx             # Groups overview
    │   ├── GroupDetail.jsx        # Single group view
    │   ├── MatchList.jsx          # All matches view
    │   ├── MatchDetail.jsx        # Single match detail view
    │   ├── MatchEditor.jsx        # Match editing page
    │   ├── KnockoutStage.jsx      # Knockout stage overview
    │   ├── Teams.jsx              # Teams overview
    │   ├── TeamDetail.jsx         # Single team view
    │   ├── Players.jsx            # Players overview
    │   ├── PlayerDetail.jsx       # Single player view
    │   ├── Statistics.jsx         # Overall statistics page
    │   ├── Login.jsx              # Login page
    │   ├── Register.jsx           # Registration page
    │   ├── Profile.jsx            # User profile page
    │   └── NotFound.jsx           # 404 page
    ├── utils/                     # Utility functions
    │   ├── formatters.js          # Data formatting helpers
    │   ├── calculations.js        # Statistical calculations
    │   ├── validators.js          # Form validation logic
    │   ├── sortFunctions.js       # Sorting functions
    │   ├── groupLogic.js          # Group standings logic
    │   ├── knockoutLogic.js       # Knockout stage logic
    │   └── constants.js           # App constants
    ├── models/                    # Type definitions (TypeScript) or PropTypes
    │   ├── Team.js
    │   ├── Player.js
    │   ├── Match.js
    │   ├── Group.js
    │   └── Simulation.js
    ├── services/                  # API and service logic
    │   ├── api.js                 # Base API wrapper
    │   ├── teamService.js         # Team data service
    │   ├── playerService.js       # Player data service
    │   ├── matchService.js        # Match data service
    │   ├── groupService.js        # Group data service
    │   ├── simulationService.js   # Simulation data service
    │   └── authService.js         # Authentication service
    ├── store/                     # Global state management (Redux/Zustand/Recoil)
    │   ├── index.js               # Store configuration
    │   ├── actions/               # Action creators 
    │   └── reducers/              # State reducers
    ├── assets/                    # Static assets
    │   ├── styles/                # CSS/SASS files
    │   │   ├── index.css          # Main stylesheet
    │   │   ├── variables.css      # CSS variables
    │   │   └── components/        # Component-specific styles
    │   ├── images/                # Image assets
    │   └── icons/                 # Icon assets
    └── routes/                    # Routing configuration
        └── AppRoutes.jsx          # React Router setup
```

## Key Features & Workflows

### 1. Simulation Management
- Create, edit, and delete simulations
- View a list of all simulations
- Activate/deactivate simulations

### 2. Team Qualification
- Manage qualified teams by confederation
- Set team details (ranking, coach, etc.)
- Import pre-defined teams or create custom teams

### 3. Group Draw
- Simulate the official draw process
- Respect confederation restrictions
- Manual override options for custom scenarios
- Visualize pots and drawn groups

### 4. Group Stage Management
- View and edit group standings
- Calculate points and tiebreakers automatically
- Display match schedule by group

### 5. Match Management
- Edit match details (date, venue, score)
- Manage lineups and formations
- Track match events (goals, cards, substitutions)
- Record detailed match statistics

### 6. Knockout Stage
- Automatic advancement based on group results
- Interactive bracket visualization
- Match scheduling for knockout rounds

### 7. Statistics Center
- Top scorers leaderboard
- Team performance statistics
- Player performance statistics
- Tournament records

## Page Flow and Navigation Structure

1. **Home/Dashboard**
   - Welcome screen
   - Active simulation overview
   - Quick actions

2. **Simulation Hub**
   - List of existing simulations
   - Create new simulation button
   - Simulation settings

3. **Qualification Management**
   - Teams by confederation
   - Qualification status
   - Team selection interface

4. **Draw Process**
   - Pots setup
   - Draw simulation
   - Group allocation visualization

5. **Group Overview**
   - All groups display
   - Standings tables
   - Navigation to specific groups

6. **Group Detail**
   - Single group focus
   - Standings table
   - Group matches
   - Team cards

7. **Match Schedule**
   - All matches by stage
   - Filtering options
   - Match cards with basic info

8. **Match Detail/Editor**
   - Match header (teams, score, venue)
   - Tabs for:
     - Match events (goals, cards)
     - Lineups
     - Statistics
     - Summary

9. **Knockout Stage**
   - Interactive bracket
   - Match cards within bracket
   - Path to final visualization

10. **Statistics Center**
    - Tabs for different stat categories
    - Data visualization components
    - Filtering and sorting options

11. **Team & Player Profiles**
    - Detailed info pages
    - Performance statistics
    - Match history

## Key User Flows

### Creating a New Simulation
1. User visits Simulation Hub
2. Clicks "New Simulation"
3. Enters simulation name and settings
4. Selects qualified teams from confederations
5. Initiates or customizes group draw
6. Simulation is created and activated

### Editing Match Results
1. User navigates to Match Schedule or Group Detail
2. Selects a match to edit
3. Updates score, goals, cards, and statistics
4. Saves changes
5. System automatically updates standings and advancement

### Managing Team Lineups
1. User navigates to Match Detail
2. Selects Lineup tab
3. Sets formation for each team
4. Assigns players to positions
5. Adds substitutions with timestamps
6. Saves lineup changes

### Viewing Tournament Statistics
1. User navigates to Statistics Center
2. Views top scorers, team stats, player stats
3. Applies filters for specific metrics
4. Exports or shares statistics