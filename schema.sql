-- START: Initial tables
CREATE TABLE users (
    id BIGINT NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    interviewQuestionStatus ENUM('NOT_STARTED', 'QUESTIONS_NOT_READY', 'IN_PROGRESS', 'SUCCESS') DEFAULT 'NOT_STARTED' NOT NULL,
    interviewQuestionStatusLastUpdatedAt BIGINT NOT NULL,
    skillDescription MEDIUMTEXT NOT NULL,
    skillInfo MEDIUMTEXT,
    createdAt BIGINT NOT NULL,
    topics TEXT NOT NULL
) ENGINE = InnoDB;

CREATE TABLE sessions (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userId BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expiresAt BIGINT NOT NULL,
    createdAt BIGINT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
) ENGINE = InnoDB;

CREATE TABLE interviewQuestions (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userId BIGINT NOT NULL,
    topic VARCHAR(255) NOT NULL,
    content MEDIUMTEXT NOT NULL,
    choices MEDIUMTEXT NOT NULL,
    correctChoice INT NOT NULL,
    createdAt BIGINT NOT NULL,
    explanation TEXT NOT NULL,
    userAnswer INT,
    FOREIGN KEY (userId) REFERENCES users(id)
) ENGINE = InnoDB;

CREATE TABLE skillTrees (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userId BIGINT NOT NULL,
    content MEDIUMTEXT NOT NULL COMMENT 'json serialized skill tree',
    childSkillTreeIds TEXT NOT NULL COMMENT 'comma separated list of skill tree ids',
    isQuestionsReady BOOLEAN NOT NULL DEFAULT FALSE,
    links MEDIUMTEXT NOT NULL,
    createdAt BIGINT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
) ENGINE = InnoDB;

CREATE TABLE skillTreeQuestions (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    skillTreeId BIGINT NOT NULL,
    content MEDIUMTEXT NOT NULL,
    choices MEDIUMTEXT NOT NULL,
    correctChoice INT NOT NULL,
    userAnswer INT NOT NULL,
    createdAt BIGINT NOT NULL,
    FOREIGN KEY (skillTreeId) REFERENCES skillTrees(id)
) ENGINE = InnoDB;

CREATE TABLE assistantChats (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userId BIGINT NOT NULL,
    title TEXT NOT NULL,
    createdAt BIGINT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
) ENGINE = InnoDB;

CREATE TABLE assistantChatMessages (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    assistantChatId BIGINT NOT NULL,
    role ENUM('USER', 'ASSISTANT') NOT NULL,
    userId BIGINT NOT NULL,
    content TEXT NOT NULL,
    createdAt BIGINT NOT NULL,
    FOREIGN KEY (assistantChatId) REFERENCES assistantChats(id),
    FOREIGN KEY (userId) REFERENCES users(id)
) ENGINE = InnoDB;

-- END
-- START: Initial data