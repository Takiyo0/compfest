package model

type User struct {
	ID                                   int64  `db:"id"`
	Name                                 string `db:"name"`
	InterviewQuestionStatus              string `db:"interviewQuestionStatus"`
	InterviewQuestionStatusLastUpdatedAt int64  `db:"interviewQuestionStatusLastUpdatedAt"`
	CreatedAt                            int64  `db:"createdAt"`
}
