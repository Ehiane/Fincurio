INSERT INTO categories (id, name, display_name, type, icon, color, category_group, sort_order, created_at) VALUES
(gen_random_uuid(), 'Tech', 'Tech', 'expense', 'laptop_mac', '#E6501B', 'Shopping', 1, NOW()),
(gen_random_uuid(), 'Groceries', 'Nourishment', 'expense', 'restaurant', '#280905', 'Food', 2, NOW()),
(gen_random_uuid(), 'Salary', 'Salary', 'income', 'payments', '#10B981', 'Income', 3, NOW()),
(gen_random_uuid(), 'Dining', 'Dining', 'expense', 'local_cafe', '#F59E0B', 'Food', 4, NOW()),
(gen_random_uuid(), 'Subscription', 'Subscription', 'expense', 'music_note', '#8B5CF6', 'Bills', 5, NOW()),
(gen_random_uuid(), 'Transport', 'Transport', 'expense', 'commute', '#3B82F6', 'Travel', 6, NOW()),
(gen_random_uuid(), 'Shelter', 'Shelter', 'expense', 'home', '#6B7280', 'Housing', 7, NOW()),
(gen_random_uuid(), 'Wellness', 'Wellness', 'expense', 'spa', '#EC4899', 'Health', 8, NOW()),
(gen_random_uuid(), 'Culture', 'Culture', 'expense', 'theater_comedy', '#14B8A6', 'Leisure', 9, NOW());
