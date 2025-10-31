SET NAMES utf8mb4;

-- Uppdatera kategorinamnet med korrekta tecken
UPDATE categories SET name = 'Färger' WHERE id = 1;

-- Ta bort gamla ord
DELETE FROM words WHERE category_id = 1;

-- Lägg in orden med korrekta svenska tecken
INSERT INTO words (english, swedish, category_id, wrong_options) VALUES
('red', 'röd', 1, '["blå", "grön", "gul"]'),
('blue', 'blå', 1, '["röd", "vit", "svart"]'),
('green', 'grön', 1, '["gul", "blå", "röd"]'),
('yellow', 'gul', 1, '["röd", "blå", "grå"]'),
('black', 'svart', 1, '["vit", "grå", "röd"]'),
('white', 'vit', 1, '["svart", "grå", "gul"]'),
('brown', 'brun', 1, '["grå", "svart", "vit"]'),
('orange', 'orange', 1, '["röd", "gul", "rosa"]'),
('purple', 'lila', 1, '["rosa", "blå", "grön"]'),
('pink', 'rosa', 1, '["röd", "orange", "vit"]'),
('gray', 'grå', 1, '["vit", "brun", "svart"]'),
('gold', 'guld', 1, '["silver", "brons", "gul"]'),
('silver', 'silver', 1, '["grå", "vit", "guld"]'),
('beige', 'beige', 1, '["brun", "grå", "vit"]'),
('light blue', 'ljusblå', 1, '["mörkblå", "grön", "vit"]'),
('dark green', 'mörkgrön', 1, '["ljusgrön", "blå", "svart"]'),
('turquoise', 'turkos', 1, '["blå", "grön", "lila"]'),
('violet', 'violett', 1, '["rosa", "lila", "blå"]'),
('navy', 'marinblå', 1, '["ljusblå", "svart", "grå"]'),
('cream', 'krämfärgad', 1, '["vit", "beige", "gul"]');
