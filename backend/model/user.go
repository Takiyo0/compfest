package model

import (
	"encoding/json"
	"strings"
)

const (
	InterviewQuestionStatusNotStarted        = "NOT_STARTED"
	InterviewQuestionStatusQuestionsNotReady = "QUESTIONS_NOT_READY"
	InterviewQuestionStatusInProgress        = "IN_PROGRESS"
	InterviewQuestionStatusQuestionsFinished = "SUCCESS"
)

type User struct {
	ID                                   int64   `db:"id"`
	Name                                 string  `db:"name"`
	InterviewQuestionStatus              string  `db:"interviewQuestionStatus"`
	InterviewQuestionStatusLastUpdatedAt int64   `db:"interviewQuestionStatusLastUpdatedAt"`
	SkillDescription                     string  `db:"skillDescription"`
	SkillInfo_                           *string `db:"skillInfo"`

	// Topics_ is a || separated string
	Topics_   string `db:"topics"`
	CreatedAt int64  `db:"createdAt"`
}

func (m User) Topics() []string {
	return strings.Split(m.Topics_, "||")
}

func (m User) SkillInfo() (*SkillInfo, error) {
	if m.SkillInfo_ == nil {
		return &SkillInfo{}, nil
	}
	var si SkillInfo
	if err := json.Unmarshal([]byte(*m.SkillInfo_), &si); err != nil {
		return nil, err
	}
	return &si, nil
}
