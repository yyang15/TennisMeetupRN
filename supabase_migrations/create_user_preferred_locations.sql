-- Create user_preferred_locations table
CREATE TABLE user_preferred_locations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, location_name)
);

-- Index for fast lookup by user
CREATE INDEX idx_user_preferred_locations_user_id ON user_preferred_locations(user_id);
