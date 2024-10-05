-- START: Initial tables
CREATE TABLE users (
    id BIGINT NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    interviewQuestionStatus ENUM('NOT_STARTED', 'QUESTIONS_NOT_READY', 'IN_PROGRESS', 'SUCCESS') DEFAULT 'NOT_STARTED' NOT NULL,
    interviewQuestionStatusLastUpdatedAt BIGINT NOT NULL,
    skillDescription MEDIUMTEXT NOT NULL,
    skillInfo MEDIUMTEXT,
    filledSkillInfo BOOLEAN NOT NULL DEFAULT FALSE,
    skillTreeStatus ENUM('NOT_STARTED', 'NOT_READY', 'IN_PROGRESS', 'SUCCESS') DEFAULT 'NOT_STARTED' NOT NULL,
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
    title VARCHAR(255) NOT NULL,
    childSkillTreeIds TEXT NOT NULL COMMENT 'comma separated list of skill tree ids',
    questionStatus ENUM ('NOT_STARTED', 'GENERATING', 'IN_PROGRESS', 'SUCCESS') DEFAULT 'NOT_STARTED' NOT NULL,
    finished BOOLEAN NOT NULL DEFAULT FALSE,
    isRoot BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt BIGINT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
) ENGINE = InnoDB;

CREATE TABLE skillTreeEntries (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    skillTreeId BIGINT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content MEDIUMTEXT DEFAULT NULL,
    contentStatus ENUM('NONE', 'GENERATING', 'GENERATED') DEFAULT 'NONE' NOT NULL,
    createdAt BIGINT NOT NULL,
    FOREIGN KEY (skillTreeId) REFERENCES skillTrees(id)
) ENGINE = InnoDB;

CREATE TABLE skillTreeQuestions (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    skillTreeId BIGINT NOT NULL,
    content MEDIUMTEXT NOT NULL,
    choices MEDIUMTEXT NOT NULL,
    correctChoice INT NOT NULL,
    userAnswer INT,
    explanation TEXT NOT NULL,
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

CREATE TABLE weeklyChallenges (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    yearTime INT NOT NULL,
    weekTime INT NOT NULL
) ENGINE = InnoDB;

CREATE TABLE weeklyQuestionsTopics (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    language VARCHAR(255) NOT NULL,
    difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL,
    weeklyChallengeId BIGINT NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (weeklyChallengeId) REFERENCES weeklyChallenges(id)
) ENGINE = InnoDB;

CREATE TABLE weeklyQuestions (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    topicId BIGINT NOT NULL,
    content MEDIUMTEXT NOT NULL,
    choices MEDIUMTEXT NOT NULL,
    point INT NOT NULL DEFAULT 1,
    correctChoice INT NOT NULL,
    explanation TEXT NOT NULL,
    createdAt BIGINT NOT NULL,
    FOREIGN KEY (topicId) REFERENCES weeklyQuestionsTopics(id)
) ENGINE = InnoDB;

CREATE TABLE challengeGroups (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    createdAt BIGINT NOT NULL
) ENGINE = InnoDB;

CREATE TABLE challengeGroupMembers (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userId BIGINT NOT NULL,
    groupId BIGINT NOT NULL,
    isLeader BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (groupId) REFERENCES challengeGroups(id)
) ENGINE = InnoDB;

CREATE TABLE weeklyQuestionsSessions (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userId BIGINT NOT NULL,
    challengeId BIGINT NOT NULL,
    questionId BIGINT NOT NULL,
    groupId INT NOT NULL DEFAULT 0,
    attempt INT NOT NULL DEFAULT 1,
    isLatest BOOLEAN NOT NULL DEFAULT TRUE,
    state ENUM('NOT_STARTED', 'IN_PROGRESS', 'FINISHED') DEFAULT 'NOT_STARTED' NOT NULL,
    score INT NOT NULL DEFAULT 0,
    startedAt BIGINT NOT NULL,
    finishedAt BIGINT,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (questionId) REFERENCES weeklyQuestions(id)
) ENGINE = InnoDB;

CREATE TABLE weeklyQuestionsAnswers (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userId BIGINT NOT NULL,
    questionId BIGINT NOT NULL,
    answer INT,
    firstAccessTime BIGINT NOT NULL,
    firstAnswerTime BIGINT,
    timeDone BIGINT,
    sessionId BIGINT NOT NULL,
    createdAt BIGINT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (questionId) REFERENCES weeklyQuestions(id),
    FOREIGN KEY (sessionId) REFERENCES weeklyQuestionsSessions(id)
) ENGINE = InnoDB;

ALTER TABLE interviewQuestions ADD COLUMN topicType VARCHAR(255) NOT NULL;
ALTER TABLE interviewQuestions ADD COLUMN topicLanguage VARCHAR(255) NOT NULL;

-- END
-- START: Initial data