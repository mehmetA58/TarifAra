-- Favorites: one row per meal
CREATE TABLE user_favorites (
  user_id  uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_id  text NOT NULL,
  added_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, meal_id)
);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Weekly plan: one JSONB row per user (upsert)
CREATE TABLE user_plans (
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  plan       jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own" ON user_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "upsert_own" ON user_plans
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
