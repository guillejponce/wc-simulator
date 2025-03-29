-- Create lineup table
CREATE TABLE IF NOT EXISTS lineup (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES match(id) ON DELETE CASCADE,
    team_id UUID REFERENCES team(id) ON DELETE CASCADE,
    formation VARCHAR(10) NOT NULL,
    is_starting BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(match_id, team_id)
);

-- Create lineup_player table
CREATE TABLE IF NOT EXISTS lineup_player (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lineup_id UUID REFERENCES lineup(id) ON DELETE CASCADE,
    player_id UUID REFERENCES player(id) ON DELETE CASCADE,
    shirt_number INTEGER,
    position VARCHAR(10), -- Specific position: CB, LB, CM, etc.
    is_captain BOOLEAN DEFAULT FALSE,
    start_minute INTEGER DEFAULT 0,
    end_minute INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lineup_match_team ON lineup(match_id, team_id);
CREATE INDEX IF NOT EXISTS idx_lineup_player_lineup ON lineup_player(lineup_id);
CREATE INDEX IF NOT EXISTS idx_lineup_player_player ON lineup_player(player_id);

-- Add trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_lineup_modtime
BEFORE UPDATE ON lineup
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_lineup_player_modtime
BEFORE UPDATE ON lineup_player
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 