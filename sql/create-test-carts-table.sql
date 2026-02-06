-- Create test_carts table (similar to carts table but for tests/series)
CREATE TABLE IF NOT EXISTS public.test_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    test_id UUID NOT NULL,
    test_title TEXT NOT NULL,
    test_price DECIMAL(10,2) NOT NULL,
    test_type TEXT NOT NULL CHECK (test_type IN ('individual', 'series')),
    series_id UUID,
    test_image TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_test_per_user UNIQUE(user_id, test_id, test_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_carts_user_id ON public.test_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_carts_test_id ON public.test_carts(test_id);
CREATE INDEX IF NOT EXISTS idx_test_carts_added_at ON public.test_carts(added_at);

-- Enable RLS
ALTER TABLE public.test_carts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own test cart
CREATE POLICY "Users can view own test cart" ON public.test_carts
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert into their own test cart
CREATE POLICY "Users can add to own test cart" ON public.test_carts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete from their own test cart
CREATE POLICY "Users can delete from own test cart" ON public.test_carts
    FOR DELETE USING (auth.uid() = user_id);
