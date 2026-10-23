-- Move-Tune / Air Piano database schema
-- This file creates the tables used by the application.
-- Run this on a MySQL server with permission to create/use the move_tune database.
--
-- If your online SQL editor does not allow CREATE DATABASE or USE,
-- remove those two statements and run the remaining statements in its default database.

CREATE DATABASE IF NOT EXISTS move_tune;
USE move_tune;

-- 1. User accounts. Store a password hash, never a plain-text password.
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Song library
CREATE TABLE IF NOT EXISTS songs (
    song_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    artist VARCHAR(100),
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Easy',
    lyrics TEXT,
    audio_file_path VARCHAR(255)
);

-- 3. Notes belonging to each song
CREATE TABLE IF NOT EXISTS song_notes (
    note_id INT AUTO_INCREMENT PRIMARY KEY,
    song_id INT NOT NULL,
    note_order INT NOT NULL,
    pitch VARCHAR(10) NOT NULL,
    duration_ms INT DEFAULT 300,
    FOREIGN KEY (song_id) REFERENCES songs(song_id)
        ON DELETE CASCADE
);

-- 4. A record for each playing session
CREATE TABLE IF NOT EXISTS performances (
    performance_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    song_id INT,
    score INT DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0.00,
    duration_seconds INT DEFAULT 0,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (song_id) REFERENCES songs(song_id)
);

-- 5. Progress for each user and song
CREATE TABLE IF NOT EXISTS user_song_progress (
    user_id INT NOT NULL,
    song_id INT NOT NULL,
    best_score INT DEFAULT 0,
    times_played INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (user_id, song_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (song_id) REFERENCES songs(song_id)
);

-- 6. Daily practice tracking (one row per user per date)
CREATE TABLE IF NOT EXISTS daily_activity (
    user_id INT NOT NULL,
    activity_date DATE NOT NULL,
    minutes_practiced INT DEFAULT 0,
    PRIMARY KEY (user_id, activity_date),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
