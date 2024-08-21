package model

const (
	InterviewQuestionStatusNotStarted        = "NOT_STARTED"
	InterviewQuestionStatusQuestionsNotReady = "QUESTIONS_NOT_READY"
	InterviewQuestionStatusInProgress        = "IN_PROGRESS"
	InterviewQuestionStatusQuestionsFinished = "SUCCESS"
)

type User struct {
	ID                                   int64  `db:"id"`
	Name                                 string `db:"name"`
	InterviewQuestionStatus              string `db:"interviewQuestionStatus"`
	InterviewQuestionStatusLastUpdatedAt int64  `db:"interviewQuestionStatusLastUpdatedAt"`
	SkillDescription                     string `db:"skillDescription"`
	CreatedAt                            int64  `db:"createdAt"`
}
