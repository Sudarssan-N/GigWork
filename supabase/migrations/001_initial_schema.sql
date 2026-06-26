-- GigWork initial schema

CREATE TYPE user_role AS ENUM ('customer', 'worker', 'admin');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE task_status AS ENUM ('open', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE booking_status AS ENUM ('pending_payment', 'paid', 'in_progress', 'completed', 'disputed', 'refunded');
CREATE TYPE payment_status AS ENUM ('created', 'captured', 'failed', 'refunded');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'customer',
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    city TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE worker_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    hourly_rate INTEGER,
    verification_status verification_status NOT NULL DEFAULT 'pending',
    id_doc_url TEXT,
    availability JSONB DEFAULT '{}',
    rating_avg NUMERIC(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    budget_min INTEGER,
    budget_max INTEGER,
    scheduled_at TIMESTAMPTZ,
    duration_hours NUMERIC(4,1),
    status task_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    proposed_price INTEGER NOT NULL,
    message TEXT,
    status application_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(task_id, worker_id)
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES applications(id),
    customer_id UUID NOT NULL REFERENCES profiles(id),
    worker_id UUID NOT NULL REFERENCES profiles(id),
    agreed_price INTEGER NOT NULL,
    platform_fee INTEGER NOT NULL DEFAULT 0,
    worker_payout INTEGER NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending_payment',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    amount INTEGER NOT NULL,
    fee_amount INTEGER NOT NULL DEFAULT 0,
    status payment_status NOT NULL DEFAULT 'created',
    webhook_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id),
    reviewee_id UUID NOT NULL REFERENCES profiles(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(booking_id, reviewer_id)
);

CREATE TABLE platform_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_status_city ON tasks(status, city);
CREATE INDEX idx_tasks_category ON tasks(category_id);
CREATE INDEX idx_tasks_customer ON tasks(customer_id);
CREATE INDEX idx_applications_task ON applications(task_id);
CREATE INDEX idx_applications_worker ON applications(worker_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_worker ON bookings(worker_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read_at);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER worker_profiles_updated_at BEFORE UPDATE ON worker_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, phone, full_name)
    VALUES (
        NEW.id,
        NEW.phone,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Workers profiles are public" ON profiles
    FOR SELECT USING (role = 'worker');

-- Worker profiles policies
CREATE POLICY "Anyone can view worker profiles" ON worker_profiles
    FOR SELECT USING (true);
CREATE POLICY "Workers can update own profile" ON worker_profiles
    FOR ALL USING (auth.uid() = id);

-- Categories (public read)
CREATE POLICY "Categories are public" ON categories
    FOR SELECT USING (true);

-- Tasks policies
CREATE POLICY "Anyone can view open tasks" ON tasks
    FOR SELECT USING (status = 'open' OR customer_id = auth.uid());
CREATE POLICY "Customers can create tasks" ON tasks
    FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Customers can update own tasks" ON tasks
    FOR UPDATE USING (customer_id = auth.uid());

-- Applications policies
CREATE POLICY "Workers can create applications" ON applications
    FOR INSERT WITH CHECK (worker_id = auth.uid());
CREATE POLICY "Workers can view own applications" ON applications
    FOR SELECT USING (worker_id = auth.uid());
CREATE POLICY "Task owners can view applications" ON applications
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM tasks WHERE tasks.id = applications.task_id AND tasks.customer_id = auth.uid())
    );
CREATE POLICY "Workers can update own applications" ON applications
    FOR UPDATE USING (worker_id = auth.uid());

-- Bookings policies
CREATE POLICY "Involved parties can view bookings" ON bookings
    FOR SELECT USING (customer_id = auth.uid() OR worker_id = auth.uid());

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for own bookings" ON reviews
    FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Platform config (read only for authenticated)
CREATE POLICY "Authenticated users can read config" ON platform_config
    FOR SELECT USING (auth.role() = 'authenticated');

-- Seed data
INSERT INTO platform_config (key, value) VALUES ('convenience_fee_percent', '12');

INSERT INTO categories (name, slug, icon) VALUES
    ('Cleaning', 'cleaning', 'sparkles'),
    ('Moving & Shifting', 'moving', 'truck'),
    ('Kitchen Help', 'kitchen', 'chef-hat'),
    ('Errands', 'errands', 'shopping-bag'),
    ('House Management', 'house-management', 'home'),
    ('Gardening', 'gardening', 'flower'),
    ('Pet Care', 'pet-care', 'paw-print'),
    ('Event Help', 'event-help', 'party-popper');