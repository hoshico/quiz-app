-- users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  nickname TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- questions
CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  question TEXT,
  options TEXT, -- JSON.stringify した配列として保存
  correct_answer TEXT
);

-- answers
CREATE TABLE answers (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  question_id TEXT,
  answer TEXT,
  is_correct BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
