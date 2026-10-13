-- QUIZ ENGINE & ACADEMIC GUIDANCE

DROP DATABASE IF EXISTS physicsAssessment;
CREATE DATABASE physicsAssessment;
USE physicsAssessment;
show tables;
-- 1. BASE DEPENDENCY TABLES

CREATE TABLE users (
    user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
) ENGINE=InnoDB;

CREATE TABLE batches (
    batch_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
) ENGINE=InnoDB;

CREATE TABLE admin_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- 2. QUIZ ENGINE & ACADEMIC GUIDANCE

CREATE TABLE quizzes (
    quiz_id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title              VARCHAR(150) NOT NULL,
    time_limit_minutes SMALLINT UNSIGNED NOT NULL,
    max_questions      SMALLINT UNSIGNED NOT NULL,
    batch_id           INT UNSIGNED NULL,
    is_active          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quiz_batch FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE SET NULL,
    CONSTRAINT chk_quiz_time CHECK (time_limit_minutes BETWEEN 1 AND 300),
    CONSTRAINT chk_quiz_max CHECK (max_questions BETWEEN 1 AND 200)
) ENGINE=InnoDB;

CREATE TABLE Questions (
    question_id    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    quiz_id        BIGINT UNSIGNED NOT NULL,
    question_text  TEXT NOT NULL,
    option_a       VARCHAR(500) NOT NULL,
    option_b       VARCHAR(500) NOT NULL,
    option_c       VARCHAR(500) NULL,
    option_d       VARCHAR(500) NULL,
    correct_option VARCHAR(50) NOT NULL,
    explanation    TEXT NULL,
    CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Results (
    attempt_id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    quiz_id         BIGINT UNSIGNED NOT NULL,
    student_id      BIGINT UNSIGNED NOT NULL,
    correct_count   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    total_questions SMALLINT UNSIGNED NOT NULL,
    mark            DECIMAL(5,2) NOT NULL DEFAULT 0,
    auto_submitted  BOOLEAN NOT NULL DEFAULT FALSE,
    started_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at    DATETIME NULL,
    CONSTRAINT fk_result_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    CONSTRAINT fk_result_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT uq_one_attempt UNIQUE (quiz_id, student_id),
    CONSTRAINT chk_result_mark CHECK (mark BETWEEN 0 AND 100),
    CONSTRAINT chk_result_count CHECK (correct_count <= total_questions)
) ENGINE=InnoDB;

CREATE TABLE Student_Response (
    answer_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    attempt_id      BIGINT UNSIGNED NOT NULL,
    question_id     BIGINT UNSIGNED NOT NULL,
    selected_option VARCHAR(50) NULL,
    is_correct      BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_response_result FOREIGN KEY (attempt_id) REFERENCES Results(attempt_id) ON DELETE CASCADE,
    CONSTRAINT fk_response_question FOREIGN KEY (question_id) REFERENCES Questions(question_id) ON DELETE CASCADE,
    CONSTRAINT uq_student_response UNIQUE (attempt_id, question_id)
) ENGINE=InnoDB;


ALTER TABLE Results DROP FOREIGN KEY fk_result_student;

SELECT * FROM Questions;