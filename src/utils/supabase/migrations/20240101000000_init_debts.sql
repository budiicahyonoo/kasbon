-- Buat tipe enum untuk membedakan utang dan piutang
CREATE TYPE debt_type AS ENUM ('owed_to_me', 'i_owe');

-- Buat tabel debts
CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type debt_type NOT NULL,
  counterpart_name TEXT NOT NULL,
  amount BIGINT NOT NULL,
  note TEXT,
  due_date DATE,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- Policy: User hanya bisa melihat data miliknya sendiri
CREATE POLICY "Users can view own debts"
  ON debts FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: User hanya bisa menambah data dengan user_id miliknya
CREATE POLICY "Users can insert own debts"
  ON debts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: User hanya bisa mengubah data miliknya
CREATE POLICY "Users can update own debts"
  ON debts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: User hanya bisa menghapus data miliknya
CREATE POLICY "Users can delete own debts"
  ON debts FOR DELETE
  USING (auth.uid() = user_id);