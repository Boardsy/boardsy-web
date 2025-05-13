-- Boardsy Database Setup Script
-- Run this in your Supabase SQL Editor to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create boards table
CREATE TABLE IF NOT EXISTS boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    background_color TEXT,
    owner_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create columns table
CREATE TABLE IF NOT EXISTS columns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    due_date TIMESTAMPTZ,
    created_by UUID NOT NULL,
    assigned_to UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create labels table
CREATE TABLE IF NOT EXISTS labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE
);

-- Create card_labels junction table
CREATE TABLE IF NOT EXISTS card_labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
    UNIQUE(card_id, label_id)
);

-- Create board_members table to manage permissions
CREATE TABLE IF NOT EXISTS board_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
    UNIQUE(board_id, user_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER set_timestamp_boards
BEFORE UPDATE ON boards
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_columns
BEFORE UPDATE ON columns
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_cards
BEFORE UPDATE ON cards
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Create Row Level Security (RLS) policies
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

-- Board access policy
CREATE POLICY "Users can view their own boards and boards they are members of"
ON boards FOR SELECT
USING (
    owner_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM board_members 
        WHERE board_id = boards.id AND user_id = auth.uid()
    )
);

CREATE POLICY "Owners can update their own boards"
ON boards FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their own boards"
ON boards FOR DELETE
USING (owner_id = auth.uid());

CREATE POLICY "Users can insert boards"
ON boards FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- Column access policies
CREATE POLICY "Users can access columns of boards they have access to"
ON columns FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM boards
        WHERE boards.id = columns.board_id AND (
            boards.owner_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM board_members
                WHERE board_members.board_id = boards.id AND board_members.user_id = auth.uid()
            )
        )
    )
);

-- Card access policies
CREATE POLICY "Users can access cards of boards they have access to"
ON cards FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM columns
        JOIN boards ON boards.id = columns.board_id
        WHERE columns.id = cards.column_id AND (
            boards.owner_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM board_members
                WHERE board_members.board_id = boards.id AND board_members.user_id = auth.uid()
            )
        )
    )
);

-- Labels access policies
CREATE POLICY "Users can access labels of boards they have access to"
ON labels FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM boards
        WHERE boards.id = labels.board_id AND (
            boards.owner_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM board_members
                WHERE board_members.board_id = boards.id AND board_members.user_id = auth.uid()
            )
        )
    )
);

-- Card_labels access policies
CREATE POLICY "Users can access card_labels of boards they have access to"
ON card_labels FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM cards
        JOIN columns ON columns.id = cards.column_id
        JOIN boards ON boards.id = columns.board_id
        WHERE cards.id = card_labels.card_id AND (
            boards.owner_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM board_members
                WHERE board_members.board_id = boards.id AND board_members.user_id = auth.uid()
            )
        )
    )
);

-- Board_members access policies
CREATE POLICY "Board owners can manage board members"
ON board_members FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM boards
        WHERE boards.id = board_members.board_id AND boards.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can see which boards they are members of"
ON board_members FOR SELECT
USING (user_id = auth.uid());