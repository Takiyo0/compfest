package model

import (
	"encoding/json"
)

type InterviewQuestion struct {
	Id            int64  `db:"id"`
	UserId        int64  `db:"userId"`
	Topic         string `db:"topic"`
	Content       string `db:"content"`
	Choices_      string `db:"choices"`
	CorrectChoice int    `db:"correctChoice"`
	CreatedAt     int64  `db:"createdAt"`
	UserAnswer    *int   `db:"userAnswer"`
	Explanation   string `db:"explanation"`
}

func (q *InterviewQuestion) Choices() ([]string, error) {
	var ret []string
	if err := json.Unmarshal([]byte(q.Choices_), &ret); err != nil {
		return nil, err
	}
	return ret, nil
}
