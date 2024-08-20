package model

import "strings"

type InterviewQuestion struct {
	Id            int64  `db:"id"`
	UserId        int64  `db:"userId"`
	Content       string `db:"content"`
	Choices_      string `db:"choices"`
	CorrectChoice int    `db:"correctChoice"`
	CreatedAt     int64  `db:"createdAt"`
	UserAnswer    *int   `db:"userAnswer"`
}

func (q *InterviewQuestion) Choices() []string {
	return strings.Split(q.Choices_, ",")
}
