-- START: Initial tables
CREATE TABLE users (
    id BIGINT NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    interviewQuestionStatus ENUM('NOT_STARTED', 'QUESTIONS_NOT_READY', 'IN_PROGRESS', 'SUCCESS') DEFAULT 'NOT_STARTED' NOT NULL,
    interviewQuestionStatusLastUpdatedAt BIGINT NOT NULL,
    skillDescription MEDIUMTEXT NOT NULL,
    createdAt BIGINT NOT NULL
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
    userAnswer INT,
    FOREIGN KEY (userId) REFERENCES users(id)
) ENGINE = InnoDB;

CREATE TABLE skillTrees (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userId BIGINT NOT NULL,
    content MEDIUMTEXT NOT NULL COMMENT 'json serialized skill tree',
    childSkillTreeIds TEXT NOT NULL COMMENT 'comma separated list of skill tree ids',
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
    createdAt BIGINT NOT NULL,
    FOREIGN KEY (skillTreeId) REFERENCES skillTrees(id)
) ENGINE = InnoDB;
-- END
-- START: Initial data