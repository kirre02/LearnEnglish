CREATE TABLE users (id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password_hash)
VALUES
    ('coder1', 'coder1@example.com', 'hashed_password1'),
    ('coder2', 'coder2@example.com', 'hashed_password2'),
    ('coder3', 'coder3@example.com', 'hashed_password3'),
    ('coder4', 'coder4@example.com', 'hashed_password4'),
    ('coder5', 'coder5@example.com', 'hashed_password5'),
    ('coder6', 'coder6@example.com', 'hashed_password6');

<<<<<<< HEAD
-- LÄGG TILL DENNA DEL FÖR RESULTS TABELLEN
CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    user_id INT,
    score INT,
    total INT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Testdata för results (valfritt)
INSERT INTO results (user_id, score, total) VALUES
(1, 8, 10),
(1, 6, 10),
(2, 9, 10),
(1, 7, 10);
=======
CREATE TABLE IF NOT EXISTS words (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50),
    english_word VARCHAR(100) NOT NULL,
    correct_swedish VARCHAR(100) NOT NULL,
    wrong1 VARCHAR(100) NOT NULL,
    wrong2 VARCHAR(100) NOT NULL,
    wrong3 VARCHAR(100) NOT NULL
);
>>>>>>> 5-audio-support
