-- Create carts table to store user shopping cart items
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL, -- Course ID from external system
    course_title TEXT NOT NULL,
    course_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    course_image TEXT,
    quantity INTEGER DEFAULT 1,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_carts_updated_at 
    BEFORE UPDATE ON carts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_carts_course_id ON carts(course_id);
CREATE INDEX idx_carts_added_at ON carts(added_at);

-- Create unique constraint to prevent duplicate cart items
CREATE UNIQUE INDEX idx_carts_user_course ON carts(user_id, course_id);