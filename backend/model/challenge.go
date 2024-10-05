package model

const (
	QuestionSessionNotStarted = "NOT_STARTED"
	QuestionSessionInProgress = "IN_PROGRESS"
	QuestionSessionFinished   = "FINISHED"
)

const (
	ChallengeDifficultyEasy   = "EASY"
	ChallengeDifficultyMedium = "MEDIUM"
	ChallengeDifficultyHard   = "HARD"
)

type WeeklyChallenge struct {
	Id   int64 `db:"id"`
	Year int   `db:"yearTime"`
	Week int   `db:"weekTime"`
}

type WeeklyQuestionsTopics struct {
	Id          int64  `db:"id"`
	TopicId     int64  `db:"id"`
	ChallengeId int64  `db:"weeklyChallengeId"`
	Name        string `db:"name"`
	Description string `db:"description"`
	Language    string `db:"language"`
	Difficulty  string `db:"difficulty"`
}

type WeeklyQuestions struct {
	Id            int64  `db:"id"`
	TopicId       int64  `db:"topicId"`
	Content       string `db:"content"`
	Choices_      string `db:"choices"`
	Point         int    `db:"point"`
	CorrectChoice int    `db:"correctChoice"`
	Explanation   string `db:"explanation"`
	CreatedAt     int64  `db:"createdAt"`
}

type ChallengeGroups struct {
	Id          int64  `db:"id"`
	Name        string `db:"name"`
	Description string `db:"description"`
	CreatedAt   int64  `db:"createdAt"`
}

type ChallengeGroupMembers struct {
	Id       int64 `db:"id"`
	GroupId  int64 `db:"groupId"`
	UserId   int64 `db:"userId"`
	IsLeader bool  `db:"isLeader"`
}

type DetailedGroupMembers struct {
	Id             int64
	GroupId        int64
	UserId         int64
	IsLeader       bool
	Username       string
	PointsThisWeek int
	QuestionsDone  []int64
}

type ChallengeGroup struct {
	Id          int64
	Name        string
	Description string
	Members     []ChallengeGroupMembers
	CreatedAt   int64
}

type WeeklyQuestionsSessions struct {
	Id          int64  `db:"id"`
	UserId      int64  `db:"userId"`
	QuestionId  int64  `db:"questionId"`
	ChallengeId int64  `db:"challengeId"`
	GroupId     *int64 `db:"groupId"`
	Attempt     int    `db:"attempt"`
	State       string `db:"state"`
	IsLatest    bool   `db:"isLatest"`
	Score       int    `db:"score"`
	StartedAt   int64  `db:"startedAt"`
	FinishedAt  *int64 `db:"finishedAt"`
}

type WeeklyQuestionsAnswers struct {
	Id              int64  `db:"id"`
	UserId          int64  `db:"userId"`
	QuestionId      int64  `db:"questionId"`
	Answer          *int   `db:"answer"`
	SessionId       int64  `db:"sessionId"`
	TimeDone        *int64 `db:"timeDone"`
	FirstAccessTime int64  `db:"firstAccessTime"`
	FirstAnswerTime *int64 `db:"firstAnswerTime"`
	CreatedAt       int64  `db:"createdAt"`
}
