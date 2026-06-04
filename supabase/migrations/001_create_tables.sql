-- ============================================================
-- MyLine CS2 — Migration 001
-- Cria tabelas faltantes do Fantasy Oficial e da Comunidade
-- ============================================================

-- lineups
CREATE TABLE IF NOT EXISTS lineups (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  championship_id UUID NOT NULL REFERENCES championships(id) ON DELETE CASCADE,
  round_id        UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, round_id)
);
CREATE INDEX IF NOT EXISTS idx_lineups_user    ON lineups (user_id);
CREATE INDEX IF NOT EXISTS idx_lineups_round   ON lineups (round_id);

-- lineup_players
CREATE TABLE IF NOT EXISTS lineup_players (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lineup_id  UUID NOT NULL REFERENCES lineups(id) ON DELETE CASCADE,
  player_id  UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  is_captain BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lineup_id, player_id)
);
CREATE INDEX IF NOT EXISTS idx_lineup_players_lineup ON lineup_players (lineup_id);

-- player_prices
CREATE TABLE IF NOT EXISTS player_prices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id       UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  championship_id UUID NOT NULL REFERENCES championships(id) ON DELETE CASCADE,
  round_id        UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  price           NUMERIC(12, 2) NOT NULL,
  price_change    NUMERIC(6, 4) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (player_id, round_id)
);
CREATE INDEX IF NOT EXISTS idx_player_prices_round ON player_prices (round_id);

-- matches
CREATE TABLE IF NOT EXISTS matches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id     UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  team1_id     UUID NOT NULL REFERENCES teams(id),
  team2_id     UUID NOT NULL REFERENCES teams(id),
  format       TEXT NOT NULL CHECK (format IN ('BO1', 'BO3', 'BO5')),
  winner_id    UUID REFERENCES teams(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_matches_round ON matches (round_id);

-- player_round_stats  (soma total da série)
CREATE TABLE IF NOT EXISTS player_round_stats (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id  UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  round_id   UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  kills      INTEGER NOT NULL DEFAULT 0,
  assists    INTEGER NOT NULL DEFAULT 0,
  deaths     INTEGER NOT NULL DEFAULT 0,
  rating     NUMERIC(4, 2) NOT NULL DEFAULT 0,
  adr        NUMERIC(6, 2) NOT NULL DEFAULT 0,
  clutches   INTEGER NOT NULL DEFAULT 0,
  aces       INTEGER NOT NULL DEFAULT 0,
  mvps       INTEGER NOT NULL DEFAULT 0,
  points     NUMERIC(8, 2) NOT NULL DEFAULT 0,
  eliminated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (player_id, round_id)
);
CREATE INDEX IF NOT EXISTS idx_prs_round ON player_round_stats (round_id);

-- player_map_stats  (stats por mapa individual)
CREATE TABLE IF NOT EXISTS player_map_stats (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  round_id  UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  match_id  UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  map_name  TEXT NOT NULL,
  kills     INTEGER NOT NULL DEFAULT 0,
  assists   INTEGER NOT NULL DEFAULT 0,
  deaths    INTEGER NOT NULL DEFAULT 0,
  rating    NUMERIC(4, 2) NOT NULL DEFAULT 0,
  adr       NUMERIC(6, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pms_round ON player_map_stats (round_id);
CREATE INDEX IF NOT EXISTS idx_pms_match ON player_map_stats (match_id);

-- rankings
CREATE TABLE IF NOT EXISTS rankings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_championship_id UUID NOT NULL REFERENCES user_championships(id) ON DELETE CASCADE,
  round_id            UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  position            INTEGER NOT NULL,
  total_points        NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_championship_id, round_id)
);
CREATE INDEX IF NOT EXISTS idx_rankings_round ON rankings (round_id);

-- ============================================================
-- Comunidade
-- ============================================================

-- community_tournaments
CREATE TABLE IF NOT EXISTS community_tournaments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  format       TEXT NOT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  status       TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'finished')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ct_organizer ON community_tournaments (organizer_id);
CREATE INDEX IF NOT EXISTS idx_ct_status    ON community_tournaments (status);

-- community_teams
CREATE TABLE IF NOT EXISTS community_teams (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES community_tournaments(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  tag           TEXT NOT NULL,
  logo_url      TEXT,
  created_by    UUID NOT NULL REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cteams_tournament ON community_teams (tournament_id);

-- community_player_profile
CREATE TABLE IF NOT EXISTS community_player_profile (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  steam_id  TEXT,
  nickname  TEXT NOT NULL,
  country   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- community_team_members
CREATE TABLE IF NOT EXISTS community_team_members (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id           UUID NOT NULL REFERENCES community_teams(id) ON DELETE CASCADE,
  player_profile_id UUID NOT NULL REFERENCES community_player_profile(id) ON DELETE CASCADE,
  role              TEXT,
  joined_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (team_id, player_profile_id)
);
CREATE INDEX IF NOT EXISTS idx_ctm_team ON community_team_members (team_id);

-- community_matches
CREATE TABLE IF NOT EXISTS community_matches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES community_tournaments(id) ON DELETE CASCADE,
  team1_id      UUID NOT NULL REFERENCES community_teams(id),
  team2_id      UUID NOT NULL REFERENCES community_teams(id),
  format        TEXT NOT NULL CHECK (format IN ('BO1', 'BO3', 'BO5')),
  winner_id     UUID REFERENCES community_teams(id),
  scheduled_at  TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cm_tournament ON community_matches (tournament_id);

-- community_player_stats
CREATE TABLE IF NOT EXISTS community_player_stats (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id          UUID NOT NULL REFERENCES community_matches(id) ON DELETE CASCADE,
  player_profile_id UUID NOT NULL REFERENCES community_player_profile(id) ON DELETE CASCADE,
  kills             INTEGER NOT NULL DEFAULT 0,
  assists           INTEGER NOT NULL DEFAULT 0,
  deaths            INTEGER NOT NULL DEFAULT 0,
  rating            NUMERIC(4, 2) NOT NULL DEFAULT 0,
  adr               NUMERIC(6, 2) NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, player_profile_id)
);
CREATE INDEX IF NOT EXISTS idx_cps_match ON community_player_stats (match_id);

-- community_standings
CREATE TABLE IF NOT EXISTS community_standings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES community_tournaments(id) ON DELETE CASCADE,
  team_id       UUID NOT NULL REFERENCES community_teams(id) ON DELETE CASCADE,
  wins          INTEGER NOT NULL DEFAULT 0,
  losses        INTEGER NOT NULL DEFAULT 0,
  draws         INTEGER NOT NULL DEFAULT 0,
  points        INTEGER NOT NULL DEFAULT 0,
  position      INTEGER NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, team_id)
);
CREATE INDEX IF NOT EXISTS idx_cs_tournament ON community_standings (tournament_id);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE lineups               ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineup_players        ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_prices         ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches                ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_round_stats    ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_map_stats      ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings              ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_teams       ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_player_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_team_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_matches        ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_player_stats   ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_standings      ENABLE ROW LEVEL SECURITY;

-- Leitura pública para tabelas de dados de jogo
CREATE POLICY "read_player_prices"      ON player_prices          FOR SELECT USING (true);
CREATE POLICY "read_matches"            ON matches                FOR SELECT USING (true);
CREATE POLICY "read_player_round_stats" ON player_round_stats     FOR SELECT USING (true);
CREATE POLICY "read_player_map_stats"   ON player_map_stats       FOR SELECT USING (true);
CREATE POLICY "read_rankings"           ON rankings               FOR SELECT USING (true);

-- Lineups: usuário vê e gerencia apenas as suas
CREATE POLICY "own_lineups_select" ON lineups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_lineups_insert" ON lineups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_lineups_update" ON lineups FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_lineups_delete" ON lineups FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "own_lineup_players_select" ON lineup_players FOR SELECT
  USING (EXISTS (SELECT 1 FROM lineups l WHERE l.id = lineup_id AND l.user_id = auth.uid()));
CREATE POLICY "own_lineup_players_insert" ON lineup_players FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM lineups l WHERE l.id = lineup_id AND l.user_id = auth.uid()));
CREATE POLICY "own_lineup_players_delete" ON lineup_players FOR DELETE
  USING (EXISTS (SELECT 1 FROM lineups l WHERE l.id = lineup_id AND l.user_id = auth.uid()));

-- Comunidade: leitura pública, escrita autenticada
CREATE POLICY "read_community_tournaments"  ON community_tournaments FOR SELECT USING (true);
CREATE POLICY "create_community_tournament" ON community_tournaments FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "update_community_tournament" ON community_tournaments FOR UPDATE
  USING (auth.uid() = organizer_id);

CREATE POLICY "read_community_teams"  ON community_teams FOR SELECT USING (true);
CREATE POLICY "create_community_team" ON community_teams FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "read_community_player_profile"  ON community_player_profile FOR SELECT USING (true);
CREATE POLICY "own_community_player_profile"   ON community_player_profile FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "read_community_team_members"  ON community_team_members FOR SELECT USING (true);
CREATE POLICY "create_community_team_member" ON community_team_members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "read_community_matches"  ON community_matches FOR SELECT USING (true);
CREATE POLICY "read_community_player_stats" ON community_player_stats FOR SELECT USING (true);
CREATE POLICY "read_community_standings"    ON community_standings FOR SELECT USING (true);
