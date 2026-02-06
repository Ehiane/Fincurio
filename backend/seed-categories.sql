INSERT INTO categories (id, name, display_name, type, icon, color, sort_order, created_at) VALUES
(gen_random_uuid(), 'Tech', 'Tech', 'expense', 'laptop_mac', '#E6501B', 1, NOW()),
(gen_random_uuid(), 'Groceries', 'Nourishment', 'expense', 'restaurant', '#280905', 2, NOW()),
(gen_random_uuid(), 'Salary', 'Salary', 'income', 'payments', '#10B981', 3, NOW()),
(gen_random_uuid(), 'Dining', 'Dining', 'expense', 'local_cafe', '#F59E0B', 4, NOW()),
(gen_random_uuid(), 'Subscription', 'Subscription', 'expense', 'music_note', '#8B5CF6', 5, NOW()),
(gen_random_uuid(), 'Transport', 'Transport', 'expense', 'commute', '#3B82F6', 6, NOW()),
(gen_random_uuid(), 'Shelter', 'Shelter', 'expense', 'home', '#6B7280', 7, NOW()),
(gen_random_uuid(), 'Wellness', 'Wellness', 'expense', 'spa', '#EC4899', 8, NOW()),
(gen_random_uuid(), 'Culture', 'Culture', 'expense', 'theater_comedy', '#14B8A6', 9, NOW());
